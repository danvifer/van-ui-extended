import van from "vanjs-core";
import "../../styles.css";
import { isolatedLayout } from "../_isolatedLayout";
import { xTableWidget } from "../../widgets";

van.add(
  document.body,
  isolatedLayout({
    title: "xTable",
    subtitle:
      "Feature-rich data table: sortable columns, per-column filters, pagination (footer pinned outside the scroll area), row selection and virtual scrolling. Material theme.",
    content: () => {
      const wrapper = document.createElement("div");
      wrapper.style.height = "520px";
      wrapper.appendChild(xTableWidget());
      return wrapper;
    },
  }),
);
