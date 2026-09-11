/// <reference types="vite/client" />
import { describe, it, expect, vi } from "vitest"
import { EditorView } from "codemirror"
import { forEachDiagnostic } from "@codemirror/lint"
import { xCodeMirror } from "./xCodeMirror"
// Read as text rather than through node:fs, which would need @types/node.
import source from "./xCodeMirror.ts?raw"

// jsdom has no layout, and CodeMirror's measure phase calls into Range
// geometry. Stub it so the editor mounts without flooding stderr.
Range.prototype.getClientRects = () =>
  Object.assign([], { item: () => null }) as unknown as DOMRectList
Range.prototype.getBoundingClientRect = () => new DOMRect()

describe("xCodeMirror lazy heavy deps", () => {
  // prettier and the eslint browser bundle are ~1.5MB each. A static import of
  // either one makes them part of every consumer chunk that touches the barrel,
  // which is what this whole component was fixed for.
  it.each(["prettier", "eslint-linter-browserify", "globals"])(
    "never imports %s statically",
    (pkg) => {
      const statics = [
        ...source.matchAll(/^import\s[^\n]*?from\s+"([^"]+)"/gm),
      ].map((m) => m[1])
      expect(statics.filter((s) => s === pkg || s.startsWith(`${pkg}/`))).toEqual(
        [],
      )
    },
  )

  it("loads prettier on the first format() and reformats the document", async () => {
    const editor = xCodeMirror({ value: "const   a=1", language: "javascript" })
    document.body.append(editor)

    expect(editor.getValue()).toBe("const   a=1")
    await editor.format()
    expect(editor.getValue()).toBe("const a = 1;\n")

    editor.destroy()
  })

  it("loads eslint on the first lint pass and reports diagnostics", async () => {
    const editor = xCodeMirror({ value: "", language: "javascript" })
    document.body.append(editor)
    const view = EditorView.findFromDOM(editor)!

    // A doc change is what schedules the lint pass, which is what pulls eslint.
    view.dispatch({ changes: { from: 0, insert: "var x = ;" } })

    await vi.waitFor(
      () => {
        let found = 0
        forEachDiagnostic(view.state, () => found++)
        expect(found).toBeGreaterThan(0)
      },
      { timeout: 5000, interval: 100 },
    )

    editor.destroy()
  })
})