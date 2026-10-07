import van, { ChildDom } from "vanjs-core"

const { button, span } = van.tags

export interface ButtonProps {
  readonly label?: string
  readonly title?: string
  readonly id?: string
  readonly icon?: string | ChildDom
  readonly onClick?: (ev: MouseEvent) => void
  readonly disabled?: boolean
  /** Classes of the `<button>`. Replaces the default `vx-button`; pass `"vx-button my-extra"` to extend it. */
  readonly className?: string
  readonly labelClass?: string
  /** Extra classes for the icon wrapper, appended after the fixed `vx-button__icon`. */
  readonly iconClass?: string
}

export const xButton = ({
  label,
  title,
  icon,
  onClick,
  disabled = false,
  className = "vx-button",
  labelClass = "",
  id = "",
  iconClass = "",
}: ButtonProps) => {
  const classes = className.trim()

  const iconNode =
    icon == null
      ? null
      : span(
          {
            class: [
              "vx-button__icon",
              iconClass,
            ]
              .join(" ")
              .trim(),
            "aria-hidden": "true",
          },
          typeof icon === "string"
            ? span({ class: icon })
            : icon instanceof Node
            ? icon.cloneNode(true)
            : icon
        )

  const props: Record<string, any> = {
    type: "button",
    class: classes,
    id: id,
    disabled,
    onclick: (e: MouseEvent) => {
      if (disabled) return
      onClick?.(e)
    },
  }

  if (title && title.trim() !== "") props.title = title

  return button(props, iconNode, span({ class: labelClass }, label))
}
