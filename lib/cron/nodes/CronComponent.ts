export interface CronState {
  self: HTMLElement
  props?: string[]
  [key: string]: unknown
}

export class CronComponent extends HTMLElement {
  state!: CronState
  hasZero?: boolean

  constructor() {
    super()
  }

  Init(state: CronState) {
    this.state = state

    if (this.state.props !== undefined) {
      this.state.props.forEach((p) => {
        ;(this.state as Record<string, unknown>)[p] =
          state.self.getAttribute(p)
      })
    }
  }

  Create(self: HTMLElement, template: string) {
    self.innerHTML = ""
    const div = document.createElement("div")
    div.innerHTML = template
    self.appendChild(div)
  }

  getElements(selector: string): NodeListOf<HTMLElement> {
    return this.state.self.querySelectorAll(selector)
  }

  getElement(selector: string): HTMLElement | null {
    return this.state.self.querySelector(selector)
  }

  getNumber(n: number | string): string {
    return n.toString().padStart(2, "0")
  }

  getHasZero(): number {
    return this.hasZero ? 0 : 1
  }

  addEvent(
    selector: string,
    event: string,
    handle: (target: HTMLElement) => void,
  ) {
    this.getElements(selector).forEach((element) =>
      element.addEventListener(event, (e) => {
        if (e.target instanceof HTMLElement) {
          handle(e.target)
        }
      }),
    )
  }

  increaseBrightness(hex: string, percent: number): string {
    hex = hex.replace(/^\s*#|\s*$/g, "")
    if (hex.length === 3) hex = hex.replace(/(.)/g, "$1$1")

    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    const format = (c: number) =>
      Math.min(255, Math.max(0, Math.round(c + ((255 - c) * percent) / 100)))
        .toString(16)
        .padStart(2, "0")

    return `#${format(r)}${format(g)}${format(b)}`
  }
}