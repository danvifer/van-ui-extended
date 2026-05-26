import van from "vanjs-core";
import { TableComponent } from "../../lib/table";

const { div, h3 } = van.tags;

interface SensorRow {
  sensor: string;
  value: number;
  unit: string;
  status: "OK" | "Warning" | "Critical";
}

const initialData: SensorRow[] = [
  { sensor: "Temperatura", value: 23.5, unit: "°C", status: "OK" },
  { sensor: "Humedad", value: 61, unit: "%", status: "OK" },
  { sensor: "Presión", value: 1013, unit: "hPa", status: "OK" },
  { sensor: "CO2", value: 412, unit: "ppm", status: "Warning" },
  { sensor: "PM2.5", value: 38, unit: "µg/m³", status: "Critical" },
];

export const tableWidget = (): HTMLElement => {
  const data = van.state<SensorRow[]>(initialData);

  return div(
    { class: "h-full w-full flex flex-col p-3 gap-2 overflow-auto" },
    h3({ class: "text-sm font-semibold text-slate-700" }, "TableComponent"),
    div(
      { class: "flex-1 min-h-0 overflow-auto" },
      TableComponent({
        columns: [
          { key: "sensor", label: "Sensor" },
          { key: "value", label: "Value" },
          { key: "unit", label: "Unit" },
          { key: "status", label: "Status" },
        ],
        data,
        tableClass:
          "table-auto text-pretty border-collapse text-sm w-full",
      }),
    ),
  );
};
