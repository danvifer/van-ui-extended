import van from "vanjs-core";
import "../../styles.css";
import { isolatedLayout } from "../_isolatedLayout";
import { wizardWidget } from "../../widgets";

van.add(
  document.body,
  isolatedLayout({
    title: "WizardComponent",
    subtitle: "Multi-step modal wizard with per-step validation.",
    content: wizardWidget,
  }),
);
