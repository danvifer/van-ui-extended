# van-ui-extended

A comprehensive library of reusable graphical components built on top of [VanJS](https://vanjs.org/). This project extends the core VanJS capabilities with advanced UI components and third-party integrations.

## Key Features

- **VanJS Integration**: Built with simplicity and performance in mind using VanJS.
- **Advanced Components**: Includes complex components like data tables, wizards, and cron editors.
- **Third-party Integrations**:
  - **CodeMirror**: Full-featured code editor with JS, JSON, and Markdown support.
  - **ECharts**: Powerful charting and visualization.
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

This will start a [Vite](https://vitejs.dev/) development server. You can access the demo page at `http://localhost:5173`. The entry point for the demo/testing is `lib/main.ts`.

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
