import { StrictMode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Typing, type Outcome } from "../src/index.ts";
import { Starfield } from "./Starfield.tsx";
import "../src/typing.css";
import "./demo.css";
import "./space.css";

/**
 * The demo. Still thin where it counts — a heading, the component, and a log
 * of what `onFinish` handed back — because everything worth looking at is in
 * the package, and a demo that adds features of its own is a demo that stops
 * telling you what you are actually getting.
 *
 * The sky is the exception, and it is deliberately outside `<Typing>` rather
 * than a prop on it. That is the point it is making: the drill is a
 * transparent box you put on a page you already have, so the page brings its
 * own background and the package stays a typing test.
 */
function Demo() {
  const [runs, setRuns] = useState<Outcome[]>([]);

  return (
    <>
      <Starfield />

      <main className="demo">
        <Typing
          lead={
            <a
              className="demo__back"
              href="https://github.com/thatswiftguy/type"
            >
              <span aria-hidden="true">↗</span> github.com/thatswiftguy/type
            </a>
          }
          title="Type"
          blurb="Loose words or a short passage, a caret that keeps up, and the two numbers that matter. Start typing whenever you like."
          onFinish={(outcome) =>
            setRuns((list) => [outcome, ...list].slice(0, 5))
          }
        />

        {runs.length > 0 && (
          <section className="demo__log">
            <h2 className="demo__label">onFinish</h2>
            <ol>
              {runs.map((run, i) => (
                <li key={runs.length - i}>
                  <b>{Math.round(run.wpm)}</b> wpm · {run.accuracy}% ·{" "}
                  {run.mode} · {run.seconds.toFixed(1)}s · {run.correct}/
                  {run.wrong + run.missed} chars
                </li>
              ))}
            </ol>
          </section>
        )}
      </main>
    </>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("#root not found");

/**
 * The root is kept across hot updates. An entry module is not something Vite
 * can Fast Refresh — it exports no components — so it re-runs the file, and a
 * second `createRoot` on a container that already has one does not replace
 * the first: it leaves that tree mounted and off screen with its starfield
 * still drawing a frame sixty times a second. One root, rendered again, is
 * what a hot update is supposed to mean.
 */
const hot = import.meta.hot;
const app: Root = hot?.data.root ?? createRoot(root);
if (hot) hot.data.root = app;

app.render(
  <StrictMode>
    <Demo />
  </StrictMode>,
);
