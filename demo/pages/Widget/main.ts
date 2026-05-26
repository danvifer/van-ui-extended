import van from "vanjs-core";
import "../../styles.css";
import { isolatedLayout } from "../_isolatedLayout";
import { widgetWidget } from "../../widgets";

van.add(
  document.body,
  isolatedLayout({
    title: "Widget",
    subtitle: "Composite widget container that dispatches to table, lastValue or chart.",
    content: widgetWidget,
  }),
);
