# van-ui-extended

A comprehensive library of reusable graphical components built on top of [VanJS](https://vanjs.org/). This project extends the core VanJS capabilities with advanced UI components and third-party integrations.

## Key Features

- **VanJS Integration**: Built with simplicity and performance in mind using VanJS.
- **Advanced Components**: Includes complex components like data tables, wizards, and cron editors.
- **Third-party Integrations**:
  - **CodeMirror**: Full-featured code editor with JS, JSON, and Markdown support.
  - **ECharts**: Powerful charting and visualization.
  - **GridStack**: Draggable / resizable dashboard layouts (via `xDashboard`).
  - **Leaflet**: Interactive maps.
  - **Pikaday**: Lightweight date picking.
- **Tailwind CSS**: Styled using modern Utility-first CSS.
- **TypeScript**: Fully typed for a better developer experience.

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/danvifer/van-ui-extended.git
cd van-ui-extended
npm install
```

### Development Mode

To start the project in development mode with hot-reload:

```bash
npm run dev
```

This will start a [Vite](https://vitejs.dev/) development server on `http://localhost:3030`. Demo pages live under `demo/`:

- `/` — dashboard home (`demo/main.ts`) showcasing every component inside an `xDashboard`.
- `/demo/pages/<component>/` — isolated demo per component.

### Build

To build the library for production:

```bash
npm run build
```

The output will be generated in the `dist` directory.

To generate TypeScript declarations:

```bash
npm run types
```

## Available Components

The library exports the following components:

- `TableComponent`: Advanced data table with search and pagination.
- `TextAreaComponent`: Enhanced text area.
- `Select`: Standard select component.
- `xSelect` / `xOption`: Extended select component with search and custom rendering.
- `WizardComponent`: Step-by-step wizard interface.
- `CronComponent`: Visual cron expression editor.
- `Widget`: Base widget container.
- `TimePickerComponent`: Simple time selection.
- `xButton`: Extended button component.
- `xLastValue`: Component for displaying historical data/values.
- `xCodeMirror`: Integration with CodeMirror 6.
- `xChart`: ECharts wrapper with reactive options.
- `xDashboard`: Draggable / resizable dashboard grid powered by GridStack.
- `xTable`: Feature-rich data table — sorting, a collapsible per-column filter row, pagination, row selection, expandable rows, virtual scrolling and light/dark themes.

### `xDashboard`

Wrapper around [GridStack](https://gridstackjs.com/) following the VanJS reactive prop pattern. Each item carries its own `HTMLElement` (or factory), and the grid emits layout changes via `onChange`.

`gridstack` is a **peer dependency** — install it in your app:

```bash
npm install gridstack
```

You must also import GridStack's CSS once at your app entry:

```ts
import "gridstack/dist/gridstack.min.css"
```

Minimal usage:

```ts
import van from "vanjs-core"
import { xDashboard } from "van-ui-extended"

const dashboard = xDashboard({
  column: 12,
  cellHeight: 80,
  items: [
    { id: "a", x: 0, y: 0, w: 6, h: 4, content: someChart() },
    { id: "b", x: 6, y: 0, w: 6, h: 4, content: someTable() },
  ],
  onChange: (nodes) => console.log("layout", nodes),
})

van.add(document.body, dashboard)
```

### `xTable`

Feature-rich, reactive data table. Rows are a VanJS `State<T[]>`; columns declare their key, label, alignment and per-column sort/filter. It supports:

- Client- or server-side **pagination** (a `pagination` state, or an `onRequest` hook for server mode). The pagination footer renders as a fixed bar **outside** the scroll region, so it never overlaps rows.
- A collapsible **per-column filter row** below the headers (`filterCellByKey` + `filterCellsVisible`).
- **Sorting**, **row selection**, **expandable rows** and **virtual scrolling** for large datasets.
- Custom cell rendering via slots (`headerCellByKey` / `bodyCellByKey` / `slots`) and light/dark **themes**.

The source lives under `lib/xTable/` (split into `xTable.body`, `xTable.filter`, `xTable.pagination`, `xTable.selection`, `xTable.themes`, `xTable.virtualScroll`, …); import the public component and its types from the package root.

Minimal usage:

```ts
import van from "vanjs-core"
import { xTable } from "van-ui-extended"
import type { XColumn } from "van-ui-extended"

type Row = { id: string; name: string; status: string }

const rows = van.state<Row[]>([
  { id: "1", name: "edge-01", status: "up" },
  { id: "2", name: "nas-01", status: "down" },
])

const columns: XColumn<Row>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "status", label: "Status" },
]

van.add(document.body, xTable<Row>({ rows, columns, rowKey: (r) => r.id }))
```

An optional `scrollClass` prop overrides the inner scroll region's classes (default `"flex-1 min-h-0 overflow-auto"`).

## Example Usage

```javascript
import van from "vanjs-core"
import { xSelect, xOption } from "van-ui-extended"

const MyComponent = () => {
  return xSelect(
    { placeholder: "Select a language" },
    xOption({ value: "js", text: "JavaScript" }),
    xOption({ value: "ts", text: "TypeScript" })
  )
}

van.add(document.body, MyComponent())
```

## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](LICENSE) file for details.
