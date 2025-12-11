import van, { ChildDom } from "vanjs-core"

const { button, span } = van.tags

export interface ButtonProps {
  readonly label: string
  readonly icon?: string | ChildDom
  readonly onClick?: Function
  readonly disabled?: boolean
  readonly className?: string
}

export const xbutton = ({
  label,
  icon,
  onClick,
  disabled = false,
  className = "",
}: ButtonProps) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-md bg-black px-2 py-2 mr-2 " +
    "text-white text-sm focus:outline-none " +
    "enabled:cursor-pointer enabled:hover:bg-gray-600 enabled:hover:opacity-90 " +
    "disabled:cursor-not-allowed disabled:opacity-50"

  const classes = className ? `${baseClasses} ${className}` : baseClasses

  let iconNode = null
  if (icon != null) {
    iconNode = typeof icon === "string" ? span({ class: icon }) : icon
  }

  return button(
    {
      type: "button",
      class: classes,
      disabled,
      onclick: (event: MouseEvent) => {
        if (disabled) return
        onClick?.(event)
      },
    },
    iconNode,
    label
  )
}
