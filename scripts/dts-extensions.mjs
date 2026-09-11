import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Rewrites `./x.ts` / `./x.tsx` to `./x.js` in the emitted declarations.
 *
 * The source imports carry their real extensions, which is what this repo and
 * the site it came from both do. TypeScript keeps those specifiers in the
 * `.d.ts` output, and a consumer on an older compiler — or any consumer not
 * running `skipLibCheck` — is then told an import path cannot end in `.tsx`.
 * `./x.js` resolves to `x.d.ts` on every version, so that is what ships.
 */
const dist = new URL("../dist/", import.meta.url).pathname;

for (const name of await readdir(dist)) {
  if (!name.endsWith(".d.ts")) continue;
  const path = join(dist, name);
  const before = await readFile(path, "utf8");
  const after = before.replace(
    /(from\s+["']\.{1,2}\/[^"']+?)\.tsx?(["'])/g,
    "$1.js$2",
  );
  if (after !== before) await writeFile(path, after);
}
