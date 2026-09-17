/**
 * Everything the typing page can ask you to type. Two shapes, because the two
 * drills are different: loose words train the hands, a passage trains the
 * rhythm of real sentences — capitals, commas, and the pause at a full stop.
 */
/**
 * Common English words, lower-case and unpunctuated on purpose: this drill is
 * about the motion between keys, and a stray apostrophe turns it into a
 * spelling test. Short words dominate, which is what ordinary prose looks like.
 */
export declare const WORDS: string[];
export interface Passage {
    /** Shown under the text while you type it, so the source has a name. */
    title: string;
    body: string;
}
/**
 * Five short passages, written for this page rather than quoted, so there is
 * nothing here to attribute. Each one stays inside the punctuation an ordinary
 * keyboard reaches without a modifier: commas, full stops, and apostrophes.
 */
export declare const PASSAGES: Passage[];
