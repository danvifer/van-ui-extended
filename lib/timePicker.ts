import pikaday from "pikaday";
import van, { State } from "vanjs-core"
const { input, div, label, link } = van.tags

export const TimePickerComponent = (
  name: string,
  labelString: string,
  classInput: string,
  value: State<string>,
): HTMLElement => {
  const calendarInput = input({
    type: "text",
    class: classInput ? classInput : null,
    value: value.val,
    onchange: (e: Event) => {
      value.val = (e.target as HTMLInputElement).value
    },
  })

  const el = div(
    label({ for: name, style: "margin-right: 5px;" }, labelString),
    calendarInput,
    link({
      rel: "stylesheet",
      type: "text/css",
      href: "https://cdn.jsdelivr.net/npm/pikaday/css/pikaday.css",
    }),
  )

  new pikaday({
    field: calendarInput as HTMLInputElement,
    format: "YYYY/MM/DD",
    container: el as HTMLElement,
    firstDay: 1,
    toString(date) {
      const day = date.getDate()
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      return `${year}-${("0" + month).slice(-2)}-${("0" + day).slice(-2)}`
    },
    parse(dateString) {
      const parts = dateString.split("/")
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const year = parseInt(parts[2], 10)
      return new Date(year, month, day)
    },
  })

  return el as HTMLElement
}

export default TimePickerComponent 