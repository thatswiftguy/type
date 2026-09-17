import { type Passage } from "./text.js";
export type Mode = "words" | "prose";
/** Lengths offered in words mode, in seconds. */
export declare const DURATIONS: readonly [15, 30, 60];
export interface Test {
    /** The target, already split. A word never contains a space. */
    words: string[];
    /** Named only for a passage; the random word drill has nothing to credit. */
    source: string | null;
}
/** Text to draw from. Either half may be left out to keep the built-in one. */
export interface Corpus {
    words?: string[];
    passages?: Passage[];
}
export declare function buildTest(mode: Mode, corpus?: Corpus): Test;
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
{
    kind: "type";
    text: string;
    now: number;
} | {
    kind: "back";
    whole: boolean;
}
/** `limit` is the length of the run in seconds, or Infinity for a passage. */
 | {
    kind: "tick";
    now: number;
    limit: number;
} | {
    kind: "reset";
    test?: Test;
};
export declare function start(test: Test): State;
export declare function reduce(state: State, action: Action): State;
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
export declare function tally(words: string[], typed: string[], active: number): Tally;
/** Net words per minute: five correct characters make a word. */
export declare function wpm(correct: number, seconds: number): number;
