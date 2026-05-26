import van from "vanjs-core";
import "../../styles.css";
import { isolatedLayout } from "../_isolatedLayout";
import { selectWidget } from "../../widgets";

van.add(
  document.body,
  isolatedLayout({
    title: "Select",
    subtitle: "Generic multi-select with description and images.",
    content: selectWidget,
  }),
);
