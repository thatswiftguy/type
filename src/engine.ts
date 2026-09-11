import { PASSAGES, WORDS, type Passage } from "./text.ts";

export type Mode = "words" | "prose";

/** Lengths offered in words mode, in seconds. */
export const DURATIONS = [15, 30, 60] as const;

/** Letters accepted past the end of a word before the test stops listening. */
const OVERFLOW = 8;

export interface Test {
  /** The target, already split. A word never contains a space. */
  words: string[];
  /** Named only for a passage; the random word drill has nothing to credit. */
  source: string | null;
}

/**
 * Enough words for sixty seconds at a speed nobody reading this will hit. The
 * test ends when the clock does, so a surplus costs nothing but a little DOM.
 */
const POOL = 220;

/** Text to draw from. Either half may be left out to keep the built-in one. */
export interface Corpus {
  words?: string[];
  passages?: Passage[];
}

export function buildTest(mode: Mode, corpus: Corpus = {}): Test {
  const passages = corpus.passages?.length ? corpus.passages : PASSAGES;
  const pool = corpus.words?.length ? corpus.words : WORDS;

  if (mode === "prose") {
    const passage = passages[Math.floor(Math.random() * passages.length)];
    return {
      words: passage.body.split(/\s+/).filter(Boolean),
      source: passage.title,
    };
  }

  const pick = () => pool[Math.floor(Math.random() * pool.length)];
  const words: string[] = [];

  for (let i = 0; i < POOL; i++) {
    let word = pick();
    // Never the same word twice in a row: a repeat reads as a rendering bug.
    // Guarded on the pool size, or a one-word list would spin here forever.
    while (pool.length > 1 && word === words[i - 1]) word = pick();
    words.push(word);
  }

  return { words, source: null };
}

/** One sample of the speed curve, taken once a second while the test runs. */
export interface Sample {
  second: number;
  wpm: number;
  raw: number;
}

/**
 * The whole test, in one value.
 *
 * A reducer rather than a handful of `useState` calls, and for one reason: a
 * fast typist can land two keys inside a single render. State read from a
 * closure would be one keystroke stale by the second of them, and the letter
 * would be scored against the wrong word — or dropped. A reducer is always
 * handed what the last action left behind.
 */
export interface State {
  words: string[];
  source: string | null;
  /** Index-aligned with `words`: what was typed for each one. */
  typed: string[];
  active: number;
  /** `performance.now()` at the first keystroke; null until then. */
  startedAt: number | null;
  elapsed: number;
  done: boolean;
  /**
   * Keystrokes as they happened, which is what accuracy is about: a letter
   * fixed by backspace was still typed wrong, and the finished text no longer
   * remembers that.
   */
  hit: number;
  all: number;
  samples: Sample[];
}

export type Action =
  /** Characters that arrived, in order. A space commits the current word. */
  | { kind: "type"; text: string; now: number }
  | { kind: "back"; whole: boolean }
  /** `limit` is the length of the run in seconds, or Infinity for a passage. */
  | { kind: "tick"; now: number; limit: number }
  | { kind: "reset"; test?: Test };

export function start(test: Test): State {
  return {
    words: test.words,
    source: test.source,
    typed: [""],
    active: 0,
    startedAt: null,
    elapsed: 0,
    done: false,
    hit: 0,
    all: 0,
    samples: [],
  };
}

export function reduce(state: State, action: Action): State {
  switch (action.kind) {
    case "reset":
      return start(
        action.test ?? { words: state.words, source: state.source },
      );

    case "type": {
      if (state.done) return state;
      let next =
        state.startedAt === null ? { ...state, startedAt: action.now } : state;
      for (const letter of action.text) next = press(next, letter, action.now);
      return next;
    }

    case "back": {
      if (state.done) return state;
      const attempt = state.typed[state.active] ?? "";
      // At the start of a word, back up into the one before it — left as it
      // was typed, so a mistake can be looked at before it is fixed.
      if (attempt.length === 0) {
        return state.active === 0
          ? state
          : { ...state, active: state.active - 1 };
      }
      const typed = state.typed.slice();
      typed[state.active] = action.whole ? "" : attempt.slice(0, -1);
      return { ...state, typed };
    }

    case "tick": {
      if (state.startedAt === null || state.done) return state;
      const elapsed = (action.now - state.startedAt) / 1000;

      if (elapsed >= action.limit) {
        return {
          ...state,
          elapsed: action.limit,
          done: true,
          samples: sample(state, action.limit),
        };
      }

      const second = Math.floor(elapsed);
      return {
        ...state,
        elapsed,
        // One sample a second, however often the timer fires.
        samples:
          state.samples.length >= second ? state.samples : sample(state, second),
      };
    }
  }
}

/** One character, applied. The only place the rules of the test live. */
function press(state: State, letter: string, now: number): State {
  const word = state.words[state.active] ?? "";
  const attempt = state.typed[state.active] ?? "";
  const last = state.active === state.words.length - 1;

  if (letter === " ") {
    // A space with nothing typed is nothing at all — no empty words.
    if (attempt.length === 0) return state;

    const typed = state.typed.slice();
    typed[state.active + 1] = typed[state.active + 1] ?? "";
    const next = {
      ...state,
      typed,
      hit: state.hit + (attempt === word ? 1 : 0),
      all: state.all + 1,
    };
    return last ? stop(next, now) : { ...next, active: state.active + 1 };
  }

  // Everything else a keyboard can send that is not a letter of the test.
  if (letter < " ") return state;

  // Far enough past the end of the word to be a different mistake. Refusing
  // the key is kinder than counting it against you.
  if (attempt.length >= word.length + OVERFLOW) return state;

  const typed = state.typed.slice();
  typed[state.active] = attempt + letter;

  const next = {
    ...state,
    typed,
    hit: state.hit + (letter === word[attempt.length] ? 1 : 0),
    all: state.all + 1,
  };

  // The last word needs no trailing space: land it and the test is over.
  return last && typed[state.active] === word ? stop(next, now) : next;
}

function stop(state: State, now: number): State {
  const elapsed =
    state.startedAt === null ? 0 : (now - state.startedAt) / 1000;
  return { ...state, done: true, elapsed, samples: sample(state, elapsed) };
}

function sample(state: State, second: number): Sample[] {
  if (second < 1) return state.samples;
  const { correct, wrong } = tally(state.words, state.typed, state.active);
  return [
    ...state.samples,
    {
      second,
      wpm: wpm(correct, second),
      raw: wpm(correct + wrong, second),
    },
  ];
}

export interface Tally {
  /** Characters typed correctly, spaces between finished words included. */
  correct: number;
  /** Wrong characters, and any typed past the end of a word. */
  wrong: number;
  /** Characters of a word that was left short before moving on. */
  missed: number;
}

/**
 * Counts the attempt as it stands, up to and including the word being typed.
 *
 * A space counts as one correct character, and only when the word before it
 * was right — which is why a word abandoned halfway costs more than the
 * letters it is missing.
 */
export function tally(
  words: string[],
  typed: string[],
  active: number,
): Tally {
  let correct = 0;
  let wrong = 0;
  let missed = 0;

  for (let i = 0; i <= active && i < words.length; i++) {
    const word = words[i];
    const attempt = typed[i] ?? "";

    for (let j = 0; j < attempt.length; j++) {
      if (j < word.length && attempt[j] === word[j]) correct++;
      else wrong++;
    }

    if (i < active) {
      if (attempt.length < word.length) missed += word.length - attempt.length;
      // The separating space, earned only by a word typed exactly right.
      if (attempt === word) correct++;
    }
  }

  return { correct, wrong, missed };
}

/** Net words per minute: five correct characters make a word. */
export function wpm(correct: number, seconds: number): number {
  // Under a second the arithmetic says four hundred words a minute. Nobody is
  // measured on their first keystroke, so the clock starts at one.
  const over = Math.max(seconds, 1);
  return (correct / 5) * (60 / over);
}
