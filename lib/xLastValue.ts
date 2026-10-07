import van, { ChildDom } from "vanjs-core"

const { div, span } = van.tags

export interface XLastValueProps {
  readonly value: any
  readonly preicon?: string | ChildDom
  readonly posticon?: string | ChildDom
  readonly title?: string
  readonly subtitle?: string
  readonly onClick?: (ev: MouseEvent) => void
  /** Classes of the root. Replaces the default `vx-last-value`; pass `"vx-last-value extra"` to extend it. */
  readonly className?: string
  /** Replaces the default `vx-last-value__title`. */
  readonly titleClass?: string
  /** Replaces the default `vx-last-value__subtitle`. */
  readonly subtitleClass?: string
  /** Replaces the default `vx-last-value__preicon`. */
  readonly preiconClass?: string
  /** Replaces the default `vx-last-value__posticon`. */
  readonly posticonClass?: string
  /** Replaces the default `vx-last-value__value`. The fixed `vx-last-value__value-base` (single line, ellipsis) stays. */
  readonly valueClass?: string
  /** Hover look, only applied when `onClick` is set. Replaces the default `vx-last-value--hover`. */
  readonly hoverClass?: string
}

export const xLastValue = (
  {
    value,
    preicon,
    posticon,
    title = "",
    subtitle = "",
    onClick,
    className = "vx-last-value",
    titleClass = "vx-last-value__title",
    subtitleClass = "vx-last-value__subtitle",
    valueClass = "vx-last-value__value",

    hoverClass = "vx-last-value--hover",
    preiconClass = "vx-last-value__preicon",
    posticonClass = "vx-last-value__posticon",
  }: XLastValueProps,
  ...children: ChildDom[]
) => {
  const interactiveClasses = onClick ? `vx-last-value--clickable ${hoverClass}` : ""
  const classes = `${className} ${interactiveClasses}`.trim()

  const preNode =
    preicon == null
      ? null
      : typeof preicon === "string"
      ? span({ class: preicon, "aria-hidden": "true" })
      : preicon instanceof Node
      ? preicon.cloneNode(true)
      : preicon

  const postNode =
    posticon == null
      ? null
      : typeof posticon === "string"
      ? span({ class: posticon, "aria-hidden": "true" })
      : posticon instanceof Node
      ? posticon.cloneNode(true)
      : posticon

  const displayValue = value

  return div(
    { class: classes, onclick: (e: MouseEvent) => onClick?.(e) },

    title ? div({ class: titleClass }, title) : null,

    div(
      {
        class: "vx-last-value__row",
      },

      preNode ? div({ class: preiconClass }, preNode) : null,

      div(
        { class: "vx-last-value__main" },
        div(
          { class: ["vx-last-value__value-base", valueClass].join(" ").trim() },
          displayValue
        )
      ),

      postNode ? div({ class: posticonClass }, postNode) : null
    ),

    children.length
      ? div(
          {
            class: "vx-last-value__children",
          },
          ...children
        )
      : null,

    subtitle ? div({ class: subtitleClass }, subtitle) : null
  )
}
