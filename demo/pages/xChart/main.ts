import van from "vanjs-core";
import "../../styles.css";
import { isolatedLayout } from "../_isolatedLayout";
import { xChartWidget } from "../../widgets";

van.add(
  document.body,
  isolatedLayout({
    title: "xChart",
    subtitle: "Reactive ECharts wrapper. Options can be a value, a State<T>, or a function.",
    content: () => {
      const wrapper = document.createElement("div");
      wrapper.style.height = "420px";
      wrapper.appendChild(xChartWidget());
      return wrapper;
    },
  }),
);
