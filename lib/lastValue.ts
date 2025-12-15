import van, { ChildDom } from "vanjs-core"

const { div, span } = van.tags

export interface XLastValueProps {
  readonly value: any
  readonly preicon?: string | ChildDom
  readonly posticon?: string | ChildDom
  readonly title?: string
  readonly subtitle?: string
  readonly onClick?: (ev: MouseEvent) => void
  readonly className?: string
  readonly titleClass?: string
  readonly subtitleClass?: string
  readonly preiconClass?: string
  readonly posticonClass?: string
  readonly valueClass?: string
  readonly hoverClass?: string
}

export const xlastValue = (
  {
    value,
    preicon,
    posticon,
    title = "",
    subtitle = "",
    onClick,
    className = "",
    titleClass = "px-4 pt-3 text-sm text-stone-300",
    subtitleClass = "px-4 pb-3 text-xs text-stone-400 truncate",
    valueClass =
      "text-right font-light tabular-nums tracking-tight text-white " +
      "text-[clamp(1.25rem,4vw,1.875rem)] sm:text-3xl md:text-4xl lg:text-5xl",

    hoverClass = "hover:bg-neutral-800 hover:border-stone-700",
    preiconClass = "shrink-0 flex items-center justify-center",
    posticonClass = "shrink-0 flex items-center justify-center text-stone-400",
  }: XLastValueProps,
  ...children: ChildDom[]
) => {
  const baseClasses =
    "w-full rounded-md border border-stone-800 bg-neutral-900 text-white select-none"

  const interactiveClasses = onClick ? `cursor-pointer ${hoverClass}` : ""
  const classes = `${baseClasses} ${interactiveClasses} ${className}`.trim()

  const preNode =
    preicon == null
      ? null
      : typeof preicon === "string"
        ? span({ class: preicon, "aria-hidden": "true" })
        : preicon

  const postNode =
    posticon == null
      ? null
      : typeof posticon === "string"
        ? span({ class: posticon, "aria-hidden": "true" })
        : posticon

  const displayValue = value

  return div(
    { class: classes, onclick: (e: MouseEvent) => onClick?.(e) },

    title ? div({ class: titleClass }, title) : null,

    div(
      {
        class:
          "px-4 py-4 flex items-center gap-3 flex-nowrap justify-between",
      },

      preNode ? div({ class: preiconClass }, preNode) : null,

      div(
        { class: "flex-1 min-w-0" },
        div({ class: ["leading-none truncate", valueClass].join(" ").trim() }, displayValue)
      ),

      postNode ? div({ class: posticonClass }, postNode) : null
    ),

    children.length
      ? div({ class: "px-4 pb-3 flex flex-wrap items-center justify-center gap-3" }, ...children)
      : null,

    subtitle ? div({ class: subtitleClass }, subtitle) : null
  )
}
