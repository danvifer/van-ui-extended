import van, { State } from "vanjs-core"
import { xButton, xLastValue, TableComponent, xChart } from "./index"
import L from "leaflet"
const tags = van.tags
const { svg, path } = van.tags("http://www.w3.org/2000/svg")
export interface WidgetProps {
  readonly type: string
  readonly widgetConfiguration: any
  readonly onReload?: any
}
export const Widget = ({
  type = "table",
  widgetConfiguration = {},
  onReload = () => {},
}: WidgetProps) => {
  let widget: HTMLElement | null = null
  switch (type) {
    case "table":
      widget = tags.div(
        TableComponent({
          ...widgetConfiguration,
        }),
      )
      break
    case "lastValue":
      widget = xLastValue({
        ...widgetConfiguration,
      })
      break
    case "chart":
      widget = xChart({
        options: widgetConfiguration.option ?? {},
        theme: widgetConfiguration.theme,
        onInit: widgetConfiguration.onInit,
        events: widgetConfiguration.events,
        width: widgetConfiguration.width ?? "100%",
        height: widgetConfiguration.height ?? "90%",
        className: widgetConfiguration.className,
        ariaLabel: widgetConfiguration.ariaLabel,
      })
      break
  }
  let container = tags.div({ style: "height:100%" }, [
    widget,
  ])
  return container
}
export default Widget
