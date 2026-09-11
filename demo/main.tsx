import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Typing, type Outcome } from "../src/index.ts";
import "../src/typing.css";
import "./demo.css";

/**
 * The demo. It is deliberately thin — a heading, the component, and a log of
 * what `onFinish` handed back — because everything worth looking at is in the
 * package, and a demo that adds features of its own is a demo that stops
 * telling you what you are actually getting.
 */
function Demo() {
  const [runs, setRuns] = useState<Outcome[]>([]);

  return (
    <main className="demo">
      <Typing
        lead={
          <a className="demo__back" href="https://github.com/thatswiftguy/type">
            <span aria-hidden="true">↗</span> github.com/thatswiftguy/type
          </a>
        }
        title="Type"
        blurb="Loose words or a short passage, a caret that keeps up, and the two numbers that matter. Start typing whenever you like."
        onFinish={(outcome) => setRuns((list) => [outcome, ...list].slice(0, 5))}
      />

      {runs.length > 0 && (
        <section className="demo__log">
          <h2 className="demo__label">onFinish</h2>
          <ol>
            {runs.map((run, i) => (
              <li key={runs.length - i}>
                <b>{Math.round(run.wpm)}</b> wpm · {run.accuracy}% · {run.mode}{" "}
                · {run.seconds.toFixed(1)}s · {run.correct}/
                {run.wrong + run.missed} chars
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("#root not found");

createRoot(root).render(
  <StrictMode>
    <Demo />
  </StrictMode>,
);
