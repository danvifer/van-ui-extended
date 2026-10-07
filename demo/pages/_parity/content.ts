import van, { type ChildDom } from "vanjs-core";
import { xButton } from "../../../lib/xButton";
import { xLastValue } from "../../../lib/xLastValue";
import { xSelect, xOption } from "../../../lib/xSelect";
import { xTable } from "../../../lib/xTable/xTable";
import type { XColumn } from "../../../lib/xTable/xTable.types";
import { TextAreaComponent } from "../../../lib/textarea";
import { Select } from "../../../lib/select";
import { TableComponent } from "../../../lib/table";
import { WizardComponent } from "../../../lib/wizard";
import { xDashboard } from "../../../lib/xDashboard";

/**
 * Every component rendered with its DEFAULT styling props, for visual parity checks.
 * The page chrome uses inline styles only, so the Tailwind build (`index.html`) and the
 * Tailwind-free build (`bare.html`) differ in nothing but the library's own CSS.
 */

const { div, section, h2, span, p, button } = van.tags;

const block = (id: string, title: string, ...children: ChildDom[]): HTMLElement =>
  section(
    { id, style: "padding:16px 24px;border-bottom:1px dashed #9ca3af" },
    h2({ style: "font:600 13px/1.4 system-ui,sans-serif;margin:0 0 10px;color:#6b7280" }, title),
    ...children,
  );

const row = (...children: ChildDom[]): HTMLElement =>
  div({ style: "display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start" }, ...children);

const box = (width: number, ...children: ChildDom[]): HTMLElement =>
  div({ style: `width:${width}px` }, ...children);

interface User {
  id: number;
  name: string;
  city: string;
  role: string;
}

const users: User[] = [
  { id: 1, name: "Alice Johnson", city: "Madrid", role: "Engineer" },
  { id: 2, name: "Bob Martinez", city: "Barcelona", role: "Designer" },
  { id: 3, name: "Carla Singh", city: "Madrid", role: "PM" },
  { id: 4, name: "Diego Ferreira", city: "Valencia", role: "Engineer" },
  { id: 5, name: "Eva Nguyen", city: "Bilbao", role: "Data Scientist" },
  { id: 6, name: "Faisal Rahman", city: "Sevilla", role: "Engineer" },
  { id: 7, name: "Greta Olsen", city: "Madrid", role: "Designer" },
];

const userCols: XColumn<User>[] = [
  { key: "name", label: "Name", sortable: true, columnFilter: "basic" },
  { key: "city", label: "City", sortable: true, columnFilter: "select" },
  { key: "role", label: "Role", align: "right" },
];

const fullTable = (theme: "dark" | "material"): HTMLElement =>
  div(
    { style: "height:420px;display:flex;flex-direction:column" },
    xTable<User>({
      rows: van.state(users),
      columns: userCols,
      rowKey: "id",
      theme,
      bordered: true,
      selection: "multiple",
      selected: van.state([users[1]]),
      expanded: van.state([1]),
      filterCellsVisible: () => true,
      pagination: van.state({ page: 1, rowsPerPage: 5 }),
      slots: {
        expandedRow: ({ row: r }) => div(`Details for ${r.name}`),
      },
    }),
  );

const legacyTable = (actions: number, condensed: boolean): ChildDom =>
  TableComponent({
    columns: [
      { key: "sensor", label: "Sensor", order: true, filter: "basic" },
      {
        key: "status",
        label: "Status",
        filter: "checks",
        filterValues: van.state([
          { value: van.state(true), uuid: "OK" },
          { value: van.state(false), uuid: "Warning" },
        ]),
      },
      {
        key: "unit",
        label: "Unit",
        filter: "complex",
        filterValues: van.state([{ value: van.state(false), label: "°C" }]),
      },
      { key: "value", label: "Value" },
    ],
    data: van.state([
      { sensor: "Temperatura", value: 23.5, unit: "°C", status: "OK" },
      { sensor: "Humedad", value: 61, unit: "%", status: "OK" },
      { sensor: "CO2", value: 412, unit: "ppm", status: "Warning" },
    ]),
    addMultiSelect: true,
    condensed,
    actionsColumn: Array.from({ length: actions }, (_, i) => ({
      label: `Act ${i + 1}`,
      func: () => undefined,
      disable: () => i === 1,
    })),
    pagination: {
      page: van.state(1),
      pages: van.state(3),
      elements: van.state(25),
      firstFunc: () => undefined,
      prevFunc: () => undefined,
      nextFunc: () => undefined,
      lastFunc: () => undefined,
      selectFunc: () => undefined,
    },
  }) as ChildDom;

export const parityContent = (): HTMLElement => {
  const wizardClosed = van.state(true);

  return div(
    block(
      "xbutton",
      "xButton",
      row(
        xButton({ label: "Default" }),
        xButton({ label: "Disabled", disabled: true }),
        xButton({ label: "With icon", icon: span("★") }),
      ),
    ),
    block(
      "xlastvalue",
      "xLastValue",
      div(
        { style: "display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:960px" },
        xLastValue({ value: "23.5 °C", title: "Temperatura", subtitle: "DHT22" }),
        xLastValue({ value: "1013 hPa", title: "Presión", subtitle: "Clickable", onClick: () => undefined }),
        xLastValue({ value: "61 %", title: "Humedad", preicon: span("▲"), posticon: span("%") }),
      ),
    ),
    block(
      "xselect",
      "xSelect",
      row(
        box(260, xSelect({ placeholder: "Single" }, xOption({ data: "Alpha", value: "a" }), xOption({ data: "Beta", value: "b" }), xOption({ data: "Gamma", value: "g", disabled: true }))),
        box(260, xSelect({ searchable: true, placeholder: "Searchable" }, xOption({ data: "Alpha", value: "a" }), xOption({ data: "Beta", value: "b" }))),
        box(260, xSelect({ multiple: true, clearable: true, placeholder: "Multiple" }, xOption({ data: "Alpha", value: "a", selected: true }), xOption({ data: "Beta", value: "b" }), xOption({ data: "Gamma", value: "g", disabled: true }))),
        box(260, xSelect({ disabled: true, placeholder: "Disabled" }, xOption({ data: "Alpha", value: "a" }))),
      ),
    ),
    block("xtable-dark", "xTable — dark", fullTable("dark")),
    block("xtable-material", "xTable — material", fullTable("material")),
    block(
      "xtable-states",
      "xTable — loading (dark) / empty (material, dense, flat, square)",
      row(
        box(460, xTable<User>({ rows: van.state(users.slice(0, 2)), columns: userCols, rowKey: "id", loading: van.state(true) })),
        box(460, xTable<User>({ rows: van.state([]), columns: userCols, rowKey: "id", theme: "material", dense: true, flat: true, square: true })),
      ),
    ),
    block("textarea", "TextAreaComponent", box(420, TextAreaComponent(van.state("Hello"), 80))),
    block(
      "legacy-select",
      "Select (legacy)",
      row(
        Select<string>({ values: [{ value: "a", label: "Alpha", description: "First" }, { value: "b", label: "Beta" }] }),
        Select<string>({
          values: [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }],
          multiple: true,
          multipleValues: van.state(["a", "b"]),
        }),
      ),
    ),
    block("legacy-table", "TableComponent (legacy) — 2 inline actions", legacyTable(2, false)),
    block("legacy-table-menu", "TableComponent (legacy) — 5 actions (menu), condensed", legacyTable(5, true)),
    block(
      "dashboard",
      "xDashboard — render-error fallback",
      div(
        { style: "height:120px" },
        xDashboard({
          column: 12,
          cellHeight: 100,
          items: [
            {
              id: "boom",
              x: 0,
              y: 0,
              w: 4,
              h: 1,
              content: () => {
                throw new Error("parity check");
              },
            },
          ],
        }),
      ),
    ),
    block(
      "wizard",
      "WizardComponent",
      button(
        {
          id: "open-wizard",
          // Preflight's button reset inline, so the page looks the same with and without Tailwind.
          style: "font:inherit;color:inherit;background:transparent;border:0;padding:0;margin:0;border-radius:0",
          onclick: () => (wizardClosed.val = false),
        },
        "Open wizard",
      ),
      p({ style: "margin:0;font:12px system-ui;color:#6b7280" }, "Opens a fixed overlay."),
      WizardComponent({
        title: "Register device",
        closed: wizardClosed,
        closeWizard: () => (wizardClosed.val = true),
        steps: [
          { name: "Name", element: div("Step one"), stepValid: van.state(true) },
          { name: "Type", element: div("Step two"), stepValid: van.state(false) },
          { name: "Review", element: div("Step three"), stepValid: van.state(true) },
        ],
      }) as ChildDom,
    ),
  );
};
