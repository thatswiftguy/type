import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import {
  DURATIONS,
  buildTest,
  reduce,
  start,
  tally,
  wpm,
  type Mode,
  type Sample,
  type Tally,
} from "./engine.ts";
import type { Passage } from "./text.ts";
import "./typing.css";

/**
 * A typing drill.
 *
 * Input comes through a real `<input>` laid invisibly over the page rather
 * than a window-level key listener: it is the only thing a phone will raise a
 * keyboard for. It holds nothing, though. Every change is read, dispatched and
 * then wiped, which makes it a source of characters and never a second copy of
 * the text — the state in the reducer is the only copy there is.
 *
 * The caret is ours too, not the input's: a bar positioned over the letter the
 * cursor sits on, which slides there. That slide is most of what makes the
 * page feel like anything at all.
 */
/** What a finished run was worth, handed to `onFinish`. */
export interface Outcome {
  /** Net speed: five correct characters to a word. */
  wpm: number;
  /** Speed with the mistakes counted as though they were right. */
  raw: number;
  /** Percentage of keystrokes that landed on the right letter. */
  accuracy: number;
  seconds: number;
  correct: number;
  wrong: number;
  missed: number;
  mode: Mode;
  samples: Sample[];
}

export interface TypingProps {
  /** Above the heading — a back link, a logo, a breadcrumb. Yours to style. */
  lead?: ReactNode;
  /** The heading. Left out, no heading is rendered. */
  title?: ReactNode;
  /** The line under the heading. Left out, no line is rendered. */
  blurb?: ReactNode;
  /** Which drill opens. Default `"words"`. */
  defaultMode?: Mode;
  /** Which length opens, in seconds. Default `30`. */
  defaultSeconds?: number;
  /** Lengths offered, in seconds. Default `[15, 30, 60]`. */
  durations?: readonly number[];
  /** Your own word pool. Falls back to the built-in one. */
  words?: string[];
  /** Your own passages. Falls back to the built-in ones. */
  passages?: Passage[];
  /** Called once each time a run ends. */
  onFinish?: (outcome: Outcome) => void;
  /** Added to the root element, for width and placement. */
  className?: string;
}

export function Typing({
  lead,
  title,
  blurb,
  defaultMode = "words",
  defaultSeconds = 30,
  durations = DURATIONS,
  // Not `words`: that name belongs to the words of the test itself, below.
  words: pool,
  passages,
  onFinish,
  className,
}: TypingProps = {}) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [seconds, setSeconds] = useState<number>(defaultSeconds);
  // Lazily: the second argument to useReducer is evaluated on every render,
  // and a fresh word list built ten times a second is work for nobody.
  const [state, dispatch] = useReducer(reduce, null, () =>
    start(buildTest(defaultMode, { words: pool, passages })),
  );

  /** A new test of the given kind, drawn from whatever text is in use. */
  const make = (next: Mode) => buildTest(next, { words: pool, passages });
  const [focused, setFocused] = useState(true);

  const { active, done, elapsed, samples, startedAt, typed, words } = state;
  const running = startedAt !== null && !done;
  const limit = mode === "words" ? seconds : Infinity;

  const inputRef = useRef<HTMLInputElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);

  const focus = () => inputRef.current?.focus();

  const restart = (fresh: boolean) => {
    dispatch({ kind: "reset", test: fresh ? make(mode) : undefined });
    focus();
  };

  // ── input ──────────────────────────────────────────────────────────────

  /**
   * The input is emptied on the way out. Anything the browser put in it is a
   * keystroke that has now been dealt with, and leaving it there would mean
   * reading it again on the next change.
   */
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    event.target.value = "";
    if (text) dispatch({ kind: "type", text, now: performance.now() });
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    // Shift+Tab is deliberately left alone: it is the way out of the input for
    // anyone driving the page from the keyboard.
    if (event.key === "Tab" && !event.shiftKey) {
      event.preventDefault();
      restart(true);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      restart(false);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (done) restart(true);
      return;
    }
    if (event.key === "Backspace") {
      // Handled here rather than through the value: the input is always empty,
      // so there is nothing in it for the browser to delete.
      event.preventDefault();
      dispatch({
        kind: "back",
        whole: event.altKey || event.ctrlKey || event.metaKey,
      });
    }
  };

  /** Start typing anywhere on the page and the first letter still counts. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const input = inputRef.current;
      if (!input || document.activeElement === input) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.length !== 1) return;
      // Focus lands after this event, so the character would go with it: take
      // it now and hand it over by hand.
      event.preventDefault();
      input.focus();
      dispatch({ kind: "type", text: event.key, now: performance.now() });
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(focus, []);

  // ── the clock ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (startedAt === null || done) return;
    const id = window.setInterval(
      () => dispatch({ kind: "tick", now: performance.now(), limit }),
      100,
    );
    return () => window.clearInterval(id);
  }, [done, limit, startedAt]);

  // ── caret and line scrolling ───────────────────────────────────────────

  const [shift, setShift] = useState(0);
  const [caret, setCaret] = useState({ x: 0, y: 0, h: 0 });
  const [width, setWidth] = useState(0);

  /**
   * The track is held in state rather than a ref so the observer can follow
   * it. The element is unmounted every time a run ends — the result screen
   * takes its place — and a new one mounts on the restart, which would leave
   * an observer set up once at mount watching a node no longer in the page.
   */
  const [track, setTrack] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!track || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    observer.observe(track);
    return () => observer.disconnect();
  }, [track]);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const word = wordRef.current;
    if (!anchor || !word) return;

    // A word is a flex item holding one line, so its box is exactly one line
    // tall. That saves measuring the line height any other way.
    const line = word.offsetHeight;
    // Hold the line being typed in the middle of the three on show — until
    // there is a line above it, there is nothing to scroll under.
    setShift(Math.max(0, word.offsetTop - line));
    setCaret({ x: anchor.offsetLeft, y: anchor.offsetTop, h: line });
  }, [active, done, typed, width, words]);

  // ── what the numbers say ───────────────────────────────────────────────

  const count = useMemo(
    () => tally(words, typed, active),
    [active, typed, words],
  );

  const speed = startedAt === null ? 0 : wpm(count.correct, elapsed);
  const raw =
    startedAt === null ? 0 : wpm(count.correct + count.wrong, elapsed);
  const accuracy =
    state.all === 0 ? 100 : Math.round((state.hit / state.all) * 100);
  const progress =
    mode === "words"
      ? Math.min(1, elapsed / seconds)
      : Math.min(1, active / Math.max(1, words.length));

  // ── reporting ──────────────────────────────────────────────────────────

  const latest = useRef<Outcome | null>(null);
  const report = useRef(onFinish);

  // No dependency list, so both are refreshed on every render — and before
  // the effect below, because effects fire in the order they are declared.
  useEffect(() => {
    report.current = onFinish;
    latest.current = {
      wpm: speed,
      raw,
      accuracy,
      seconds: elapsed,
      correct: count.correct,
      wrong: count.wrong,
      missed: count.missed,
      mode,
      samples,
    };
  });

  /**
   * Once per run, and only once. `done` is the whole dependency list on
   * purpose: an inline `onFinish` is a new function on every render, and the
   * numbers go on settling for a frame after the clock stops — either one in
   * the list would report the same run twice.
   */
  useEffect(() => {
    if (done && latest.current) report.current?.(latest.current);
  }, [done]);

  // ── the text ───────────────────────────────────────────────────────────

  /**
   * Held apart from the clock on purpose. The words are a few thousand spans
   * and the clock ticks ten times a second; memoising here means a tick
   * re-renders the readout and leaves the text alone.
   */
  const text = useMemo(
    () =>
      words.map((word, i) => {
        const attempt = typed[i] ?? "";
        const here = i === active && !done;
        const extra =
          attempt.length > word.length ? attempt.slice(word.length) : "";

        return (
          <span
            className={here ? "ty-word ty-word--here" : "ty-word"}
            key={i}
            ref={here ? wordRef : undefined}
          >
            {[...word].map((letter, j) => {
              const got = attempt[j];
              const mark =
                got === undefined
                  ? i < active
                    ? "skip"
                    : "idle"
                  : got === letter
                    ? "ok"
                    : "bad";

              return (
                <span
                  className={`ty-c ty-c--${mark}`}
                  key={j}
                  ref={here && j === attempt.length ? anchorRef : undefined}
                >
                  {letter}
                </span>
              );
            })}

            {[...extra].map((letter, j) => (
              <span
                className="ty-c ty-c--over"
                key={`+${j}`}
                ref={
                  here && word.length + j === attempt.length
                    ? anchorRef
                    : undefined
                }
              >
                {letter}
              </span>
            ))}

            {/* Zero-width, so the caret has somewhere to sit at a word's end. */}
            <span
              aria-hidden="true"
              className="ty-c ty-c--tail"
              ref={
                here && attempt.length >= word.length + extra.length
                  ? anchorRef
                  : undefined
              }
            />
          </span>
        );
      }),
    [active, done, typed, words],
  );

  // ── controls ───────────────────────────────────────────────────────────

  const pick = (next: Mode) => {
    setMode(next);
    dispatch({ kind: "reset", test: make(next) });
    focus();
  };

  const setLength = (next: number) => {
    setSeconds(next);
    dispatch({ kind: "reset", test: make(mode) });
    focus();
  };

  return (
    <section className={className ? `ty ${className}` : "ty"}>
      {(lead || title || blurb) && (
        <header className="ty-head">
          {lead}
          {title && <h1 className="ty-title">{title}</h1>}
          {blurb && <p className="ty-sub">{blurb}</p>}
        </header>
      )}

      <div className={running ? "ty-bar ty-bar--away" : "ty-bar"}>
        <div className="ty-seg" role="group" aria-label="Text">
          <button
            className={mode === "words" ? "ty-opt ty-opt--on" : "ty-opt"}
            onClick={() => pick("words")}
            type="button"
          >
            words
          </button>
          <button
            className={mode === "prose" ? "ty-opt ty-opt--on" : "ty-opt"}
            onClick={() => pick("prose")}
            type="button"
          >
            passage
          </button>
        </div>

        {mode === "words" && (
          <div className="ty-seg" role="group" aria-label="Length">
            {durations.map((length) => (
              <button
                className={seconds === length ? "ty-opt ty-opt--on" : "ty-opt"}
                key={length}
                onClick={() => setLength(length)}
                type="button"
              >
                {length}s
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={running ? "ty-stage ty-stage--live" : "ty-stage"}>
        {!done && (
          <div className="ty-read">
            <span className="ty-read__clock">
              {mode === "words"
                ? `${Math.ceil(Math.max(0, seconds - elapsed))}s`
                : `${Math.min(active + 1, words.length)}/${words.length}`}
            </span>
            <span className="ty-read__stat">
              <b>{Math.round(speed)}</b> wpm
            </span>
            <span className="ty-read__stat">
              <b>{accuracy}</b>% acc
            </span>
          </div>
        )}

        {done ? (
          <Result
            accuracy={accuracy}
            count={count}
            elapsed={elapsed}
            onAgain={() => restart(false)}
            onNew={() => restart(true)}
            raw={raw}
            samples={samples}
            speed={speed}
          />
        ) : (
          <div
            className={focused ? "ty-field" : "ty-field ty-field--blur"}
            onClick={focus}
          >
            <div className="ty-view">
              <div
                className="ty-track"
                ref={setTrack}
                style={{ transform: `translateY(${-shift}px)` }}
              >
                {text}
                <span
                  className={running ? "ty-caret ty-caret--live" : "ty-caret"}
                  style={{
                    height: `${caret.h}px`,
                    transform: `translate(${caret.x}px, ${caret.y}px)`,
                  }}
                />
              </div>
            </div>

            <p className="ty-wake">click here, or just start typing</p>
          </div>
        )}

        <div className="ty-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>

      <div className="ty-foot">
        <p className="ty-hint">
          <kbd>tab</kbd> new text <span aria-hidden="true">·</span>{" "}
          <kbd>esc</kbd> restart
        </p>
        {state.source && !done && <p className="ty-source">{state.source}</p>}
      </div>

      {/* Invisible, but present and focusable — and over the page rather than
          off the edge of it, so focusing it on a phone does not throw the
          scroll position somewhere strange. */}
      <input
        aria-label="Typing test"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        className="ty-input"
        onBlur={() => setFocused(false)}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onKeyDown={onKeyDown}
        ref={inputRef}
        spellCheck={false}
      />
    </section>
  );
}

/** The end of a run: the numbers, the curve they drew, and a way to go again. */
function Result({
  accuracy,
  count,
  elapsed,
  onAgain,
  onNew,
  raw,
  samples,
  speed,
}: {
  accuracy: number;
  count: Tally;
  elapsed: number;
  onAgain: () => void;
  onNew: () => void;
  raw: number;
  samples: Sample[];
  speed: number;
}) {
  return (
    <div className="ty-result">
      <div className="ty-score">
        <p className="ty-score__label">words per minute</p>
        <p className="ty-score__value">{Math.round(speed)}</p>
      </div>

      <Curve samples={samples} />

      <dl className="ty-facts">
        <div className="ty-fact">
          <dt>accuracy</dt>
          <dd>{accuracy}%</dd>
        </div>
        <div className="ty-fact">
          <dt>raw</dt>
          <dd>{Math.round(raw)}</dd>
        </div>
        <div className="ty-fact">
          <dt>characters</dt>
          <dd>
            {count.correct}
            <span className="ty-fact__slash">/</span>
            <span className="ty-fact__bad">{count.wrong + count.missed}</span>
          </dd>
        </div>
        <div className="ty-fact">
          <dt>time</dt>
          <dd>{elapsed.toFixed(1)}s</dd>
        </div>
      </dl>

      <div className="ty-again">
        <button className="ty-go ty-go--lead" onClick={onAgain} type="button">
          Again
        </button>
        <button className="ty-go" onClick={onNew} type="button">
          New text
        </button>
      </div>
    </div>
  );
}

/**
 * Speed over the run: the solid line is net, the dashed one is everything the
 * hands did, mistakes included. The gap between them is what the errors cost.
 */
function Curve({ samples }: { samples: Sample[] }) {
  if (samples.length < 2) return null;

  const w = 620;
  const h = 132;
  const pad = 12;
  const peak = Math.max(50, ...samples.map((s) => s.raw)) * 1.12;

  // Placed by the second it was taken rather than by its position in the
  // list: a tab left in the background gets its timer throttled, and evenly
  // spaced points would draw that gap as though no time had passed.
  const first = samples[0].second;
  const span = samples[samples.length - 1].second - first || 1;

  const x = (s: Sample) => pad + ((s.second - first) / span) * (w - pad * 2);
  const y = (v: number) => h - pad - (v / peak) * (h - pad * 2);
  const path = (pick: (s: Sample) => number) =>
    samples
      .map(
        (s, i) =>
          `${i === 0 ? "M" : "L"}${x(s).toFixed(1)} ${y(pick(s)).toFixed(1)}`,
      )
      .join(" ");

  const net = path((s) => s.wpm);
  const floor = h - pad;

  return (
    <svg
      className="ty-curve"
      preserveAspectRatio="none"
      role="img"
      aria-label={`Speed across ${Math.round(span)} seconds`}
      viewBox={`0 0 ${w} ${h}`}
    >
      <defs>
        <linearGradient id="ty-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(251, 109, 76, 0.34)" />
          <stop offset="100%" stopColor="rgba(251, 109, 76, 0)" />
        </linearGradient>
      </defs>

      <path
        className="ty-curve__area"
        d={`${net} L${(w - pad).toFixed(1)} ${floor} L${pad.toFixed(1)} ${floor} Z`}
        fill="url(#ty-fill)"
      />
      <path className="ty-curve__raw" d={path((s) => s.raw)} fill="none" />
      <path className="ty-curve__net" d={net} fill="none" />
    </svg>
  );
}
