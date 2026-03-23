var ceInputLangInternal = {};
import lang from "../cultures";
ceInputLangInternal = lang;
import { CronComponent } from "./CronComponent";
import { CronExpresionInputTemplateGenerator } from "../templates/CronExpresionInputTemplate";

import cron from 'cron-validator'
import cronstrue from 'cronstrue';

export class CronExpresionInput extends CronComponent {
  width: string | null | undefined
  height!: string | null
  required!: boolean
  hotValidate!: boolean
  colorMain!: string
  colorSecond!: string
  currentValue: string | undefined

  constructor() {
    super()
  }

  connectedCallback() {
    this.width = this.getAttribute("width")
    this.height = this.getAttribute("height")
    this.required = this.getAttribute("required") === "true"
    this.hotValidate = this.getAttribute("hotValidate") === "true"
    const color = this.getAttribute("color")?.replace("#", "") || "000000"
    this.colorMain = "#" + color
    this.colorSecond = this.increaseBrightness(color, 10)

    this.Init({
      self: this,
    })

    const template = CronExpresionInputTemplateGenerator(
      this,
      ceInputLangInternal,
    )

    this.Create(this, template)
    this.setValue(this.getAttribute("value"))

    const input1 = this.getElement(".cronInsideInput") as HTMLInputElement
    if (input1) {
      input1.addEventListener("keydown", (e) => this.validateLongitud(e))
      input1.addEventListener("keypress", (e) => this.validateLongitud(e))
      input1.addEventListener("keyup", (e) => this.validateLongitud(e))
    }

    this.addEvent(".cronButtonUI", "click", () => {
      this.querySelectorAll("form").forEach((element) => element.reset())
      const insideInput = this.getElementsByClassName(
        "cronInsideInput",
      )[0] as HTMLInputElement
      if (insideInput) {
        this.currentValue = insideInput.value
        if (this.currentValue.split(" ").length === 5)
          this.getCron(this.currentValue)
      }
      this.modalToggle()
    })

    this.addEvent(".cronClose", "click", () => {
      this.setValue(this.currentValue)
      this.modalToggle()
    })

    this.addEvent(".cronSave", "click", () => this.modalToggle())

    this.addEvent("li > a", "click", (scope) => {
      let index = 0
      this.getElements("li > a").forEach((elem, i) => {
        elem.parentElement?.setAttribute("class", "nav-link")
        if (elem === scope) {
          index = i
        }
      })
      scope.parentElement?.setAttribute("class", "nav-link active in")
      const elements = this.getElements("cron-fields")
      elements.forEach((elem) =>
        elem.parentElement?.setAttribute("class", 'tab-pane fade"'),
      )
      elements[index].parentElement?.setAttribute("class", "tab-pane active in")
    })

    const formParent = this.querySelector(".cronInsideInput")?.closest("form")
    if (formParent != null) {
      formParent.addEventListener("submit", (e) => {
        if (!this.validator()) e.preventDefault()
      })
    }

    if (this.hotValidate) {
      this.addEvent(".cronInsideInput", "change", () => this.validator())
    }

    this.addEvent("cron-fields", "change", (e) => {
      let value = true
      let node: HTMLElement | null = e.parentElement
      while (value && node) {
        if (node.nodeName === "CRON-FIELDS") {
          value = false
        } else {
          node = node.parentElement
        }
      }

      if (node) {
        const input2 = this.getElement(".cronInsideInput") as HTMLInputElement
        this.setValue(
          this.generateCron(
            parseInt(node.getAttribute("pos") || "0"),
            input2.value,
            (node as any).value,
          ),
        )
      }
    })

    this.getElements(".propagationClass").forEach((element) =>
      element.addEventListener("input", (e) => e.stopPropagation()),
    )

    this.validator()
  }

  validator() {
    const insideInput = this.querySelector(
      ".cronInsideInput",
    ) as HTMLInputElement
    const error = this.getElement(".cronexpressionError")
    if (!error) return true

    if (
      (insideInput?.value?.length === 0 && this.required) ||
      (insideInput?.value?.length !== 0 && !cron.isValidCron(insideInput.value))
    ) {
      error.classList.replace("hiden", "show")
      return false
    }
    error.classList.replace("show", "hiden")
    if (insideInput) {
      this.setValue(insideInput.value)
    }
    return true
  }

  getTypeCron(expression: string) {
    if (expression.includes("/") || expression.includes("*")) return 1
    else if (expression.includes("-")) return 2
    return 3
  }

  getTypeStep(expression: string) {
    const separator = "/"
    const step = {
      every: "*",
      step: "*",
    }
    if (!expression.includes(separator) && expression !== "*") {
      step.every = expression
    } else if (expression.includes("*") && expression.includes(separator)) {
      step.step = expression.split(separator)[1]
    } else if (expression.includes(separator)) {
      const c = expression.split(separator)
      step.every = c[0]
      step.step = c[1]
    }
    return step
  }

  getTypeRange(expression: string) {
    const separator = "-"
    const range = {
      min: "0",
      max: "0",
    }
    if (expression.includes(separator)) {
      const c = expression.split(separator)
      range.min = c[0]
      range.max = c[1]
    }
    return range
  }

  getTypeChoice(expression: string) {
    return expression.split(",")
  }

  getCron(cronExpression: string) {
    const forms = this.querySelectorAll("form")
    const crons = cronExpression.split(" ")
    if (forms[0]) this.setCronInTab(forms[0], crons[0], this.getTypeCron(crons[0]))
    if (forms[1]) this.setCronInTab(forms[1], crons[1], this.getTypeCron(crons[1]))
    if (forms[2]) this.setCronInTab(forms[2], crons[2], this.getTypeCron(crons[2]), 1)
    if (forms[3]) this.setCronInTab(forms[3], crons[3], this.getTypeCron(crons[3]), 1)
    if (forms[4]) this.setCronInTab(forms[4], crons[4], this.getTypeCron(crons[4]))
  }

  setCronInTab(
    form: HTMLFormElement,
    value: string,
    type: number,
    decrement = 0,
  ) {
    const choices = form.querySelectorAll<HTMLInputElement>(
      "input[name='choise']",
    )
    choices.forEach((choice) => choice.removeAttribute("checked"))
    if (choices[type - 1]) choices[type - 1].checked = true

    switch (type) {
      case 1: {
        const step = this.getTypeStep(value)
        const decrementStep = 1 - decrement
        const everyElement = form.querySelector(
          "*[match=every]",
        ) as HTMLSelectElement
        if (everyElement) {
          everyElement.selectedIndex = parseInt(step.every) + decrementStep
        }
        const stepElement = form.querySelector(
          "*[match=step]",
        ) as HTMLSelectElement
        if (stepElement) {
          stepElement.selectedIndex = parseInt(step.step) + decrementStep
        }
        break
      }
      case 2: {
        const range = this.getTypeRange(value)
        const rangeMinElement = form.querySelector(
          "*[match=rangeMin]",
        ) as HTMLSelectElement
        if (rangeMinElement) {
          rangeMinElement.selectedIndex = parseInt(range.min) - decrement
        }
        const rangeMaxElement = form.querySelector(
          "*[match=rangeMax]",
        ) as HTMLSelectElement
        if (rangeMaxElement) {
          rangeMaxElement.selectedIndex = parseInt(range.max) - decrement
        }
        break
      }
      case 3: {
        const cs = this.getTypeChoice(value)
        form
          .querySelectorAll("*[match=spesific] input")
          .forEach((element, index) => {
            const inputElement = element as HTMLInputElement
            if (cs.includes((index + decrement).toString()))
              inputElement.checked = true
          })
        break
      }
    }
  }

  validateLongitud(e: Event) {
    const target = e.target as HTMLInputElement
    if (!target) return
    const values = target.value.trim().split(" ")
    if (values.length > 5) target.value = values.slice(0, 5).join(" ")
    this.sendEvent()
  }

  setValue(value: string | null | undefined) {
    const defaultArray = ["*", "*", "*", "*", "*"]
    if (value === undefined || value === null) {
      value = defaultArray.join(" ")
    } else if (value.length > 0) {
      const array = value.trim().split(" ")
      for (let i = 0; i < 5; i++) {
        if (array[i] !== undefined) defaultArray[i] = array[i]
      }
      value = defaultArray.join(" ")
    }
    const input3 = this.getElement(".cronInsideInput") as HTMLInputElement
    if (input3) {
      input3.value = value
    }

    const inputCronMsg = this.querySelector(".inputCronMsg") as HTMLInputElement
    if (inputCronMsg) {
      try {
        inputCronMsg.value = cronstrue.toString(value)
      } catch {
        inputCronMsg.value = ""
      }
    }
    this.sendEvent()
  }

  modalToggle() {
    this.getElement(".modal")?.classList.toggle("show")
  }

  generateCron(pos: number, values: string, value: string) {
    const val = values.split(" ")
    val[pos] = value
    return val.join(" ")
  }

  sendEvent() {
    const input4 = this.getElement(".cronInsideInput") as HTMLInputElement
    if (!input4) return
    const event = new CustomEvent("input", {
      detail: {
        value: input4.value,
      },
      bubbles: true,
      cancelable: true,
    })
    this.dispatchEvent(event)
  }
}