import van from "vanjs-core";
import "../../styles.css";
import { isolatedLayout } from "../_isolatedLayout";
import { timePickerWidget } from "../../widgets";

van.add(
  document.body,
  isolatedLayout({
    title: "TimePickerComponent",
    subtitle: "Pikaday-based date picker bound to a State<string>.",
    content: timePickerWidget,
  }),
);
