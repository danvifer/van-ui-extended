import van, { State, ChildDom } from "vanjs-core"
const { div, button, img, span } = van.tags
const { path, svg } = van.tags("http://www.w3.org/2000/svg")
import * as vanX from "vanjs-ext"
export type Value = {
    img?: string;
    value?: string;
    description?: string;
    label?: string;
    func?: (value: any) => void;
}
let allVals: Array<Value>
let innerValue: any;
export interface SelectProps {
    readonly values: Value[],
    readonly selected?: string,
    readonly selectClass?: string,
    readonly optionsClass?: string,
    readonly optionClass?: string,
    readonly multiple?: Boolean,
    readonly footer?: ChildDom[]
    readonly multipleValues?: State<Array<String>>
}
export const Select = ({
    values = [],
    selected = '',
    selectClass = 'w-[450px] text-gray-900',
    optionsClass = '',
    optionClass = '',
    multiple = false,
    footer = [],
    multipleValues = van.state([])
}: SelectProps) => {

    function setValue(value: string, func: any, values: Array<Value>) {
        const innerVal = values.find((val) => val.value == value)
        if (multipleValues?.val.find((val => val === value))) {
            removeElement(value)
        } else {
            if (innerVal) {
                if (multiple) {
                    multipleValues?.val.push(innerVal.value || "")
                    fillSelect()
                } else {
                    innerValue.val = span(innerVal.img ? img({ src: innerVal.img || "", class: "h-4 w-4 inline mr-2" }) : null, innerVal.label)
                }
            }
            if (func) {
                func(value)
            }
        }

    }
    function removeElement(value: string | undefined) {
        console.log(value)
        if (value) {
            const innerVal = values.find((val) => val.value == value)
            const removeIndex = multipleValues?.val.findIndex((val) => val == innerVal?.value) ?? -1;
            console.log(removeIndex)
            console.log(multipleValues)
            if (removeIndex !== -1) {
                multipleValues?.val.splice(removeIndex, 1)
                console.log(multipleValues)
                fillSelect()
            }
        }
    }
    function fillSelect() {
        const options: HTMLSpanElement[] = []
        multipleValues?.val.forEach(currentValue => {
            const innerVal = values.find((val) => val.value == currentValue)
            options.push(span({ class: "px-4 py-2  text-base rounded-full text-white  bg-indigo-500 mx-1" },
                innerVal?.label,
                button({ class: "bg-transparent hover cursor-pointer", onclick: () => removeElement(innerVal?.value) },
                    svg({ xmlns: "http://www.w3.org/2000/svg", width: "12", height: "12", fill: "currentColor", class: "ml-4", viewBox: "0 0 1792 1792" },
                        path({ "d": "M1490 1322q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68 28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294 294 294q28 28 28 68z" }
                        ),
                    ),
                ),
            ))
        });
        innerValue.val = span(options)
    }
    allVals = values
    let innerVal
    if (selected !== '') {
        innerVal = values.find((val) => val.value == selected)
    } else {
        innerVal = values[0]
    }

    if (innerVal) {
        if (multiple) {
            multipleValues?.val.push(innerVal.value || "")
            innerValue = van.state()
            fillSelect()
        } else {
            innerValue = van.state(span(innerVal.img ? img({ src: innerVal.img || "", class: "h-4 w-4 inline mr-2" }) : null, innerVal.label))
        }

    }
    return div({ class: "flex w-screen h-screen justify-center items-center" }, div({ class: selectClass },
        div({ class: "relative w-full group" },
            button({ class: selectClass + " min-w-[100px] py-2.5 px-3 md:text-sm text-site bg-transparent border border-dimmed  focus:border-brand focus:outline-none focus:ring-0 peer flex items-center justify-between rounded font-semibold cursor-pointer" },
                innerValue
            ),
            div({ id: "select-father", class: "w-full absolute z-[99] top-[100%] left-[50%] translate-x-[-50%] rounded-md overflow-hidden shadow-lg min-w-[100px] peer-focus:visible peer-focus:opacity-100 opacity-0 invisible duration-200 p-1 bg-gray-100  border border-dimmed text-xs md:text-sm " + optionsClass },
                div({ class: "max-h-150 overflow-auto" }, vanX.list(div, values, ({ val: value }) => div({
                    class: "cursor-pointer w-full block cursor-pointer hover:bg-white hover:text-link px-3 py-2 rounded-md" + optionClass,
                    onclick: () => setValue(value.value || "", value.func, values)
                },
                    value.img ? img({ src: value.img || "", class: "h-4 w-4 inline mr-2" }) : null,
                    value.label,
                    value.description ? div({ class: "text-xs text-gray-500" }, value.description) : null
                )), footer.length > 0 ? div({ class: "border-t px-0 py-0" }, footer) : null
                )
            ))))
}

