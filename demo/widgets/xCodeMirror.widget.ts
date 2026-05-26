import van from "vanjs-core";
import { xCodeMirror } from "../../lib/xCodeMirror";

const { div, h3 } = van.tags;

const sample = `const greeting = "Hello, world!";
console.log(greeting);

function add(a, b) {
  return a + b;
}
`;

export const xCodeMirrorWidget = (): HTMLElement =>
  div(
    { class: "h-full w-full flex flex-col p-3 gap-2" },
    h3({ class: "text-sm font-semibold text-slate-700" }, "xCodeMirror"),
    div(
      { class: "flex-1 min-h-0 overflow-auto border border-slate-200 rounded" },
      xCodeMirror({
        value: sample,
        language: "javascript",
      }),
    ),
  );
