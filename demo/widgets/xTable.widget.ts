import van from "vanjs-core";
import { xTable } from "../../lib/xTable/xTable";
import type { XColumn, PaginationState } from "../../lib/xTable/xTable.types";

const { div, h3 } = van.tags;

interface Row {
  id: number;
  name: string;
  city: string;
  role: string;
  status: "active" | "inactive";
}

const initialData: Row[] = [
  { id: 1, name: "Alice Johnson", city: "Madrid", role: "Engineer", status: "active" },
  { id: 2, name: "Bob Martinez", city: "Barcelona", role: "Designer", status: "active" },
  { id: 3, name: "Carla Singh", city: "Madrid", role: "PM", status: "active" },
  { id: 4, name: "Diego Ferreira", city: "Valencia", role: "Engineer", status: "inactive" },
  { id: 5, name: "Eva Nguyen", city: "Bilbao", role: "Data Scientist", status: "active" },
  { id: 6, name: "Faisal Rahman", city: "Sevilla", role: "Engineer", status: "active" },
  { id: 7, name: "Greta Olsen", city: "Madrid", role: "Designer", status: "active" },
  { id: 8, name: "Hugo Petit", city: "Barcelona", role: "PM", status: "inactive" },
  { id: 9, name: "Inés Costa", city: "Valencia", role: "Engineer", status: "active" },
  { id: 10, name: "Jakub Novak", city: "Bilbao", role: "Data Scientist", status: "active" },
  { id: 11, name: "Kalia Brown", city: "Madrid", role: "Engineer", status: "active" },
  { id: 12, name: "Liam O'Connor", city: "Sevilla", role: "PM", status: "inactive" },
];

const columns: XColumn<Row>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "city", label: "City", sortable: true, columnFilter: "select" },
  { key: "role", label: "Role", sortable: true, columnFilter: "select" },
  { key: "status", label: "Status", sortable: true, columnFilter: "select" },
];

export const xTableWidget = (): HTMLElement => {
  const rows = van.state<Row[]>(initialData);
  // Caller-owned pagination so the footer (pinned outside the scroll area) drives it.
  const pagination = van.state<PaginationState>({ page: 1, rowsPerPage: 5 });

  return div(
    { class: "h-full w-full flex flex-col p-3 gap-2 overflow-hidden" },
    h3({ class: "text-sm font-semibold text-slate-700" }, "xTable"),
    div(
      { class: "flex-1 min-h-0" },
      xTable<Row>({
        rows,
        columns,
        rowKey: (r) => r.id,
        theme: "material",
        pagination,
      }),
    ),
  );
};
