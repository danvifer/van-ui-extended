import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import van from "vanjs-core"
import { WizardComponent, type WizardProps } from "./wizard"

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

const stubStep = (name: string, extra: Partial<WizardProps["steps"][number]> = {}) => ({
  name,
  element: van.tags.div(name),
  stepValid: van.state(true),
  ...extra,
})

const mount = (props: Partial<WizardProps> = {}) => {
  WizardComponent({
    title: "Wizard",
    closed: van.state(false),
    closeWizard: () => undefined,
    steps: [stubStep("One"), stubStep("Two")],
    ...props,
  })
  const overlay = document.querySelector<HTMLElement>(".vx-wizard")
  if (!overlay) throw new Error("wizard not mounted")
  return overlay
}

describe("WizardComponent colors", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("sets no color token when no color is passed, so the stylesheet defaults apply", () => {
    expect(mount().getAttribute("style")).toBe("")
  })

  it("exposes primaryColor and secondaryColor as custom properties on the overlay", () => {
    const style = mount({ primaryColor: "#0369a1", secondaryColor: "rgb(12, 74, 110)" }).style
    expect(style.getPropertyValue("--vx-wizard-btn-bg")).toBe("#0369a1")
    expect(style.getPropertyValue("--vx-wizard-btn-hover-bg")).toBe("rgb(12, 74, 110)")
  })

  it("keeps the tokens while the wizard is closed", () => {
    const closed = van.state(true)
    const overlay = mount({ closed, primaryColor: "#0369a1" })
    expect(overlay.style.display).toBe("none")
    expect(overlay.style.getPropertyValue("--vx-wizard-btn-bg")).toBe("#0369a1")
  })

  it("warns and falls back to the default when the browser does not take the value as a color", () => {
    vi.stubGlobal("CSS", { supports: (_prop: string, value: string) => value !== "sky-700" })
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const overlay = mount({ primaryColor: "sky-700", secondaryColor: "#0c4a6e" })
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain("primaryColor")
    expect(warn.mock.calls[0][0]).toContain("sky-700")
    expect(overlay.style.getPropertyValue("--vx-wizard-btn-bg")).toBe("")
    expect(overlay.style.getPropertyValue("--vx-wizard-btn-hover-bg")).toBe("#0c4a6e")
  })

  it("rejects an empty color even where CSS.supports is unavailable", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    expect(mount({ primaryColor: " " }).getAttribute("style")).toBe("")
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it("rejects a value that would break out of the inline declaration, even without CSS.supports", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
    const style = mount({ primaryColor: "red; display: none" }).getAttribute("style")
    expect(style).not.toContain("display")
    expect(warn).toHaveBeenCalledTimes(1)
  })
})

describe("WizardComponent markup", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
  })

  it("uses the vx-wizard__panel class unless modalClass replaces it", () => {
    expect(mount().querySelector(".vx-wizard__panel")).not.toBeNull()
    document.body.innerHTML = ""
    const overlay = mount({ modalClass: "my-panel" })
    expect(overlay.querySelector(".vx-wizard__panel")).toBeNull()
    expect(overlay.querySelector(".my-panel")).not.toBeNull()
  })

  it("marks only the inactive step circles and keeps their inline style a valid declaration list", () => {
    const circles = [...mount().querySelectorAll<HTMLElement>(".vx-wizard__step-num")]
    expect(circles.map((c) => c.classList.contains("vx-wizard__step-num--inactive"))).toEqual([false, true])
    for (const circle of circles) {
      expect(circle.getAttribute("style")).toMatch(/border-color: rgb\(101, 139, 138\);?$/)
    }
  })

  it("keeps the host icon-font classes on the close button", () => {
    const close = mount().querySelector<HTMLElement>(".vx-wizard__close")
    expect(close?.classList.contains("og")).toBe(true)
    expect(close?.classList.contains("ogiconclose")).toBe(true)
  })

  it("toggles the loading labels through the hidden attribute while the last step saves", async () => {
    let finish: () => void = () => undefined
    const postAction = () => new Promise<void>((resolve) => (finish = resolve))
    const overlay = mount({ steps: [stubStep("Only", { postAction })] })
    await tick()
    const [spinner, label] = [...overlay.querySelectorAll<HTMLElement>(".vx-wizard__btn > span")]
    expect([spinner.hidden, label.hidden]).toEqual([true, false])
    overlay.querySelector<HTMLElement>(".vx-wizard__btn")?.click()
    await tick()
    expect([spinner.hidden, label.hidden]).toEqual([false, true])
    expect(spinner.querySelector(".vx-wizard__spinner")).not.toBeNull()
    finish()
    await tick()
    expect([spinner.hidden, label.hidden]).toEqual([true, false])
  })

  it("renders no class on the loading labels: they are shown or hidden natively", async () => {
    const overlay = mount({ steps: [stubStep("Only")] })
    await tick()
    for (const span of overlay.querySelectorAll(".vx-wizard__btn > span")) {
      expect(span.hasAttribute("class")).toBe(false)
    }
  })
})
