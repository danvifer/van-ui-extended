import van, { State } from "vanjs-core"
import { xButton, xLastValue, TableComponent } from "./index"
import { v4 as uuidv4 } from "uuid"
import L from "leaflet"
import * as echarts from "echarts"
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
        })
      )
      break
    case "lastValue":
      widget = xLastValue({
        ...widgetConfiguration,
      })
      break
    case "chart":
      const id = uuidv4()
      widget = tags.div({
        id: id,
        style: "height: 100%;",
      })

      setTimeout(() => {
        let chartDom = document.getElementById(id)
        let myChart = echarts.init(chartDom, null, {
          renderer: "svg",
        })
        const container = document.getElementById(id)
        if (container) {
          new ResizeObserver(() => {
            myChart.resize()
            console.log("Resize")
          }).observe(container)
        }
        widgetConfiguration.option &&
          myChart.setOption(widgetConfiguration.option)
      }, 1000)
      break
  }
  let container = tags.div({ style: "height:90%" }, [
    tags.div(
      xButton({
        icon: svg(
          {
            xmlns: "http://www.w3.org/2000/svg",
            fill: "none",
            viewBox: "0 0 24 24",
            "stroke-width": "1.5",
            stroke: "currentColor",
            class: "size-6",
          },
          path({
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            d: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99",
          })
        ),
        onClick: () => {
          onReload()
        },
      })
    ),
    widget,
  ])
  return container
}
export default Widget
