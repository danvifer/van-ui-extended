import van, { State, ChildDom } from "vanjs-core"
const { div, button, img, span } = van.tags
const { path, svg } = van.tags("http://www.w3.org/2000/svg")

export type Value<T = string> = {
  img?: string
  value?: T
  description?: string
  label?: string
  func?: (value: T) => void
}

export interface SelectProps<T = string> {
  readonly values: Value<T>[]
  readonly selected?: T
  /** Classes of the outer `<div>` and prefix of the trigger button. Replaces the default `vx-legacy-select`. */
  readonly selectClass?: string
  /** Extra classes appended to the options menu. */
  readonly optionsClass?: string
  /** Extra classes appended to every option. */
  readonly optionClass?: string
  readonly multiple?: boolean
  readonly footer?: ChildDom[]
  readonly multipleValues?: State<T[]>
}

export const Select = <T extends string | number>({
  values = [],
  selected,
  selectClass = "vx-legacy-select",
  optionsClass = "",
  optionClass = "",
  multiple = false,
  footer = [],
  multipleValues = van.state<T[]>([]),
}: SelectProps<T>) => {
  const innerValue = van.state<Node | string | number | boolean | null | undefined>(
    null,
  )

  function removeElement(value: T | undefined) {
    if (value !== undefined) {
      const removeIndex =
        multipleValues.val.findIndex((val) => val === value) ?? -1
      if (removeIndex !== -1) {
        multipleValues.val.splice(removeIndex, 1)
        fillSelect()
      }
    }
  }

  function fillSelect() {
    const options: ChildDom[] = []
    multipleValues.val.forEach((currentValue) => {
      const innerVal = values.find((val) => val.value === currentValue)
      options.push(
        span(
          {
            class: "vx-legacy-select__chip",
          },
          innerVal?.label,
          button(
            {
              class: "vx-legacy-select__chip-remove",
              onclick: () => removeElement(innerVal?.value),
            },
            svg(
              {
                xmlns: "http://www.w3.org/2000/svg",
                width: "12",
                height: "12",
                fill: "currentColor",
                class: "vx-legacy-select__chip-icon",
                viewBox: "0 0 1792 1792",
              },
              path({
                d: "M1490 1322q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68 28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294 294 294q28 28 28 68z",
              }),
            ),
          ),
        ),
      )
    })
    innerValue.val = span(options)
  }

  function setValue(value: T, func: ((value: T) => void) | undefined) {
    const innerVal = values.find((val) => val.value === value)
    if (multipleValues.val.find((val) => val === value)) {
      removeElement(value)
    } else {
      if (innerVal) {
        if (multiple) {
          multipleValues.val.push(innerVal.value!)
          fillSelect()
        } else {
          innerValue.val = span(
            innerVal.img
              ? img({
                  src: innerVal.img || "",
                  class: "vx-legacy-select__img",
                })
              : null,
            innerVal.label,
          )
        }
      }
      if (func) {
        func(value)
      }
    }
  }

  let initialVal =
    selected !== undefined
      ? values.find((val) => val.value === selected)
      : values[0]

  if (initialVal) {
    if (multiple) {
      if (initialVal.value !== undefined) {
        multipleValues.val.push(initialVal.value)
      }
      fillSelect()
    } else {
      innerValue.val = span(
        initialVal.img
          ? img({
              src: initialVal.img || "",
              class: "vx-legacy-select__img",
            })
          : null,
        initialVal.label,
      )
    }
  }

  return div(
    { class: selectClass },
      div(
        { class: "vx-legacy-select__wrap" },
        button(
          {
            class: selectClass + " vx-legacy-select__trigger",
          },
          innerValue as unknown as ChildDom,
        ),
        div(
          {
            id: "select-father",
            class: "vx-legacy-select__menu " + optionsClass,
          },
          div(
            { class: "vx-legacy-select__scroll" },
            values.map((value) =>
              div(
                {
                  class: "vx-legacy-select__option " + optionClass,
                  onclick: () => setValue(value.value!, value.func),
                },
                value.img
                  ? img({
                      src: value.img || "",
                      class: "vx-legacy-select__img",
                    })
                  : null,
                value.label,
                value.description
                  ? div({ class: "vx-legacy-select__desc" }, value.description)
                  : null,
              ),
            ),
            footer.length > 0
              ? div({ class: "vx-legacy-select__footer" }, footer)
              : null,
          ),
        ),
      ),
    )
}
