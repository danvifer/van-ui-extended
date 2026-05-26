import van from "vanjs-core";
import "../../styles.css";
import { isolatedLayout } from "../_isolatedLayout";
import { tableWidget } from "../../widgets";

van.add(
  document.body,
  isolatedLayout({
    title: "TableComponent",
    subtitle: "Reactive data table with column definitions.",
    content: tableWidget,
  }),
);
