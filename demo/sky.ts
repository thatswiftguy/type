/**
 * The starfield behind the demo. No React in here, for the same reason
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

/** A star, as stored. `x` and `y` are a direction, `z` is how far off it is. */
interface Star {
  x: number;
  y: number;
  z: number;
  /** How bright this one is allowed to get, so the field is not uniform. */
  mag: number;
  /** Index into `TINTS`. Most stars are white; a few are not. */
  tint: number;
}

/**
 * Star colours, as `r, g, b` ready to drop into an `rgba()`. Weighted heavily
 * toward white on purpose — a sky where every star has an opinion reads as a
 * screensaver, not a window.
 */
const TINTS = [
  "255, 255, 255",
  "255, 255, 255",
  "255, 255, 255",
  "198, 219, 255", // blue giants
  "255, 224, 196", // the warm end
  "255, 186, 158", // and a couple that lean toward the accent
] as const;

/** Nearest a star comes before it is recycled to the back of the box. */
const NEAR = 0.055;

/**
 * How far back in time the trail reaches, in seconds, with the boost at its
 * ceiling — and the fraction of that it keeps at a standstill.
 *
 * The second number is not decoration. The projection is hyperbolic, so a
 * star close to the eye sweeps across a tenth of the screen in the time one
 * near the far wall moves a pixel; at a fixed trail length the nearest stars
 * would be drawing long streaks while the page sat there doing nothing, and
 * the difference between resting and flying — the whole effect — would be
 * lost. Tied to the boost instead, still is still and typing is travel.
 */
const TRAIL = 0.08;
const IDLE_TRAIL = 0.1;

/** Depth per second with nobody typing. Slow enough to read as drifting. */
const CRUISE = 0.045;

/** What one keystroke is worth, and the most the boost may ever add. */
const KICK = 0.055;
const CEILING = 0.85;

/** Seconds for the boost to fall to a third of itself once the hands stop. */
const EASE = 0.85;

/** One star per this many square pixels of viewport, within the bounds below. */
const DENSITY = 1900;
const FEWEST = 230;
const MOST = 760;

export interface Sky {
  /** Hand a keystroke in: the field gains a little speed and then loses it. */
  kick: () => void;
  /** Tear down the loop and the listeners. Safe to call twice. */
  stop: () => void;
}

const random = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

/**
 * Put a star somewhere in the box. Spread over the whole depth on the first
 * fill so the field opens already populated, and pinned to the far wall on
 * every recycle after that, which is where new ones have to come from.
 */
function place(star: Star, fresh: boolean): Star {
  // A direction, not a position on screen: the projection turns it into one.
  // Rejection-sampled to a disc, because a square of directions puts a
  // visible cross of extra stars through the corners of the field.
  do {
    star.x = random(-1, 1);
    star.y = random(-1, 1);
  } while (star.x * star.x + star.y * star.y > 1);

  star.z = fresh ? random(NEAR, 1) : random(0.92, 1);
  star.mag = random(0.35, 1);
  star.tint = Math.floor(Math.random() * TINTS.length);
  return star;
}

/**
 * Start the field on a canvas and return the handle to drive it.
 *
 * With `prefers-reduced-motion` set nothing animates: the stars are drawn
 * once, at rest, as a still photograph of the same sky. The setting is asking
 * for exactly that, and a field of streaks is the most literal reading of
 * what it is asking not to see.
 */
export function sky(canvas: HTMLCanvasElement): Sky {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return { kick: () => {}, stop: () => {} };

  const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  let stars: Star[] = [];
  let width = 0;
  let height = 0;
  /** Half the shorter side, near enough: how hard the projection fans out. */
  let focal = 0;

  let boost = 0;
  /** What is actually drawn. Chases `boost` so a keystroke is a swell, not a
      step — the jump itself is the only thing that could look mechanical. */
  let speed = 0;
  let drift = 0;

  let frame = 0;
  let last = 0;
  let running = false;

  function measure() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    // Draw in CSS pixels and let the transform deal with the density, so
    // nothing below has to know what kind of screen it is on.
    ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
    focal = Math.min(width, height) * 0.32;

    const want = Math.round(
      Math.max(FEWEST, Math.min(MOST, (width * height) / DENSITY)),
    );

    while (stars.length > want) stars.pop();
    while (stars.length < want) {
      stars.push(place({ x: 0, y: 0, z: 0, mag: 0, tint: 0 }, true));
    }
  }

  /**
   * One frame. `step` is seconds, clamped: a tab returned to after a minute
   * in the background hands back a gap the size of the minute, and a field
   * advanced by a minute in one go is a field of stars that all teleport.
   */
  function draw(step: number) {
    // The viewpoint wanders on two slow sines that never quite line up, so
    // the field is always heading somewhere slightly different and never
    // arrives. It is the difference between flying and staring.
    drift += step;
    const cx = width / 2 + Math.sin(drift * 0.07) * width * 0.05;
    const cy = height / 2 + Math.cos(drift * 0.052) * height * 0.055;

    const over = Math.min(1, Math.max(0, speed - CRUISE) / CEILING);
    const smear = speed * TRAIL * (IDLE_TRAIL + (1 - IDLE_TRAIL) * over);

    ctx!.clearRect(0, 0, width, height);
    // Set once rather than per star: it is the same for all of them, and the
    // loop below runs a few hundred times a frame.
    ctx!.lineCap = "round";

    for (const star of stars) {
      star.z -= speed * step;
      if (star.z <= NEAR) place(star, false);

      const { x, y, z } = star;
      const scale = focal / z;
      const sx = cx + x * scale;
      const sy = cy + y * scale;

      // Everything in the box is drawn, including what has flown past the
      // edges: the bounds check costs about what the draw does, and a star
      // that is off screen is off screen for a fraction of a second.
      if (sx < -200 || sx > width + 200 || sy < -200 || sy > height + 200) {
        continue;
      }

      // Fade in from the far wall. Without it stars arrive at full strength
      // in the middle of the screen, which the eye reads as flickering.
      const depth = 1 - z;
      const alpha = star.mag * Math.min(1, depth * 4.2) * (0.34 + depth * 0.66);
      if (alpha <= 0.01) continue;

      const tint = TINTS[star.tint];
      const size = 0.55 + depth * depth * 2.4;

      // Where it was a moment ago, projected the same way.
      const tail = focal / Math.min(1, z + smear);
      const tx = cx + x * tail;
      const ty = cy + y * tail;
      const dx = sx - tx;
      const dy = sy - ty;

      // Compared squared, so there is no square root in here at all. The
      // threshold is a pixel and a half, below which a line and a dot are
      // the same picture anyway.
      if (dx * dx + dy * dy > 2.25) {
        ctx!.strokeStyle = `rgba(${tint}, ${alpha})`;
        ctx!.lineWidth = size;
        ctx!.beginPath();
        ctx!.moveTo(tx, ty);
        ctx!.lineTo(sx, sy);
        ctx!.stroke();
      } else {
        // A dot, and a cheaper one than an arc: at this size the difference
        // between a square and a circle is below a pixel.
        ctx!.fillStyle = `rgba(${tint}, ${alpha})`;
        ctx!.fillRect(sx - size / 2, sy - size / 2, size, size);
      }
    }
  }

  function tick(now: number) {
    if (!running) return;
    const step = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;

    // Halve every `EASE` seconds or so. Framerate-independent, so a 120Hz
    // screen does not shed the boost twice as fast as a 60Hz one.
    boost *= Math.exp(-step / EASE);
    if (boost < 0.001) boost = 0;

    const want = CRUISE + boost;
    speed += (want - speed) * Math.min(1, step * 6);

    draw(step);
    frame = requestAnimationFrame(tick);
  }

  function play() {
    if (running || calm.matches) return;
    running = true;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function pause() {
    running = false;
    cancelAnimationFrame(frame);
  }

  /** A tab nobody is looking at should not be burning a core on scenery. */
  function visibility() {
    if (document.hidden) pause();
    else play();
  }

  function still() {
    pause();
    measure();
    speed = CRUISE;
    draw(0);
  }

  function resize() {
    measure();
    if (calm.matches) draw(0);
  }

  function settings() {
    if (calm.matches) still();
    else play();
  }

  measure();
  if (calm.matches) still();
  else play();

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", visibility);
  calm.addEventListener("change", settings);

  return {
    kick: () => {
      if (calm.matches) return;
      boost = Math.min(CEILING, boost + KICK);
    },
    stop: () => {
      pause();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
      calm.removeEventListener("change", settings);
      stars = [];
    },
  };
}
