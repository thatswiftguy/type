import { type ReactNode } from "react";
import { type Mode, type Sample } from "./engine.js";
import type { Passage } from "./text.js";
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
export declare function Typing({ lead, title, blurb, defaultMode, defaultSeconds, durations, words: pool, passages, onFinish, className, }?: TypingProps): import("react").JSX.Element;
