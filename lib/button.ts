import van, { ChildDom } from "vanjs-core"

const { button, span } = van.tags

export interface ButtonProps {
  readonly label: string
  readonly title?: string
  readonly icon?: string | ChildDom
  readonly onClick?: (ev: MouseEvent) => void
  readonly disabled?: boolean
  readonly className?: string
  readonly labelClass?: string
  readonly iconClass?: string
}

export const xbutton = ({
  label,
  title,
  icon,
  onClick,
  disabled = false,

  // ✅ default bonito (pero el usuario lo puede pisar)
  className = "bg-black text-white hover:bg-gray-700 hover:opacity-90",

  labelClass = "",
  iconClass = "text-current",
}: ButtonProps) => {
  // ✅ base SOLO estructura/estados (sin bg/text/hover)
  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 mr-2 " +
    "text-sm font-medium select-none " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "focus-visible:ring-stone-400 " +
    "disabled:cursor-not-allowed disabled:opacity-50"

  const classes = `${baseClasses} ${className}`.trim()

  const iconNode =
    icon == null
      ? null
      : span(
          {
            class: ["inline-flex items-center justify-center shrink-0", iconClass]
              .join(" ")
              .trim(),
            "aria-hidden": "true",
          },
          typeof icon === "string" ? span({ class: icon }) : icon
        )

  return button(
    {
      type: "button",
      title: title ?? label,
      class: classes,
      disabled,
      onclick: (e: MouseEvent) => {
        if (disabled) return
        onClick?.(e)
      },
    },
    iconNode,
    span({ class: labelClass }, label)
  )
}
