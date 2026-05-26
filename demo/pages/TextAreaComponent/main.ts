import van from "vanjs-core";
import "../../styles.css";
import { isolatedLayout } from "../_isolatedLayout";
import { textareaWidget } from "../../widgets";

van.add(
  document.body,
  isolatedLayout({
    title: "TextAreaComponent",
    subtitle: "Two-way bound textarea backed by a VanJS State<string>.",
    content: textareaWidget,
  }),
);
