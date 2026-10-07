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
  /**
   * Button background, any CSS color (`"#0369a1"`, `"oklch(0.5 0.13 242)"`). Sets
   * `--vx-wizard-btn-bg` on the overlay. Anything the browser does not parse as a color
   * logs a warning and keeps the default (sky-700).
   */
  readonly primaryColor?: string
  /** Button background on hover, any CSS color. Sets `--vx-wizard-btn-hover-bg`; default sky-900. */
  readonly secondaryColor?: string
  readonly backgroundColor?: CssColorValue
  /** Classes of the panel. Replaces the default `vx-wizard__panel`. */
  readonly modalClass?: string
  readonly customPrimaryButtonStyle?: string
  readonly customSecondaryButtonStyle?: string
}

/**
 * Inline declaration of a color token, or "" when the prop was not passed or is not a CSS
 * color: the stylesheet then falls back to its default instead of painting transparent
 * buttons. Without `CSS` (jsdom, SSR) the value cannot be checked and is trusted.
 */
const colorToken = (token: string, prop: string, value: string | undefined): string => {
  if (value === undefined) return ""
  // `;{}` would escape the inline declaration; reject it even where CSS.supports is missing.
  const invalid =
    value.trim() === "" ||
    /[;{}]/.test(value) ||
    (typeof CSS !== "undefined" && CSS.supports?.("color", value) === false)
  if (invalid) {
    console.warn(`WizardComponent: ${prop} "${value}" is not a CSS color; using the default.`)
    return ""
  }
  return `${token}: ${value};`
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
    primaryColor,
    secondaryColor,
    backgroundColor,
    modalClass = "vx-wizard__panel",
    customPrimaryButtonStyle = "",
    customSecondaryButtonStyle = "cursor: pointer;",
  }: WizardProps,
  ..._children: readonly ChildDom[]
) => {
  const loading = van.state(false)
  const colorTokens =
    colorToken("--vx-wizard-btn-bg", "primaryColor", primaryColor) +
    colorToken("--vx-wizard-btn-hover-bg", "secondaryColor", secondaryColor)
  const primaryButtonClass = "vx-wizard__btn vx-wizard__btn--primary"
  const secondaryButtonClass = "vx-wizard__btn"

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
          span({ hidden: () => !loading.val },
            svg(
              { class: "vx-wizard__spinner", viewBox: "0 0 24 24" },
              circle({
                class: "vx-wizard__spinner-track",
                cx: "12",
                cy: "12",
                r: "10",
                stroke: "white",
                "stroke-width": "4",
              }),
              path({
                class: "vx-wizard__spinner-arc",
                fill: "white",
                d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z",
              }),
            ),
            loadingLabel,
          ),
          span({ hidden: () => loading.val }, createLabel),
        )
      : null,
  )

  const stepsInfo: ChildDom[] = []
  const currentStep = van.derive(() => steps[step.val].element)

  steps.forEach((val, index) => {
    stepsInfo.push(() =>
      div(
        { class: `vx-wizard__step${index === step.val ? " vx-wizard__step--active" : ""}` },
        span(
          {
            class: `vx-wizard__step-num${index !== step.val ? " vx-wizard__step-num--inactive" : ""}`,
            style:
              "width:28px; height: 28px;border: thin solid; border-width: medium;border-radius: 50%;flex: none;align-items: center;justify-content: center;line-height: normal;overflow: hidden;position: relative;text-align: center;vertical-align: middle;border-color: rgb(101, 139, 138)",
          },
          index + 1,
        ),
        val.name,
      ),
    )
  })

  const overlay = div(
    {
      class: "vx-wizard",
      style: () => (closed.val ? "display:none;" : "") + colorTokens,
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
        { class: "vx-wizard__header" },
        button({
          class: "vx-wizard__close og ogiconclose",
          onclick: () => {
            closed.val = true
            closeWizard()
          },
        }),
        span({ class: "vx-wizard__title" }, title),
      ),
      div(
        {
          class: "vx-wizard__grid",
          style: "border-top: 1px solid oklch(.372 .044 257.287);",
        },
        div(
          {
            class: "vx-wizard__steps",
            style: "border-right: 1px solid oklch(.372 .044 257.287);",
          },
          stepsInfo,
        ),
        () =>
          div(
            { class: "vx-wizard__content" },
            currentStep.val,
            div({ class: "vx-wizard__actions" }, () =>
              span(prevButton.val, nextButton.val, saveButton.val),
            ),
          ),
      ),
    ),
  )

  van.add(document.body, overlay)
}
