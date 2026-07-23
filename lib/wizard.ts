import van, { ChildDom, State } from "vanjs-core";
const { div, button, span } = van.tags;
const { circle, path, svg } = van.tags("http://www.w3.org/2000/svg")

export type Step = {
  name: string
  element: ChildDom | readonly ChildDom[]
  stepValid: State<boolean>
  preAction?: () => void | Promise<void>
  postAction?: () => void | Promise<void>
}

/** Tailwind color token, e.g. "sky-700" or "orange-500". */
export type TailwindColorToken = `${string}-${number}`
/** CSS color value: hex or rgb()/rgba() functional notation. */
export type CssColorValue = `#${string}` | `rgb(${string})` | `rgba(${string})`

export interface WizardProps {
  readonly steps: Step[]
  readonly title: string
  closed: State<boolean>
  readonly closeWizard: () => void
  readonly prevLabel?: string
  readonly nextLabel?: string
  readonly createLabel?: string
  readonly loadingLabel?: string
  readonly primaryColor?: TailwindColorToken
  readonly secondaryColor?: TailwindColorToken
  readonly backgroundColor?: CssColorValue
  readonly modalClass?: string
  readonly customPrimaryButtonStyle?: string
  readonly customSecondaryButtonStyle?: string
}

export const WizardComponent = (
  {
    steps,
    title,
    closeWizard,
    closed,
    prevLabel = "prev",
    nextLabel = "next",
    createLabel = "Create",
    loadingLabel = "Loading",
    primaryColor = "sky-700",
    secondaryColor = "sky-900",
    backgroundColor,
    modalClass = "bg-stone-900 text-white w-4/5 h-full overflow-auto relative",
    customPrimaryButtonStyle = "",
    customSecondaryButtonStyle = "cursor: pointer;",
  }: WizardProps,
  ..._children: readonly ChildDom[]
) => {
  const loading = van.state(false)
  // Consumers using non-default colors must ensure the resulting bg-*/hover:bg-*
  // classes are reachable by their Tailwind build (e.g. @source inline).
  const primaryButtonClass = `bg-${primaryColor} hover:bg-${secondaryColor} text-white font-bold py-2 px-4 mt-2 mb-2 rounded mx-2 disabled:opacity-75 disabled:cursor-not-allowed !important cursor-pointer`
  const secondaryButtonClass = `bg-${primaryColor} hover:bg-${secondaryColor} text-white font-bold py-2 px-4 mt-2 mb-2 rounded cursor-pointer`

  async function executeActions(
    preAction?: () => void | Promise<void>,
    postAction?: () => void | Promise<void>,
    close?: boolean,
  ) {
    if (postAction) {
      loading.val = true
      await postAction()
      loading.val = false
    }
    if (preAction) {
      loading.val = true
      await preAction()
      loading.val = false
    }
    if (close) {
      closed.val = true
    }
  }

  const step = van.state(0)

  const prevButton = van.derive(() =>
    step.val > 0
      ? button(
          {
            class: secondaryButtonClass,
            type: "submit",
            style: customSecondaryButtonStyle,
            onclick: () => step.val--,
          },
          prevLabel,
        )
      : "",
  )

  const nextButton = van.derive(() =>
    step.val < steps.length - 1
      ? button(
          {
            class: primaryButtonClass,
            type: "submit",
            style: customPrimaryButtonStyle,
            disabled: () => !steps[step.val].stepValid.val,
            onclick: () => {
              executeActions(
                steps[step.val + 1].preAction,
                steps[step.val].postAction,
              )
              step.val++
            },
          },
          nextLabel,
        )
      : "",
  )

  const saveButton = van.derive(() =>
    step.val === steps.length - 1
      ? button(
          {
            class: primaryButtonClass,
            style: customPrimaryButtonStyle,
            disabled: () => !steps[step.val].stepValid.val,
            onclick: () => {
              executeActions(undefined, steps[step.val].postAction, true)
              closeWizard()
            },
          },
          span({ class: () => (loading.val ? "inline" : "hidden") },
            svg(
              { class: "mr-3 size-5 animate-spin inline", viewBox: "0 0 24 24" },
              circle({
                class: "opacity-25",
                cx: "12",
                cy: "12",
                r: "10",
                stroke: "white",
                "stroke-width": "4",
              }),
              path({
                class: "opacity-75",
                fill: "white",
                d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z",
              }),
            ),
            loadingLabel,
          ),
          span({ class: () => (loading.val ? "hidden" : "inline") }, createLabel),
        )
      : null,
  )

  const stepsInfo: ChildDom[] = []
  const currentStep = van.derive(() => steps[step.val].element)

  steps.forEach((val, index) => {
    stepsInfo.push(() =>
      div(
        { class: `flex my-2 ${index === step.val ? "text-[#658b8a]" : ""}` },
        span(
          {
            class: "mr-2",
            style:
              "width:28px; height: 28px;border: thin solid; border-width: medium;border-radius: 50%;flex: none;align-items: center;justify-content: center;line-height: normal;overflow: hidden;position: relative;text-align: center;vertical-align: middle;border-color: rgb(101, 139, 138)" +
              (index !== step.val ? "opacity-75 text-[#658b8a]" : ""),
          },
          index + 1,
        ),
        val.name,
      ),
    )
  })

  const overlay = div(
    {
      class:
        "fixed inset-0 z-[10000] flex items-stretch justify-end bg-black/50",
      style: () => (closed.val ? "display:none" : ""),
      onclick: (e: MouseEvent) => {
        if (e.target === e.currentTarget) {
          closed.val = true
          closeWizard()
        }
      },
    },
    div(
      {
        class: modalClass,
        style: backgroundColor ? `background-color: ${backgroundColor};` : "",
      },
      div(
        { class: "p-2" },
        button({
          class: "cursor-pointer og ogiconclose",
          onclick: () => {
            closed.val = true
            closeWizard()
          },
        }),
        span({ class: "inline text-xl ml-2" }, title),
      ),
      div(
        {
          class:
            "grid grid-cols-4 grid-rows-4 auto-rows-min md:grid-cols-6 lg:grid-cols-15 min-h-[calc(100vh-2rem)] bg-neutral-900 text-white",
          style: "border-top: 1px solid oklch(.372 .044 257.287);",
        },
        div(
          {
            class:
              "col-span-3 row-span-4 md:col-span-1 lg:col-span-3 text-white p-4 lg:block bg-stone-900",
            style: "border-right: 1px solid oklch(.372 .044 257.287);",
          },
          stepsInfo,
        ),
        () =>
          div(
            {
              class:
                "col-span-5 row-span-4 md:col-span-5 lg:col-span-12 p-6 bg-stone-900",
            },
            currentStep.val,
            div({ class: "absolute right-0 bottom-0" }, () =>
              span(prevButton.val, nextButton.val, saveButton.val),
            ),
          ),
      ),
    ),
  )

  van.add(document.body, overlay)
}
