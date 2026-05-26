import van from "vanjs-core";
import "../../styles.css";
import { isolatedLayout } from "../_isolatedLayout";
import { xLastValueWidget } from "../../widgets";

van.add(
  document.body,
  isolatedLayout({
    title: "xLastValue",
    subtitle: "Compact card to display the latest reading of a sensor or metric.",
    content: xLastValueWidget,
  }),
);
