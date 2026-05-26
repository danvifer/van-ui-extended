import van from "vanjs-core";
import "../../styles.css";
import { isolatedLayout } from "../_isolatedLayout";
import { xSelectWidget } from "../../widgets";

van.add(
  document.body,
  isolatedLayout({
    title: "xSelect / xOption",
    subtitle: "Searchable select component with custom option rendering.",
    content: xSelectWidget,
  }),
);
