var ceInputLangInternal = {};
import lang from "../cultures";
ceInputLangInternal = lang;
import { CronComponent } from "./CronComponent";
import { CronExpresionInputTemplateGenerator } from "../templates/CronExpresionInputTemplate";

import { isValidCron } from 'cron-validator'
import cronstrue from 'cronstrue';

export class CronExpresionInput extends CronComponent {
    width: string | null | undefined;
    height!: string | null;
    extraClass: string | null | undefined;
    required!: boolean;
    hotValidate!: boolean;
    colorMain!: string;
    colorSecond!: string;
    currentValue: any;
    constructor() {
        super();
    }

    connectedCallback() {
        this.width = this.getAttribute("width");
        this.height = this.getAttribute("height");
        this.extraClass = this.getAttribute("extraClass");
        this.required = this.getAttribute("required") == "true";
        this.hotValidate = this.getAttribute("hotValidate") == "true";
        var color = this.getAttribute("color")?.replace("#", "");
        this.colorMain = "#" + color;
        this.colorSecond = this.increaseBrightness(color, 10);

        this.Init({
            self: this,
        });

        var template = CronExpresionInputTemplateGenerator(this, ceInputLangInternal);
        console.log(template)

        var self = this;
        this.Create(self, template);
        this.setValue(this.getAttribute("value"));

        var input1 = this.getElement(".cronInsideInput");
        input1.addEventListener("keydown", (e: any) => self.validateLongitud(e));
        input1.addEventListener("keypress", (e: any) => self.validateLongitud(e));
        input1.addEventListener("keyup", (e: any) => self.validateLongitud(e));
        this.addEvent(".cronButtonUI", "click", () => {
            self.querySelectorAll("form").forEach((element) => element.reset());
            if (self.getElementsByClassName("cronInsideInput").length != 0) {
                self.currentValue = (self.getElementsByClassName("cronInsideInput")[0] as HTMLInputElement).value;
                if (self.currentValue.split(" ").length == 5) self.getCron(self.currentValue);
            }
            self.modalToggle();
        });
        this.addEvent(".cronClose", "click", () => {
            self.setValue(self.currentValue);
            self.modalToggle();
        });
        this.addEvent(".cronSave", "click", () => self.modalToggle());
        this.addEvent("li > a", "click", (scope: { parentNode: { setAttribute: (arg0: string, arg1: string) => void; }; }) => {
            var index = 0;
            self.getElements("li > a").forEach(function (elem: { parentNode: { setAttribute: (arg0: string, arg1: string) => void; }; }, i: number) {
                elem.parentNode.setAttribute("class", "nav-link");
                if (elem == scope) {
                    index = i;
                }
            });
            scope.parentNode.setAttribute("class", "nav-link active in");
            var elements = self.getElements("cron-fields");
            elements.forEach((elem: { parentNode: { setAttribute: (arg0: string, arg1: string) => any; }; }) => elem.parentNode.setAttribute("class", 'tab-pane fade"'));
            elements[index].parentNode.setAttribute("class", "tab-pane active in");
        });
        var formParent = self.querySelector(".cronInsideInput")?.closest("form");
        if (formParent != null) {
            formParent.closest("form")?.addEventListener("submit", (e) => {
                if (!self.validator(self)) e.preventDefault();
            });
        }
        if (self.hotValidate) {
            this.addEvent(".cronInsideInput", "change", (e: any) => self.validator(self));
        }
        this.addEvent("cron-fields", "change", (e: { parentNode: any; }) => {
            var value = true;
            var node = e.parentNode;
            while (value) {
                node = node.parentNode;
                if (node.nodeName == "CRON-FIELDS") value = false;
            }
            var input2 = self.getElement(".cronInsideInput");
            self.setValue(
                self.generateCron(
                    parseInt(node.getAttribute("pos")),
                    input2["value"],
                    node.value
                )
            );
        });

        this.getElements(".propagationClass").forEach((element: { addEventListener: (arg0: string, arg1: (e: any) => any) => any; }) =>
            element.addEventListener("input", (e: { stopPropagation: () => any; }) =>
                e.stopPropagation())
        );

        self.validator(self);
    }
    validator(self: this) {
        var insideInput = self.querySelector(".cronInsideInput");
        var error = self.getElement(".cronexpressionError");
        var tooltip = self.getElement(".cronexpressionDescription");
        console.log(!isValidCron((insideInput as HTMLInputElement).value))
        console.log((insideInput as HTMLInputElement).value.length != 0)
        if (
            ((insideInput as HTMLInputElement)?.value?.length == 0 && self.required) ||
            ((insideInput as HTMLInputElement).value.length != 0 && !isValidCron((insideInput as HTMLInputElement).value))
        ) {
            tooltip.innerHTML = cronstrue.toString((insideInput as HTMLInputElement).value)
            error.classList.replace("hiden", "show");
            return false;
        }
        error.classList.replace("show", "hiden");
        if (insideInput instanceof HTMLInputElement) {
            tooltip.innerHTML = cronstrue.toString((insideInput as HTMLInputElement).value)
            self.setValue(insideInput.value);
        }
        return true;
    }
    getTypeCron(expresion: string | string[]) {
        if (expresion.includes("/") || expresion.includes("*")) return 1;
        else if (expresion.includes("-")) return 2;
        return 3;
    }
    getTypeStep(expresion: string) {
        const separator = "/";
        var step = {
            every: "*",
            step: "*",
        };
        if (!expresion.includes(separator) && expresion != "*") step.every = expresion;
        else if (expresion.includes("*") && expresion.includes(separator)) step.step = expresion.split(separator)[1];
        else if (expresion.includes(separator)) {
            var c = expresion.split(separator);
            step.every = c[0];
            step.step = c[1];
        }
        return step;
    }
    getTypeRange(expresion: string) {
        const separator = "-";
        var range = {
            min: "0",
            max: "0",
        };
        if (expresion.includes(separator)) {
            var c = expresion.split(separator);
            range.min = c[0];
            range.max = c[1];
        }
        return range;
    }
    getTypeChoise(expresion: string) {
        return expresion.split(",");
    }
    getCron(cronExpresion: string) {
        var forms = this.querySelectorAll("form");
        var crons = cronExpresion.split(" ");
        this.setCronInTab(forms[0], crons[0], this.getTypeCron(crons[0]));
        this.setCronInTab(forms[1], crons[1], this.getTypeCron(crons[1]));
        this.setCronInTab(forms[2], crons[2], this.getTypeCron(crons[2]), 1);
        this.setCronInTab(forms[3], crons[3], this.getTypeCron(crons[3]), 1);
        this.setCronInTab(forms[4], crons[4], this.getTypeCron(crons[4]));
    }
    setCronInTab(form: HTMLFormElement, value: any, type: number, decrement = 0) {
        var choises = form.querySelectorAll("input[name='choise']");
        choises.forEach((choise: { removeAttribute: (arg0: string) => any; }) => choise.removeAttribute("checked"));
        (choises[type - 1] as HTMLInputElement).checked = true;
        switch (type) {
            case 1:
                var step = this.getTypeStep(value);
                var decrementStep = 1 - decrement;
                const everyElement = form.querySelector("*[match=every]");
                if (everyElement) {
                    (everyElement as HTMLSelectElement).selectedIndex =
                        parseInt(step["every"]) + decrementStep;
                }
                const stepElement = form.querySelector("*[match=step]");
                if (stepElement) {
                    (stepElement as HTMLSelectElement).selectedIndex =
                        parseInt(step["step"]) + decrementStep;
                }
                break;
            case 2:
                var range = this.getTypeRange(value);
                const rangeMinElement = form.querySelector("*[match=rangeMin]");
                if (rangeMinElement) {
                    (rangeMinElement as HTMLSelectElement).selectedIndex =
                        parseInt(range["min"]) - decrement;
                }
                const rangeMaxElement = form.querySelector("*[match=rangeMax]");
                if (rangeMaxElement) {
                    (rangeMaxElement as HTMLSelectElement).selectedIndex =
                        parseInt(range["max"]) - decrement;
                }
                break;
            case 3:
                var cs = this.getTypeChoise(value);
                form
                    .querySelectorAll("*[match=spesific] input")
                    .forEach((element, index) => {
                        const inputElement = element as HTMLInputElement;
                        if (cs.includes((index + decrement).toString())) inputElement.checked = true;
                    });
                break;
        }
    }
    validateLongitud(e: { target: { value: string; }; }) {
        var values = e.target.value.trim().split(" ");
        if (values.length > 5) e.target.value = values.slice(0, 5).join(" ");
        this.sendEvent();
    }
    setValue(value: string | null | undefined) {
        console.log(value)
        var defaultArray = ["*", "*", "*", "*", "*"];
        if (value == undefined) return defaultArray.join(" ");
        else if (value.length > 0) {
            var array = value.trim().split(" ");
            for (var i = 0; i < 5; i++)
                if (array[i] != undefined) defaultArray[i] = array[i];
            value = defaultArray.join(" ");
        }
        var input3 = this.getElement(".cronInsideInput");
        input3.value = value;

        const inputCronMsg = this.querySelector(".inputCronMsg");
        var tooltip = this.querySelector(".cronexpressionDescription");
        if (inputCronMsg) {
            (inputCronMsg as HTMLInputElement).value = cronstrue.toString(value);
        }
        if (tooltip) {
            tooltip.innerHTML = cronstrue.toString(value)
        }
        this.sendEvent();
    }
    modalToggle() {
        this.getElement(".modal").classList.toggle("show");
    }
    generateCron(pos: number, values: string, value: any) {
        var val = values.split(" ");
        val[pos] = value;
        return val.join(" ");
    }
    sendEvent() {
        var input4 = this.getElement(".cronInsideInput");
        var event = new CustomEvent("input", {
            detail: {
                value: input4.value,
            },
            bubbles: true,
            cancelable: true,
        });
        this.dispatchEvent(event);
    }
}