# @thatswiftguy/type

A typing drill for React. Loose words or a short passage, a caret that keeps
up, and the two numbers that matter.

- **No dependencies.** React is a peer, and nothing else comes along.
- **Themed by inheritance.** It reads the CSS variables a dark site usually
  already has, falls back to a finished palette when there are none, and can
  be told exactly what to do with its own `--ty-*` knobs.
- **A headless core.** The rules — the reducer, the scoring, the word
  arithmetic — are plain TypeScript with no React in them, exported separately
  for anyone who wants the drill without the look.

Running on [thatswiftguy.com/type](https://thatswiftguy.com/type).

## Install

```bash
npm i git+https://github.com/thatswiftguy/type.git
```

Installing from the repository builds the package on the way in, so there is
nothing to fetch from a registry. The `github:user/repo` shorthand works too,
but it resolves to SSH first — the https URL above is the one that installs
anonymously anywhere, including a CI container with no key. Append `#v0.1.0`
to pin a tag; a lockfile pins the commit either way.

## Use

```tsx
import { Typing } from "@thatswiftguy/type";
import "@thatswiftguy/type/type.css";

export function Page() {
  return <Typing title="Type" />;
}
```

The stylesheet is a separate import on purpose: it is yours to load, reorder,
or replace.

The component brings no copy of its own. A heading, a line under it and a way
back are the host page's business, so they are handed in:

```tsx
<Typing
  lead={<a href="/">← Home</a>}
  title="Type"
  blurb="Start typing whenever you like."
  defaultMode="prose"
  onFinish={(run) => console.log(run.wpm, run.accuracy)}
/>
```

### Props

| Prop | Type | Default | |
|---|---|---|---|
| `lead` | `ReactNode` | — | Above the heading. A back link, a logo, a crumb. |
| `title` | `ReactNode` | — | The heading. Left out, none is rendered. |
| `blurb` | `ReactNode` | — | The line under it. Left out, none is rendered. |
| `defaultMode` | `"words" \| "prose"` | `"words"` | Which drill opens. |
| `defaultSeconds` | `number` | `30` | Which length opens. |
| `durations` | `readonly number[]` | `[15, 30, 60]` | Lengths offered. |
| `words` | `string[]` | built-in pool | Your own words. |
| `passages` | `Passage[]` | built-in five | Your own passages. |
| `onFinish` | `(outcome: Outcome) => void` | — | Fired once per finished run. |
| `className` | `string` | — | Added to the root, for width and placement. |

`Outcome` carries `wpm`, `raw`, `accuracy`, `seconds`, `correct`, `wrong`,
`missed`, `mode` and the per-second `samples` the result graph is drawn from.

### Your own text

```tsx
<Typing
  words={["der", "die", "das", "und", "ist"]}
  passages={[{ title: "Rilke", body: "Wer jetzt kein Haus hat …" }]}
/>
```

Either list falls back to the built-in one when it is left out or empty.

## Theming

Every colour is a `--ty-*` variable on the root element, and each one falls
back twice — first to the variable a dark site usually already defines, then
to a value of its own:

```css
--ty-accent: var(--accent, #fb6d4c);
--ty-ink:    var(--ink, #f4f6f8);
--ty-bg:     var(--bg, #08090b);
```

So it looks finished dropped into an empty page, quietly takes on the palette
of a site that has one, and answers to being told directly:

```css
.ty {
  --ty-accent: #7dd3fc;
  --ty-size: 1.25rem;   /* size of the type   */
  --ty-line: 2.2rem;    /* height of a line   */
  --ty-idle: #3f4650;   /* letters not yet typed */
  --ty-bad: #ff5f52;    /* letters typed wrong   */
}
```

The full set: `--ty-accent`, `--ty-bg`, `--ty-ink`, `--ty-ink-2`,
`--ty-ink-3`, `--ty-ink-4`, `--ty-rule`, `--ty-rule-2`, `--ty-mono`,
`--ty-serif`, `--ty-size`, `--ty-line`, `--ty-idle`, `--ty-bad`.

No webfont is required — the mono stack ends at the system monospace.

## Keyboard

| | |
|---|---|
| any key | starts the run, from anywhere on the page |
| <kbd>space</kbd> | commits the word, right or wrong |
| <kbd>backspace</kbd> | at the start of a word, steps back into the last one |
| <kbd>alt</kbd>/<kbd>ctrl</kbd> + <kbd>backspace</kbd> | clears the word |
| <kbd>tab</kbd> | new text |
| <kbd>esc</kbd> | restart the same text |
| <kbd>enter</kbd> | on the result, go again |

<kbd>shift</kbd>+<kbd>tab</kbd> is left alone, so the input is never a trap for
anyone driving the page from the keyboard.

## The engine

The scoring has no React in it and can be used on its own — for a different
UI, a server, or a test:

```ts
import { buildTest, reduce, start, tally, wpm } from "@thatswiftguy/type";

let state = start(buildTest("words"));
state = reduce(state, { kind: "type", text: "the ", now: performance.now() });

const { correct, wrong, missed } = tally(state.words, state.typed, state.active);
wpm(correct, state.elapsed); // net words per minute
```

Accuracy is counted from keystrokes as they happen, not from the finished
text: a letter fixed with backspace was still typed wrong, and the text no
longer remembers it. A space counts as one correct character, and only when
the word before it was right — so a word abandoned halfway costs more than the
letters it is missing.

## How it works

Two decisions are worth knowing about before changing anything.

**The input holds nothing.** Characters arrive through a real `<input>` laid
invisibly over the page — the only thing a phone will raise a keyboard for —
but every change is read, dispatched and then wiped. A controlled input that
keeps the current word races a fast typist: two keys can land inside one
render, and the second is then scored against a word the state has already
left. The reducer is always handed what the last action left behind.

**The caret is ours.** Every letter is an inline-block of exactly one line's
height, aligned to the top of it, which makes `offsetLeft`/`offsetTop` exact
for all of them. The caret is one element that slides to the letter the cursor
is on, and the three-line window scrolls to hold that line in the middle.

## Development

```bash
npm install
npm run dev        # the demo at localhost:5173
npm run build      # the package, into dist/
npm run build:demo # the demo, into demo-dist/
npm run typecheck
```

## Licence

MIT © Mohammad Yasir
