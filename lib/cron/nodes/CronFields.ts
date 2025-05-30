var ceInputLangInternal = {};
import lang from "../cultures";
ceInputLangInternal = lang;
import van from "vanjs-core";
const { div, input, label, span } = van.tags
import { CronComponent } from "./CronComponent";
import { CronFieldTemplateGenerator } from "../templates/CronFieldTemplate";
import { EspesificOptionTemplateGenerator } from "../templates/EspesificOptionTemplate";

export class CronFields extends CronComponent {
    every: number | undefined;
    value: string | undefined;

    constructor() {
        super();
    }

    connectedCallback() {
        this.Init({
            self: this,
            props: ["input", "hasZero", "every", "colorMain", "colorSecond"],
        });

        var template = CronFieldTemplateGenerator(this, ceInputLangInternal);

        this.value = "*";
        this.Create(this, template);
        this.Mount();
    }

    Mount() {
        this.addSelectOptions("every");
        this.addSelectOptions("step");
        this.addSelectOptions("rangeMin");
        this.addSelectOptions("rangeMax");
        this.addSpesificOptions("spesific");
        this.eventListen("select");
        this.eventListen("input");
    }
    addSelectOptions(attr: string) {
        var match = this.getElement("*[match=" + attr + "]");
        for (var i = this.getHasZero(); i <= (this["every"] ?? 0); i++) {
            var option = document.createElement("option");
            option.innerText = this.getNumber(i);
            option.value = i.toString();
            match.appendChild(option);
        }
    }
    addSpesificOptions(attr: string) {
        var match = this.getElement("*[match=" + attr + "]");
        for (var i = this.getHasZero(); i <= (this["every"] ?? 0); i++) {
            match.appendChild(div({ style: "width: 55px !important;" }, EspesificOptionTemplateGenerator(this.getNumber(i), i)));
        }
    }
    makeCron(choise: number, input: { every: any; step: any; rangeMin: any; rangeMax: any; spesific: any; }) {
        var expression = "*";
        if (choise == 1) {
            if (input.step == "*") expression = `${input.every}`;
            else expression = `${input.every}/${input.step}`;
        } else if (
            choise == 2 &&
            !(input.rangeMin == "*" || input.rangeMax == "*")
        ) {
            let min = parseInt(input.rangeMin);
            let max = parseInt(input.rangeMax);
            if (min < max) expression = `${input.rangeMin}-${input.rangeMax}`;
        } else if (choise == 3 && input.spesific.length != 0) {
            expression = "";
            input.spesific.forEach((m: string) => {
                expression += m + ",";
            });
            expression = expression.slice(0, expression.length - 1);
        }
        this.value = expression;
    }
    eventListen(attr: string) {
        var self = this;
        this.getElements(attr).forEach((element: { addEventListener: (arg0: string, arg1: (e: any) => void) => void; }) => {
            element.addEventListener("change", (e: any) => {
                var choise = self.getElement("*[match=choise]:checked").value;
                var every = self.getElement("*[match=every]").value;
                var step = self.getElement("*[match=step]").value;
                var rangeMin = self.getElement("*[match=rangeMin]").value;
                var rangeMax = self.getElement("*[match=rangeMax]").value;
                var spesific = Array.prototype.map.call(
                    self.getElements("*[match=spesific] input:checked"),
                    (input) => input.value
                );
                self.makeCron(choise, {
                    every,
                    step,
                    rangeMin,
                    rangeMax,
                    spesific,
                });
            });
        });
    }
}