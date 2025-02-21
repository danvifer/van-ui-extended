import van, { State } from "vanjs-core"
import "../style.css"
const { textarea } = van.tags
export const TextAreaComponent = (inputValue: State<string>, height: Number) => {
    return () =>
        textarea({ style: `width: 100%;height:${height}px;border: 0.5px solid;border-color: white;resize: none;border: none; cursor: default;`, class: "bg-zinc-950 p-3", readOnly: "readonly", id: "textarea", value: inputValue })
}

export default TextAreaComponent 
