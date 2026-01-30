import van, { ChildDom } from "vanjs-core"
import * as babelPlugin from "prettier/plugins/babel"
import * as typescriptPlugin from "prettier/plugins/typescript"
import * as htmlPlugin from "prettier/plugins/html"
import * as cssPlugin from "prettier/plugins/postcss"
import * as markdownPlugin from "prettier/plugins/markdown"
import estreePlugin from "prettier/plugins/estree"
import * as prettier from "prettier"
import { basicSetup, EditorView } from "codemirror"
import { javascript, esLint } from "@codemirror/lang-javascript"
import { json, jsonParseLinter } from "@codemirror/lang-json"
import { markdown } from "@codemirror/lang-markdown"
import { css } from "@codemirror/lang-css"
import { html } from "@codemirror/lang-html"
import * as eslint from "eslint-linter-browserify"
import { lintGutter, linter, forEachDiagnostic } from "@codemirror/lint"
import { dracula } from "thememirror"
import globals from "globals"
const { div, span } = van.tags

export interface XCodemirrorProps {
  readonly value: any
  readonly language?: string
  readonly ownGlobals?: Record<string, unknown>
}
interface XCodeMirrorElement extends HTMLElement {
  format: () => void
}
export const xCodeMirror = (
  { value, language = "javascript", ownGlobals }: XCodemirrorProps,

  ...children: ChildDom[]
): XCodeMirrorElement => {
  function codemirrorExtension(): Array<any> {
    ownGlobals =
      ownGlobals && typeof ownGlobals === "object"
        ? (ownGlobals as Record<string, unknown>)
        : {}
    const eslintConfig = {
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
        "no-undef": "warning",
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
    }
    const extensions = [dracula, basicSetup, lintGutter()]
    switch (language) {
      case "json":
        extensions.push(json(), linter(jsonParseLinter()))
        break
      case "javascript":
        extensions.push(
          javascript(),
          linter(esLint(new eslint.Linter(), eslintConfig)),
        )
        break
      case "typescript":
        extensions.push(
          javascript({ typescript: true }),
          linter(esLint(new eslint.Linter(), eslintConfig)),
        )
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
        extensions.push(
          javascript(),
          linter(esLint(new eslint.Linter(), eslintConfig)),
        )
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
    {
      let prettierVersion = await prettier.format(
        editorView.state.doc.toString(),
        {
          parser: parser,
          plugins: [
            babelPlugin,
            estreePlugin,
            typescriptPlugin,
            markdownPlugin,
            cssPlugin,
            htmlPlugin,
          ],
          tabWidth: 4,
          useTabs: false,
        },
      )
      console.log(prettierVersion)
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: prettierVersion,
        },
      })
    }
  }

  return element
}
