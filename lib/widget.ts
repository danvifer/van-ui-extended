import van from "vanjs-core"
import type { EChartsOption } from "echarts"
import { xLastValue, TableComponent, xChart } from "./index"
import type { ECharts } from "echarts"
const tags = van.tags

export interface TableWidgetConfig {
  readonly columns: ReadonlyArray<{ key: string; label: string }>
  readonly data: unknown
  readonly tableClass?: string
}

export interface LastValueWidgetConfig {
  readonly value: unknown
  readonly title?: string
  readonly subtitle?: string
  readonly className?: string
}

export interface ChartWidgetConfig {
  readonly option: EChartsOption
  readonly theme?: string | object
  readonly height?: string
  readonly width?: string
  readonly className?: string
  readonly ariaLabel?: string
  readonly onInit?: (chart: ECharts) => void
}

export type WidgetProps =
  | { readonly type: "table"; readonly widgetConfiguration: TableWidgetConfig; readonly onReload?: () => void }
  | { readonly type: "lastValue"; readonly widgetConfiguration: LastValueWidgetConfig; readonly onReload?: () => void }
  | { readonly type: "chart"; readonly widgetConfiguration: ChartWidgetConfig; readonly onReload?: () => void }

export const Widget = (props: WidgetProps): HTMLElement => {
  let widget: HTMLElement | null = null

  switch (props.type) {
    case "table":
      widget = tags.div(
        TableComponent(props.widgetConfiguration as Parameters<typeof TableComponent>[0]),
      )
      break
    case "lastValue":
      widget = xLastValue(props.widgetConfiguration as Parameters<typeof xLastValue>[0])
      break
    case "chart":
      widget = xChart({
        options: props.widgetConfiguration.option,
        theme: props.widgetConfiguration.theme,
        onInit: props.widgetConfiguration.onInit,
        width: props.widgetConfiguration.width ?? "100%",
        height: props.widgetConfiguration.height ?? "90%",
        className: props.widgetConfiguration.className,
        ariaLabel: props.widgetConfiguration.ariaLabel,
      })
      break
  }

  return tags.div({ style: "height:100%" }, [widget]) as HTMLElement
}

export default Widget
