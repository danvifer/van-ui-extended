import van from "vanjs-core";
const { div, input, label, span } = van.tags
export function EspesificOptionTemplateGenerator(getNumber: any, number: any) {
    return div({ style: "margin: 10px;" },
        label({ class: "container" },
            span({ class: "numberValue" },
                getNumber,
            ),
            input({ class: "propagationClass", value: number, type: "checkbox" }),
            span({ class: "checkmark" }),
        ),
    );
}