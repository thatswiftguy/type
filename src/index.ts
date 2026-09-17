/**
 * @thatswiftguy/type — a typing drill for React.
 *
 * Three things ship here, and they are useful at different levels. `Typing`
 * is the whole page: text, caret, clock, results. `engine.ts` underneath it
 * is plain TypeScript with no React in it at all — the reducer, the scoring
 * and the word arithmetic — for anyone who wants the rules without the look.
 * `Starfield` is over the top of both: an optional background to stand the
 * drill on, which speeds up as you type.
 *
 * The stylesheet is not imported by the bundle. Bring it in yourself:
 *
 *     import "@thatswiftguy/type/type.css";
 */

export { Typing } from "./Typing.tsx";
export type { Outcome, TypingProps } from "./Typing.tsx";

export { Starfield } from "./Starfield.tsx";

export {
  DURATIONS,
  buildTest,
  reduce,
  start,
  tally,
  wpm,
} from "./engine.ts";
export type {
  Action,
  Corpus,
  Mode,
  Sample,
  State,
  Tally,
  Test,
} from "./engine.ts";

export { PASSAGES, WORDS } from "./text.ts";
export type { Passage } from "./text.ts";
