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
export interface SelectProps {
    readonly values: Value[],
    readonly modelValue: State<any>
    readonly noLabel?: string,
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
    modelValue = van.state({}),
    selected = '',
    selectClass = 'w-[450px] text-gray-900',
    optionsClass = '',
    noLabel = 'Select an option',
    optionClass = '',
    multiple = false,
    footer = [],
    multipleValues = van.state([])
}: SelectProps) => {
    const open = van.state(false)
    function setValue(value: string, func: any, values: Array<Value>) {
        const innerVal = values.find((val) => val.value == value)
        if (multipleValues?.val.find((val => val === value))) {
            removeElement(value)
        } else {
            if (innerVal) {
                if (multiple) {
                    multipleValues.val.push(innerVal.value || "")
                    fillSelect()
                } else {
                    modelValue.val = span(innerVal.img ? img({ src: innerVal.img || "", class: "h-4 w-4 inline mr-2" }) : null, innerVal.label)
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
        modelValue.val = span(options)
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
            modelValue = van.state()
            fillSelect()
        } else {
            modelValue = van.state(span(innerVal.img ? img({ src: innerVal.img || "", class: "h-4 w-4 inline mr-2" }) : null, innerVal.label))
        }

    }
    return div({ class: selectClass },
        () => div({ class: "relative w-full group" },
            button({ onfocus: () => { open.val = true; }, onblur: () => { setTimeout(() => open.val = false, 150); }, class: selectClass + " min-w-[100px] py-2.5 px-3 md:text-sm text-site bg-transparent border border-dimmed  focus:border-brand focus:outline-none focus:ring-0 peer flex items-center justify-between rounded font-semibold cursor-pointer" },
                modelValue.val ? modelValue.val : noLabel,
                svg({ class: "h-5 w-5 text-gray-400 flex justify-end", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true" },
                    path({ "fill-rule": "evenodd", "d": "M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z", "clip-rule": "evenodd" }),
                )
            ),
            () => div(
                open.val ? div({ id: "select-father", class: "w-full absolute z-[99] top-[100%] left-[50%] translate-x-[-50%] rounded-md overflow-hidden shadow-lg min-w-[100px] duration-200 p-1  border border-dimmed text-xs md:text-sm " + optionsClass },
                    div(vanX.list(div, values, ({ val: value }) => div({
                        class: "cursor-pointer w-full block cursor-pointer hover:text-link px-3 py-2 rounded-md " + optionClass,
                        onclick: () => { console.log("entro"); setValue(value.value || "", value.func, values) }
                    },
                        value.img ? img({ src: value.img || "", class: "h-4 w-4 inline mr-2" }) : null,
                        value.label,
                        value.description ? div({ class: "text-xs text-gray-500" }, value.description) : null
                    )), footer.length > 0 ? div({ class: "border-t px-0 py-0" }, footer) : null
                    )
                ) : null)))
}

