/// <reference types="vite/client" />
import { describe, it, expect, beforeEach } from "vitest"
import van from "vanjs-core"
import { Select, type SelectProps } from "./select"
import selectCss from "./select.css?raw"

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

const values = [
  { value: "a", label: "Alpha", description: "first" },
  { value: "b", label: "Beta" },
]

const mount = (props: Partial<SelectProps<string>> = {}) => {
  const root = Select<string>({ values, ...props })
  document.body.append(root)
  return root
}

describe("Select (legacy) classes", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
  })

  it("puts the default selectClass on the outer div and as a prefix of the trigger", () => {
    const root = mount()
    const trigger = root.querySelector("button")!
    expect(root.className).toBe("vx-legacy-select")
    expect(trigger.className).toBe("vx-legacy-select vx-legacy-select__trigger")
  })

  it("lets selectClass replace the default as a whole", () => {
    const root = mount({ selectClass: "my-select" })
    expect(root.className).toBe("my-select")
    expect(root.querySelector("button")!.classList.contains("vx-legacy-select")).toBe(false)
    expect(root.querySelector("button")!.classList.contains("my-select")).toBe(true)
  })

  it("appends optionClass as its own token instead of gluing it to the previous class", () => {
    const options = [...mount({ optionClass: "foo" }).querySelectorAll<HTMLElement>(".vx-legacy-select__option")]
    expect(options).toHaveLength(2)
    for (const option of options) {
      expect([...option.classList]).toEqual(["vx-legacy-select__option", "foo"])
    }
  })

  it("appends optionsClass to the menu", () => {
    const menu = mount({ optionsClass: "bar" }).querySelector<HTMLElement>("#select-father")!
    expect([...menu.classList]).toEqual(["vx-legacy-select__menu", "bar"])
  })

  it("renders the menu as a later sibling of the trigger, which the stylesheet relies on to open it", () => {
    const wrap = mount().querySelector(".vx-legacy-select__wrap")!
    const [trigger, menu] = [...wrap.children]
    expect(trigger.tagName).toBe("BUTTON")
    expect(menu.id).toBe("select-father")
  })
})

describe("Select (legacy) behavior", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
  })

  it("shows the clicked option on the trigger and reports it", async () => {
    const picked: string[] = []
    const root = mount({
      values: [
        { value: "a", label: "Alpha" },
        { value: "b", label: "Beta", func: (v) => picked.push(v) },
      ],
    })
    const beta = [...root.querySelectorAll<HTMLElement>(".vx-legacy-select__option")].find((o) => o.textContent === "Beta")!
    beta.click()
    await tick()
    expect(root.querySelector("button")!.textContent).toBe("Beta")
    expect(picked).toEqual(["b"])
  })

  it("renders the selected value as a chip in multiple mode and removes it from its button", async () => {
    const multipleValues = van.state<string[]>([])
    const root = mount({ multiple: true, selected: "b", multipleValues })
    await tick()
    const chips = () => [...root.querySelectorAll(".vx-legacy-select__chip")]
    expect(chips().map((c) => c.textContent)).toEqual(["Beta"])
    root.querySelector<HTMLElement>(".vx-legacy-select__chip-remove")?.click()
    await tick()
    expect(chips()).toHaveLength(0)
  })
})

describe("select.css", () => {
  /** The rule body of the first selector that is exactly `selector`. */
  const rule = (selector: string): string => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\~:]/g, "\\$&")
    return new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`, "m").exec(selectCss)?.[1] ?? ""
  }

  it("opens the menu while the trigger has focus, with no script", () => {
    const open = rule(".vx-legacy-select__trigger:focus ~ .vx-legacy-select__menu")
    expect(open).toMatch(/visibility:\s*visible/)
    expect(open).toMatch(/opacity:\s*100%/)
  })

  it("keeps the closing delay that lets an option receive the click while the trigger blurs", () => {
    expect(rule(".vx-legacy-select__menu")).toMatch(/transition-duration:\s*200ms/)
  })
})
