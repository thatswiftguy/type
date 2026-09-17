# @thatswiftguy/type

A typing drill for React. Loose words or a short passage, a caret that keeps
up, and the two numbers that matter.

No dependencies — React is a peer.

## Try it

```bash
git clone https://github.com/thatswiftguy/type.git
cd type
npm install
npm run dev
```

A working typing test at <http://localhost:5173> (Vite picks the next free
port if that one is taken). `demo/main.tsx` is the whole integration — one
short file, worth reading before wiring this into anything — including
[the starfield](#the-starfield) behind it, which ships too.

## Install

```bash
npm i git+https://github.com/thatswiftguy/type.git
```

Installing from the repository builds the package on the way in, so there is
nothing to fetch from a registry. Append `#v0.2.0` to pin a tag.

## Use

```tsx
import { Typing } from "@thatswiftguy/type";
import "@thatswiftguy/type/type.css";

export function Page() {
  return <Typing title="Type" />;
}
```

The stylesheet is a separate import on purpose — it is yours to load, reorder
or replace. Forget it and the drill renders unstyled.

The component brings no copy of its own: a heading, a line under it and a way
back are the host page's business, so they are handed in.

```tsx
<Typing
  lead={<a href="/">← Home</a>}
  title="Type"
  blurb="Start typing whenever you like."
  onFinish={(run) => console.log(run.wpm, run.accuracy)}
/>
```

### Props

| Prop | Type | Default |
|---|---|---|
| `lead` | `ReactNode` | — |
| `title` | `ReactNode` | — |
| `blurb` | `ReactNode` | — |
| `defaultMode` | `"words" \| "prose"` | `"words"` |
| `defaultSeconds` | `number` | `30` |
| `durations` | `readonly number[]` | `[15, 30, 60]` |
| `words` | `string[]` | built-in pool |
| `passages` | `Passage[]` | built-in five |
| `onFinish` | `(outcome: Outcome) => void` | — |
| `className` | `string` | — |

`lead`, `title` and `blurb` render nothing when left out. `Outcome` carries
`wpm`, `raw`, `accuracy`, `seconds`, `correct`, `wrong`, `missed`, `mode` and
the per-second `samples` behind the result graph.

## Theming

Every colour is a `--ty-*` variable on the root element, and each falls back
twice — to the variable a dark site usually already defines, then to a value
of its own:

```css
.ty {
  --ty-accent: #7dd3fc;  /* default: var(--accent, #fb6d4c) */
  --ty-size: 1.25rem;    /* size of the type */
  --ty-line: 2.2rem;     /* height of a line */
}
```

Also `--ty-bg`, `--ty-ink`, `--ty-ink-2`, `--ty-ink-3`, `--ty-ink-4`,
`--ty-rule`, `--ty-rule-2`, `--ty-mono`, `--ty-serif`, `--ty-idle`,
`--ty-bad`. No webfont required — the mono stack ends at the system monospace.

## The starfield

An optional background to stand the drill on: a box of stars projected onto
the page, three clouds of gas drifting behind them, and a vignette over the
top. Import it or leave it — `<Typing>` renders on whatever ground it is
given, and on none at all.

```tsx
import { Starfield, Typing } from "@thatswiftguy/type";
import "@thatswiftguy/type/type.css";

export function Page() {
  return (
    <>
      <Starfield />
      <main>
        <Typing title="Type" />
      </main>
    </>
  );
}
```

It is a sibling rather than a prop, and that is the point: the drill stays a
transparent box you put on a page you already have. Render it before the
content — it is `position: fixed` at `z-index: 0`, so whatever follows needs
to be positioned to sit above it (`position: relative` is enough).

The styles ride in `type.css` with everything else. While the sky is on the
page the drill's panels are handed a translucent `--ty-bg` so a little of it
shows through; set `--ty-bg` yourself to override that.

**The field flies when you type.** There is no prop for it and no callback on
`<Typing>`: the drill already reads keys off the window, so the background
reads the same ones and the two never have to be introduced. Each keystroke
buys a little speed, which then bleeds away — so resting is a still field of
points and a fast run is a warp. The whole coupling is nine lines of
`Starfield.tsx`.

It stops for `prefers-reduced-motion`: the sky is drawn once as a still
photograph and left there, and nothing on the page animates.

## Headless

The scoring has no React in it and is exported on its own: `buildTest`,
`reduce`, `start`, `tally`, `wpm`.

## The demo page

Nothing in `demo/` ships. It is two files — `main.tsx` and `demo.css` — and
it exists to show what the drill and the sky look like once a host page has
put them together: a dark ground, a column, a typeface, and the log of what
`onFinish` hands back. Everything else on that page comes from the package.

## Licence

MIT © Mohammad Yasir
