var ceInputLangInternal = {};
import lang from "../cultures";
ceInputLangInternal = lang;

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
    const match = this.getElement(`*[match=${attr}]`)
    if (!match) return

    const everyVal = Number((this as any).every) || 0
    for (let i = this.getHasZero(); i <= everyVal; i++) {
      const option = document.createElement("option")
      option.innerText = this.getNumber(i)
      option.value = i.toString()
      match.appendChild(option)
    }
  }

  addSpesificOptions(attr: string) {
    const match = this.getElement(`*[match=${attr}]`)
    if (!match) return

    const everyVal = Number((this as any).every) || 0
    for (let i = this.getHasZero(); i <= everyVal; i++) {
      const div = document.createElement("div")
      div.innerHTML = EspesificOptionTemplateGenerator(this.getNumber(i), i)
      div.setAttribute("style", "width: 55px !important;")
      match.appendChild(div)
    }
  }

  makeCron(
    choise: string | number,
    input: {
      every: string
      step: string
      rangeMin: string
      rangeMax: string
      spesific: string[]
    },
  ) {
    let expression = "*"
    const choiceNum = Number(choise)

    if (choiceNum === 1) {
      if (input.step === "*") expression = `${input.every}`
      else expression = `${input.every}/${input.step}`
    } else if (
      choiceNum === 2 &&
      !(input.rangeMin === "*" || input.rangeMax === "*")
    ) {
      const min = parseInt(input.rangeMin)
      const max = parseInt(input.rangeMax)
      if (min < max) expression = `${input.rangeMin}-${input.rangeMax}`
    } else if (choiceNum === 3 && input.spesific.length !== 0) {
      expression = input.spesific.join(",")
    }
    this.value = expression
  }

  eventListen(attr: string) {
    this.getElements(attr).forEach((element) => {
      element.addEventListener("change", () => {
        const choiceEl = this.getElement("*[match=choise]:checked") as HTMLInputElement
        const everyEl = this.getElement("*[match=every]") as HTMLSelectElement
        const stepEl = this.getElement("*[match=step]") as HTMLSelectElement
        const rangeMinEl = this.getElement("*[match=rangeMin]") as HTMLSelectElement
        const rangeMaxEl = this.getElement("*[match=rangeMax]") as HTMLSelectElement
        
        const selection = this.getElements("*[match=spesific] input:checked")
        const spesific = Array.from(selection).map((input) => (input as HTMLInputElement).value)

        this.makeCron(choiceEl?.value || "0", {
          every: everyEl?.value || "*",
          step: stepEl?.value || "*",
          rangeMin: rangeMinEl?.value || "*",
          rangeMax: rangeMaxEl?.value || "*",
          spesific,
        })
      })
    })
  }
}