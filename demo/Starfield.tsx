import { useEffect, useRef } from "react";
import { sky } from "./sky.ts";

/**
 * The background: three drifting clouds of gas in CSS, a canvas of stars over
 * them, and a vignette on top to keep the corners out of the way of the text.
 *
 * The clouds are CSS rather than canvas because they never change shape —
 * only position — and a transform the compositor can take is free where
 * repainting three screen-sized gradients sixty times a second is not.
 *
 * The one thing tying the field to the app is the keystroke listener. There
 * is no prop for it and no callback on the component: the test already reads
 * every key off the window, so the background can do the same and the two
 * never have to know about each other. Type faster, fly faster.
 */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const field = sky(canvas);

    const onKey = (event: KeyboardEvent) => {
      // Shortcuts are not typing. Neither is tabbing out of the page.
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.length === 1 || event.key === "Backspace") field.kick();
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      field.stop();
    };
  }, []);

  return (
    <div className="sky" aria-hidden="true">
      <div className="sky__cloud sky__cloud--far" />
      <div className="sky__cloud sky__cloud--mid" />
      <div className="sky__cloud sky__cloud--near" />
      <canvas className="sky__stars" ref={ref} />
      <div className="sky__veil" />
    </div>
  );
}
