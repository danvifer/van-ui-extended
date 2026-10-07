import van, { State } from "vanjs-core"
const { textarea } = van.tags

export interface TextAreaOptions {
  readonly readOnly?: boolean
  readonly id?: string
  /** Classes of the `<textarea>`. Replaces the default `vx-textarea`; pass `"vx-textarea extra"` to extend it. */
  readonly className?: string
  readonly placeholder?: string
}

export const TextAreaComponent = (
  inputValue: State<string>,
  height: number,
  options: TextAreaOptions = {},
): HTMLTextAreaElement => {
  const el = textarea({
    style: `width:100%;height:${height}px;resize:none;border:none;cursor:text;`,
    class: options.className ?? "vx-textarea",
    readOnly: options.readOnly ?? false,
    oninput: (e: Event) => {
      inputValue.val = (e.target as HTMLTextAreaElement).value
    },
    value: inputValue,
  }) as HTMLTextAreaElement
  if (options.id) el.id = options.id
  if (options.placeholder) el.placeholder = options.placeholder
  return el
}

export default TextAreaComponent
