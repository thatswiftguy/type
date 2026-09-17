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
export { Typing } from "./Typing.js";
export type { Outcome, TypingProps } from "./Typing.js";
export { Starfield } from "./Starfield.js";
export { DURATIONS, buildTest, reduce, start, tally, wpm, } from "./engine.js";
export type { Action, Corpus, Mode, Sample, State, Tally, Test, } from "./engine.js";
export { PASSAGES, WORDS } from "./text.js";
export type { Passage } from "./text.js";
