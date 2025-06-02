import van, { ChildDom, State } from "vanjs-core";
import { Modal } from "vanjs-ui"
const { div, button, span, i } = van.tags;
const { circle, path, svg } = van.tags("http://www.w3.org/2000/svg")

export type Step = {
    name: any,
    element: readonly ChildDom[],
    stepValid: State<Boolean>,
    preAction?: Function,
    postAction?: Function
};

export interface WizardProps {
    readonly steps: Array<Step>;
    readonly title: string;
    closed: State<boolean>;
    readonly primaryColor?: string;
    readonly secondaryColor?: string;
    readonly modalClass?: string;
    readonly backgroundColor?: string;
    readonly prevLabel?: string;
    readonly nextLabel?: string;
    readonly createLabel?: string;
    readonly customPrimaryButtonStyle?: string;
    readonly customSecondaryButtonStyle?: string;
    readonly closeWizard: Function;
}
export const WizardComponent = ({ steps, title, closeWizard, closed, primaryColor = "sky-700", modalClass = "text-white absolute inset-y-0 right-0 z-40", backgroundColor = "#314158", secondaryColor = "sky-900", customPrimaryButtonStyle = "", customSecondaryButtonStyle = "", prevLabel = "Prev", nextLabel = "Next", createLabel = "Create" }: WizardProps, ...children: readonly ChildDom[]
) => {
    async function executeActions(preAction?: Function, postAction?: Function, close?: Boolean) {
        if (postAction) {
            document.getElementById("spinner")?.setAttribute("class", "inline")
            document.getElementById("no-spinner")?.setAttribute("class", "hidden")
            await postAction()
            document.getElementById("spinner")?.setAttribute("class", "hidden")
            document.getElementById("no-spinner")?.setAttribute("class", "inline")
        }
        if (preAction) {
            document.getElementById("spinner")?.setAttribute("class", "inline")
            document.getElementById("no-spinner")?.setAttribute("class", "hidden")
            await preAction()
            document.getElementById("spinner")?.setAttribute("class", "hidden")
            document.getElementById("no-spinner")?.setAttribute("class", "inline")
        }
        if (close) {
            closed.val = true
        }
    }
    const step = van.state(0)
    const prevButton = van.derive(() => step.val > 0 ? button({ class: `hover:opacity-90 font-bold py-2 px-4 mt-2 mb-2 rounded cursor-pointer`, type: "submit", style: customSecondaryButtonStyle, onclick: () => step.val-- }, prevLabel) : "")
    const nextButton = van.derive(() => step.val < steps.length - 1 ? button({
        class: `text-white hover:opacity-90 font-bold py-2 px-4 mt-2 mb-2 rounded mx-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer`, style: customPrimaryButtonStyle, type: "submit", disabled: () => steps[step.val].stepValid.val ? "" : "disabled", onclick: () => {
            executeActions(steps[step.val + 1].preAction, steps[step.val].postAction);
            step.val++;
        }
    }, nextLabel) : "")
    const saveButton = van.derive(() => step.val === steps.length - 1 ? button({ class: `hover:opacity-90 text-white font-bold py-2 px-4 mt-2 mb-2 rounded mx-2 disabled:opacity-75 disabled:cursor-not-allowed !important cursor-pointer`, style: customPrimaryButtonStyle, disabled: () => steps[step.val].stepValid.val ? "" : "disabled", onclick: () => { executeActions(undefined, steps[step.val].postAction, true); closeWizard() } }, span({ id: "spinner", class: "hidden" },
        svg({ class: "mr-3 size-5 animate-spin inline", viewBox: "0 0 24 24" },
            circle({ class: "opacity-25", cx: "12", cy: "12", "r": "10", stroke: "white", "stroke-width": "4" }),
            path({ class: "opacity-75", fill: "white", "d": "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })), "Loading"), span({ id: "no-spinner" }, createLabel)) : null)
    let stepsInfo: Array<ChildDom>
    stepsInfo = []

    const currentStep = van.derive(() => steps[step.val].element)
    steps.forEach((val, index) => {
        stepsInfo.push(() => div({ class: "flex my-2 " + (index == step.val ? `text-${primaryColor}` : "") }, span({ class: `mr-2 border-${primaryColor}`, style: "width:28px; height: 28px;flex: none;align-items: center;justify-content: center;line-height: normal;overflow: hidden;position: relative;text-align: center;vertical-align: middle;" + (index != step.val ? "opacity-75 text-[#658b8a]" : "") + (index == step.val ? "border: thin solid; border-width: medium;border-radius: 50%;" : "") }, index + 1), val.name));
    })
    van.add(document.body, Modal({ closed: closed, modalStyleOverrides: { "background-color": "", "color": "", "width": "80%", "height": "100%", "padding": "0px", "z-index": "1000 !important" }, modalClass: modalClass + `bg-[${backgroundColor}]` },
        div({ class: "p-2" }, button({ class: "cursor-pointer og ogiconclose", onclick: () => { closed.val = true; closeWizard() } }), span({ class: "inline text-xl ml-2" }, title)),
        div(
            { id: 'appContainer', class: 'grid grid-cols-4 grid-rows-4 auto-rows-min md:grid-cols-6 lg:grid-cols-15 min-h-screen bg-neutral-900 text-white', style: "border-top: 1px solid oklch(.372 .044 257.287);" },
            div({ id: "leftbarwrapper", class: `col-span-3 row-span-4 md:col-span-1 lg:col-span-3 text-white p-4 lg:block bg-[${backgroundColor}]`, style: "border-right: 1px solid oklch(.372 .044 257.287);" },
                stepsInfo
            ),
            () => div({ id: "appMainWrapper", class: `col-span-5 row-span-4 md:col-span-5 lg:col-span-12 p-6 bg-[${backgroundColor}] ` },
                currentStep.val, div({ class: "absolute right-0 bottom-0 mr-4" }, () => prevButton.val, () => nextButton.val, () => saveButton.val
                ))))
    )
};
