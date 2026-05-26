import van from "vanjs-core";
import { xLastValue } from "../../lib/xLastValue";

const { div, h3 } = van.tags;

export const xLastValueWidget = (): HTMLElement =>
  div(
    { class: "h-full w-full flex flex-col p-3 gap-2" },
    h3({ class: "text-sm font-semibold text-slate-700" }, "xLastValue"),
    div(
      { class: "grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1" },
      xLastValue({
        value: "23.5 °C",
        title: "Temperatura",
        subtitle: "DHT22",
      }),
      xLastValue({
        value: "61 %",
        title: "Humedad",
        subtitle: "DHT22",
      }),
      xLastValue({
        value: "1013 hPa",
        title: "Presión",
        subtitle: "BMP280",
        onClick: () => console.log("xLastValue clicked"),
      }),
    ),
  );
