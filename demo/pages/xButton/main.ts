import van from "vanjs-core";
import "../../styles.css";
import { isolatedLayout } from "../_isolatedLayout";
import { xButtonWidget } from "../../widgets";

van.add(
  document.body,
  isolatedLayout({
    title: "xButton",
    subtitle: "Styled button factory with icon, label, disabled state and click handler.",
    content: xButtonWidget,
  }),
);
