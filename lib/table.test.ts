import { describe, it, expect, beforeEach } from "vitest"
import van, { type ChildDom } from "vanjs-core"
import { TableComponent, type TableProps } from "./table"

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

type Row = Record<string, unknown>

const mount = (props: Partial<TableProps<Row>> = {}) => {
  const host = document.createElement("div")
  document.body.append(host)
  van.add(
    host,
    TableComponent({
      columns: [
        { key: "name", label: "Name", filter: "basic" },
        { key: "city", label: "City", tdClass: "my-cell" },
      ],
      data: van.state<Row[]>([{ name: "Ada", city: "Madrid" }]),
      ...props,
    }) as ChildDom,
  )
  return host
}

describe("TableComponent (legacy) classes", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
  })

  it("renders the vx-legacy-table defaults on the wrapper, head, body, rows and cells", () => {
    const host = mount({ columns: [{ key: "name", label: "Name" }] })
    expect(host.querySelector(".vx-legacy-table")?.tagName).toBe("DIV")
    expect(host.querySelector("thead")?.className).toBe("vx-legacy-table__head")
    expect(host.querySelector("tbody")?.className).toBe("vx-legacy-table__body")
    expect(host.querySelector("tbody tr")?.className.trim()).toBe("vx-legacy-table__row")
    expect(host.querySelector("tbody td")?.className).toBe("vx-legacy-table__td")
  })

  it("lets the *Class props replace the defaults as a whole, and tdClass fall back per column", () => {
    const host = mount({
      tableClass: "my-wrap",
      theadClass: "my-head",
      tbodyClass: "my-body",
      tbodyhoverClass: "my-row",
      RowFormatterClass: () => "formatted",
    })
    expect(host.querySelector("div.my-wrap")).not.toBeNull()
    expect(host.querySelector(".vx-legacy-table")).toBeNull()
    expect(host.querySelector("thead")?.className).toBe("my-head")
    expect(host.querySelector("tbody")?.className).toBe("my-body")
    expect(host.querySelector("tbody tr")?.className).toBe("my-row formatted")
    expect([...host.querySelectorAll("tbody td")].map((td) => td.className)).toEqual(["vx-legacy-table__td", "my-cell"])
  })

  it("adds the condensed modifier to every header cell, selection column included", () => {
    const host = mount({ condensed: true, addMultiSelect: true, actionsColumn: [{ func: () => undefined }] })
    const cells = [...host.querySelectorAll("thead th")]
    expect(cells).toHaveLength(4)
    for (const th of cells) {
      expect(th.className).toBe("vx-legacy-table__th vx-legacy-table__th--condensed")
    }
  })

  it("renders the empty row and the pagination bar with their own classes", () => {
    const host = mount({ data: van.state<Row[]>([]), pagination: { selectFunc: () => undefined, page: van.state(1) } })
    expect(host.querySelector("td.vx-legacy-table__empty")).not.toBeNull()
    expect(host.querySelector("hr.vx-legacy-table__rule")).not.toBeNull()
    const pager = host.querySelector(".vx-legacy-table__pager")
    expect(pager?.querySelectorAll("button.vx-legacy-table__pager-btn")).toHaveLength(5)
  })

  it("opens the filter popover with Clear and Apply buttons that use the table's own classes", async () => {
    const host = mount()
    host.querySelector<HTMLElement>("thead button")?.click()
    await tick()
    const buttons = [...host.querySelectorAll(".vx-legacy-table__popover button")]
    expect(buttons.map((b) => b.className)).toEqual(["vx-legacy-table__popover-btn", "vx-legacy-table__popover-btn"])
    const icons = [...host.querySelectorAll(".vx-legacy-table__popover svg")]
    for (const icon of icons) {
      expect(icon.getAttribute("class")).toBe("vx-legacy-table__icon vx-legacy-table__icon--sm")
    }
  })

  it("marks the filter trigger of a filtered column as active", () => {
    const host = mount({ filters: { name: "Ada" } })
    expect(host.querySelector("thead button")?.className).toBe(
      "vx-legacy-table__filter-btn--active vx-legacy-table__filter-btn",
    )
  })
})
