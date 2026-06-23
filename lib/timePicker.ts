import van, { State } from "vanjs-core"
const { input, div, label } = van.tags

// TimePickerComponent renders a date picker over the browser-native
// <input type="date">. This deliberately drops the Pikaday dependency (and the
// CDN <link> it injected, which violated strict Content-Security-Policy): the
// native control gives an accessible calendar UI, an ISO `YYYY-MM-DD` value,
// and zero runtime dependencies. The exported signature is unchanged.
export const TimePickerComponent = (
  name: string,
  labelString: string,
  classInput: string,
  value: State<string>,
): HTMLElement => {
  const calendarInput = input({
    type: "date",
    name,
    class: classInput ? classInput : null,
    value: value.val,
    onchange: (e: Event) => {
      value.val = (e.target as HTMLInputElement).value
    },
  })

  return div(
    label({ for: name, style: "margin-right: 5px;" }, labelString),
    calendarInput,
  )
}

export default TimePickerComponent
