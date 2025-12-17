import van, { State } from "vanjs-core"
import L from "leaflet"
import * as echarts from "echarts"
const tags = van.tags
import { TableComponent } from "./index"
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
  const widget = TableComponent({
    ...widgetConfiguration,
  })
  let container = [
    tags.div(
      tags.button(
        {
          onclick: () => {
            onReload()
          },
        },
        "RELOAD"
      )
    ),
    widget,
  ]
  return container
}
export default Widget
