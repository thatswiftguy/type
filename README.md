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
short file, worth reading before wiring this into anything. The starfield
behind it belongs to [the demo page](#the-demo-page), not to the package.

## Install

```bash
npm i git+https://github.com/thatswiftguy/type.git
```

Installing from the repository builds the package on the way in, so there is
nothing to fetch from a registry. Append `#v0.1.0` to pin a tag.

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

## Headless

The scoring has no React in it and is exported on its own: `buildTest`,
`reduce`, `start`, `tally`, `wpm`.

## The demo page

Nothing below ships. It lives in `demo/` and exists to show what the drill
looks like once a host page has actually dressed it — the component itself
still renders on whatever ground it is given.

| File | What it is |
|---|---|
| `sky.ts` | The starfield. A box of stars, projected. No React. |
| `Starfield.tsx` | Mounts it and feeds it keystrokes. |
| `space.css` | The nebula and the vignette over it. |

**The field flies when you type.** There is no prop for that and no callback
on `<Typing>`: the drill already reads keys off the window, so the background
reads the same ones and the two never have to be introduced. Each keystroke
buys a little speed, which then bleeds away — so resting is a still field of
points and a fast run is a warp. The whole coupling is nine lines of
`Starfield.tsx`.

It stops for `prefers-reduced-motion`: the sky is drawn once as a still
photograph and left there, and nothing on the page animates.

## Licence

MIT © Mohammad Yasir
