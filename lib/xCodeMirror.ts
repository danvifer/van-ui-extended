import type { ChildDom } from "vanjs-core"
import { basicSetup, EditorView } from "codemirror"
import { javascript, esLint } from "@codemirror/lang-javascript"
import { json, jsonParseLinter } from "@codemirror/lang-json"
import { markdown } from "@codemirror/lang-markdown"
import { css } from "@codemirror/lang-css"
import { html } from "@codemirror/lang-html"
import {
  lintGutter,
  linter,
  setDiagnostics,
  type Diagnostic,
} from "@codemirror/lint"
import { EditorState } from "@codemirror/state"
import { dracula } from "thememirror"

export interface XCodemirrorProps {
  readonly value: any
  readonly language?: string
  readonly ownGlobals?: Record<string, unknown>
  // Make the editor read-only (view stays selectable/copyable).
  readonly readOnly?: boolean
  // Called on every document change with the current text.
  readonly onChange?: (value: string) => void
}

// A host-injected diagnostic (e.g. a widget runtime error from the worker),
// in 1-based line/column terms. Mapped to a CodeMirror Diagnostic internally.
export interface XCodeMirrorDiagnostic {
  readonly line: number
  readonly column: number
  readonly message: string
  readonly severity?: "error" | "warning" | "info"
}

interface XCodeMirrorElement extends HTMLElement {
  format: () => void
  // Read the current editor text.
  getValue: () => string
  // Replace the whole document.
  setValue: (value: string) => void
  // Underline host-supplied diagnostics (clears previous host diagnostics).
  setDiagnostics: (diags: XCodeMirrorDiagnostic[]) => void
  // Tear down the editor + observer explicitly.
  destroy: () => void
}
// prettier (~1.5MB) and the eslint browser bundle (~1.5MB) dwarf the editor
// itself, and neither is needed to *render* it: one runs on an explicit format,
// the other on the first lint pass. Both load on first use, so a consumer that
// only mounts the editor never downloads them. Same shape as xChart's echarts
// import.
type PrettierApi = {
  readonly format: (source: string, options: any) => Promise<string>
  readonly plugins: Array<any>
}

let prettierApi: Promise<PrettierApi> | null = null

const loadPrettier = (): Promise<PrettierApi> =>
  (prettierApi ??= Promise.all([
    import("prettier"),
    import("prettier/plugins/babel"),
    import("prettier/plugins/estree"),
    import("prettier/plugins/typescript"),
    import("prettier/plugins/markdown"),
    import("prettier/plugins/postcss"),
    import("prettier/plugins/html"),
  ]).then(([prettier, babel, estree, typescript, md, postcss, htmlPlugin]) => ({
    format: prettier.format,
    // estree is a default export; the rest are namespaces prettier takes as-is.
    plugins: [
      babel,
      (estree as any).default ?? estree,
      typescript,
      md,
      postcss,
      htmlPlugin,
    ],
  })))

const buildEslintConfig = (
  globals: any,
  ownGlobals: Record<string, unknown>,
) => ({
  // eslint configuration

  languageOptions: {
    globals: {
      ...globals.node,
      ...ownGlobals,
    },
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
  },
  rules: {
    "constructor-super": "error",
    "for-direction": "error",
    "getter-return": "error",
    "no-async-promise-executor": "error",
    "no-case-declarations": "error",
    "no-class-assign": "error",
    "no-compare-neg-zero": "error",
    "no-cond-assign": "error",
    "no-const-assign": "error",
    "no-constant-binary-expression": "error",
    "no-constant-condition": "error",
    "no-control-regex": "error",
    "no-debugger": "error",
    "no-delete-var": "error",
    "no-dupe-args": "error",
    "no-dupe-class-members": "error",
    "no-dupe-else-if": "error",
    "no-dupe-keys": "error",
    "no-duplicate-case": "error",
    "no-empty": "error",
    "no-empty-character-class": "error",
    "no-empty-pattern": "error",
    "no-empty-static-block": "error",
    "no-ex-assign": "error",
    "no-extra-boolean-cast": "error",
    "no-fallthrough": "error",
    "no-func-assign": "error",
    "no-global-assign": "error",
    "no-import-assign": "error",
    "no-invalid-regexp": "error",
    "no-irregular-whitespace": "error",
    "no-loss-of-precision": "error",
    "no-misleading-character-class": "error",
    "no-new-native-nonconstructor": "error",
    "no-nonoctal-decimal-escape": "error",
    "no-obj-calls": "error",
    "no-octal": "error",
    "no-prototype-builtins": "error",
    "no-redeclare": "error",
    "no-regex-spaces": "error",
    "no-self-assign": "error",
    "no-setter-return": "error",
    "no-shadow-restricted-names": "error",
    "no-sparse-arrays": "error",
    "no-this-before-super": "error",
    "no-undef": "warn",
    "no-unexpected-multiline": "error",
    "no-unreachable": "error",
    "no-unsafe-finally": "error",
    "no-unsafe-negation": "error",
    "no-unsafe-optional-chaining": "error",
    "no-unused-labels": "error",
    "no-unused-private-class-members": "error",
    "no-unused-vars": "error",
    "no-useless-backreference": "error",
    "no-useless-catch": "error",
    "no-useless-escape": "error",
    "no-with": "error",
    "require-yield": "error",
    "use-isnan": "error",
    "valid-typeof": "error",
  },
})

// @codemirror/lint accepts an async source, so the extension array stays
// synchronous while the eslint bundle is fetched on the first lint pass.
const lazyEsLintSource = (ownGlobals: Record<string, unknown>) => {
  let source: ((view: EditorView) => readonly Diagnostic[]) | null = null
  return async (view: EditorView): Promise<readonly Diagnostic[]> => {
    if (!source) {
      const [eslintMod, globalsMod] = await Promise.all([
        import("eslint-linter-browserify"),
        import("globals"),
      ])
      const Linter =
        (eslintMod as any).Linter ?? (eslintMod as any).default?.Linter
      const globals = (globalsMod as any).default ?? globalsMod
      source = esLint(
        new Linter(),
        buildEslintConfig(globals, ownGlobals),
      ) as any
    }
    return source!(view)
  }
}

export const xCodeMirror = (
  {
    value,
    language = "javascript",
    ownGlobals,
    readOnly,
    onChange,
  }: XCodemirrorProps,

  ...children: ChildDom[]
): XCodeMirrorElement => {
  function codemirrorExtension(): Array<any> {
    const esLintSource = lazyEsLintSource(
      ownGlobals && typeof ownGlobals === "object" ? ownGlobals : {},
    )
    const extensions: Array<any> = [dracula, basicSetup, lintGutter()]
    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true))
    }
    if (typeof onChange === "function") {
      extensions.push(
        EditorView.updateListener.of((u) => {
          if (u.docChanged) onChange(u.state.doc.toString())
        }),
      )
    }
    switch (language) {
      case "json":
        extensions.push(json(), linter(jsonParseLinter()))
        break
      case "javascript":
        extensions.push(javascript(), linter(esLintSource))
        break
      case "typescript":
        extensions.push(javascript({ typescript: true }), linter(esLintSource))
        break
      case "markdown":
        extensions.push(markdown())
        break
      case "css":
        extensions.push(css())
        break
      case "html":
        extensions.push(html())
        break
      default:
        extensions.push(javascript(), linter(esLintSource))
        break
    }
    return extensions
  }
  const element = document.createElement("div") as unknown as XCodeMirrorElement
  const editorView = new EditorView({
    doc: new String(value).toString(),
    parent: element,
    extensions: codemirrorExtension(),
  })

  let disposed = false
  const dispose = () => {
    if (disposed) return
    disposed = true
    try {
      editorView.destroy()
    } catch {}
    try {
      observer.disconnect()
    } catch {}
  }
  const observer = new MutationObserver(() => {
    if (!document.contains(element)) dispose()
  })
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  })
  element.format = async function format() {
    let parser = "babel"
    switch (language) {
      case "json":
        parser = "json"
        break
      case "javascript":
        parser = "babel"
        break
      case "typescript":
        parser = "typescript"
        break
      case "markdown":
        parser = "markdown"
        break
      case "css":
        parser = "css"
        break
      case "html":
        parser = "html"
        break
      default:
        parser = "babel"
        break
    }
    const { format: runPrettier, plugins } = await loadPrettier()
    const formatted = await runPrettier(editorView.state.doc.toString(), {
      parser: parser,
      plugins: plugins,
      tabWidth: 4,
      useTabs: false,
    })
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: formatted,
      },
    })
  }

  element.getValue = () => editorView.state.doc.toString()

  element.setValue = (next: string) => {
    editorView.dispatch({
      changes: { from: 0, to: editorView.state.doc.length, insert: next },
    })
  }

  // Map 1-based line/column host diagnostics to CodeMirror's absolute offsets
  // and underline them. Replaces any previously set host diagnostics.
  element.setDiagnostics = (diags: XCodeMirrorDiagnostic[]) => {
    const doc = editorView.state.doc
    const cmDiags: Diagnostic[] = diags.map((d) => {
      const lineNo = Math.min(Math.max(d.line || 1, 1), doc.lines)
      const lineInfo = doc.line(lineNo)
      const from = Math.min(
        lineInfo.from + Math.max((d.column || 1) - 1, 0),
        lineInfo.to,
      )
      const severity: Diagnostic["severity"] =
        d.severity === "warning"
          ? "warning"
          : d.severity === "info"
            ? "info"
            : "error"
      return { from, to: lineInfo.to, severity, message: d.message }
    })
    editorView.dispatch(setDiagnostics(editorView.state, cmDiags))
  }

  element.destroy = dispose

  return element
}
