/**
 * The starfield `Starfield.tsx` drives. No React in here, for the same reason
 * `engine.ts` has none: it is a loop that mutates an array sixty times a
 * second, which is the one thing React is the wrong tool for.
 *
 * The model is the usual one. A star is a point in a box of unit depth, and
 * it is drawn where a line from the eye through it meets the screen — so a
 * star at the far wall sits near the middle and one about to pass the ear is
 * off the edge. Flying is just walking every `z` toward zero.
 *
 * The trail is the part worth explaining. It is not a record of where the
 * star was last frame; it is where the star *would have been* a fixed slice
 * of time ago, projected fresh each frame from `z + speed * TRAIL`. Kept as
 * history it would smear whenever the viewpoint drifted or a star recycled;
 * computed it is exactly as long as the current speed deserves and never
 * wrong.
 */
export interface Sky {
    /** Hand a keystroke in: the field gains a little speed and then loses it. */
    kick: () => void;
    /** Tear down the loop and the listeners. Safe to call twice. */
    stop: () => void;
}
/**
 * Start the field on a canvas and return the handle to drive it.
 *
 * With `prefers-reduced-motion` set nothing animates: the stars are drawn
 * once, at rest, as a still photograph of the same sky. The setting is asking
 * for exactly that, and a field of streaks is the most literal reading of
 * what it is asking not to see.
 */
export declare function sky(canvas: HTMLCanvasElement): Sky;
