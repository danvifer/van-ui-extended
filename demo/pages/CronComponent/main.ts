import van from "vanjs-core";
import "../../styles.css";
import { isolatedLayout } from "../_isolatedLayout";
import { cronWidget } from "../../widgets";

van.add(
  document.body,
  isolatedLayout({
    title: "CronComponent",
    subtitle: "Visual cron-expression editor (custom element).",
    content: cronWidget,
  }),
);
