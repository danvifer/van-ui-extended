// @vitest-environment node
/**
 * Loads the package entry point the way an SSR build or a Vitest `environment: "node"` suite
 * does: without a DOM. Components still need a DOM to render; importing them must not.
 */
import { describe, it, expect } from "vitest";

describe("package entry point", () => {
  it("imports without a DOM, so SSR builds and node-environment tests can load it", async () => {
    expect(typeof document).toBe("undefined");
    const pkg = await import("./index.js");
    expect(typeof pkg.xTable).toBe("function");
    expect(typeof pkg.xSelect).toBe("function");
    expect(typeof pkg.TableComponent).toBe("function");
    expect(typeof pkg.CronComponent).toBe("function");
  });
});
