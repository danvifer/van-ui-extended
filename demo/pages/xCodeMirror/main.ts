import van from "vanjs-core";
import "../../styles.css";
import { isolatedLayout } from "../_isolatedLayout";
import { xCodeMirrorWidget } from "../../widgets";

van.add(
  document.body,
  isolatedLayout({
    title: "xCodeMirror",
    subtitle: "CodeMirror 6 wrapper with language support (JS, JSON, Markdown).",
    content: () => {
      const wrapper = document.createElement("div");
      wrapper.style.height = "420px";
      wrapper.appendChild(xCodeMirrorWidget());
      return wrapper;
    },
  }),
);
