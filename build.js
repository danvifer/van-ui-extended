import esbuild from "esbuild";
import { rmSync } from "node:fs";

// JS and .d.ts come from `tsc` (one module per file, so consumers' bundlers can tree-shake
// per component). This script only bundles the stylesheet: lib/van-ui.css and its
// @imports become dist/van-ui.css, published as `van-ui-extended/style.css`.
async function build() {
  const watch = process.argv.includes("--watch");
  // Start clean so files from older layouts never reach the tarball.
  if (!watch) rmSync("dist", { recursive: true, force: true });

  const ctx = await esbuild.context({
    entryPoints: ["lib/van-ui.css"],
    outfile: "dist/van-ui.css",
    bundle: true,
    sourcemap: true,
    target: "esnext",
  });

  if (watch) {
    console.log("Watching for changes...");
    await ctx.watch();
  } else {
    await ctx.rebuild();
    ctx.dispose();
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
