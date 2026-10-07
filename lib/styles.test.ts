/// <reference types="vite/client" />
import { describe, it, expect, beforeEach } from "vitest"
import van, { type ChildDom } from "vanjs-core"
import { xButton } from "./xButton"
import { xLastValue } from "./xLastValue"
import { xSelect, xOption } from "./xSelect"
import { xTable } from "./xTable/xTable"
import type { XColumn, XTableProps } from "./xTable/xTable.types"
import { WizardComponent } from "./wizard"
import { TextAreaComponent } from "./textarea"
import { Select } from "./select"
import { TableComponent } from "./table"

/*
 * Guards the Tailwind-free styling contract:
 *  1. every `vx-*` class the source emits is defined by the shipped stylesheet;
 *  2. with default props, components emit nothing but `vx-*` classes and the few
 *     class names other code relies on.
 */

// Read as text rather than through node:fs, which would need @types/node.
const stylesheets = import.meta.glob("./**/*.css", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>
const sources = import.meta.glob(["./**/*.ts", "!./**/*.test.ts", "!./**/*-demo.ts", "!./cron/**"], {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>

/** Class names emitted on purpose that are not ours to rename (public hooks, third-party contracts). */
const CONTRACT = /^(xtable|og|ogiconclose|x-dashboard-item-title|grid-stack(-[\w-]+)?)$/

/** vx-* classes with no rule of their own: they only opt an element into base.css's reset. */
const RESET_ONLY = new Set(["vx-legacy-table__pager-input"])

describe("stylesheet coverage", () => {
  it("defines every vx-* class used in the source", () => {
    const defined = new Set([
      ...RESET_ONLY,
      ...Object.values(stylesheets).flatMap((css) =>
        [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/\.(vx-[\w-]+)/g)].map((m) => m[1]),
      ),
    ])
    // The lookbehind skips custom properties (--vx-*) and attributes (data-vx-*).
    const used = new Set(
      Object.values(sources).flatMap((src) => [...src.matchAll(/(?<![\w-])vx-[\w-]*[a-z0-9]/g)].map((m) => m[0])),
    )
    expect([...used].filter((c) => !defined.has(c)).sort()).toEqual([])
  })
})

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

const mount = (...nodes: ChildDom[]) => van.add(document.body, ...nodes)

const click = async (el: Element | null | undefined) => {
  if (!el) throw new Error("element to click not found")
  ;(el as HTMLElement).click()
  await tick()
}

const press = (el: Element, key: string) =>
  el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }))

/** Class tokens in the whole body (xSelect portals its list to <body>) that are neither vx-* nor contract. */
const foreignClasses = (): string[] =>
  [
    ...new Set(
      [...document.body.querySelectorAll("[class]")].flatMap((el) => [...el.classList]),
    ),
  ]
    .filter((c) => !c.startsWith("vx-") && !CONTRACT.test(c))
    .sort()

beforeEach(() => {
  document.body.innerHTML = ""
})

interface Row {
  id: number
  name: string
  city: string
  role: string
}

const rows: Row[] = Array.from({ length: 7 }, (_, i) => ({
  id: i + 1,
  name: `Name ${i + 1}`,
  city: i % 2 ? "Madrid" : "Bilbao",
  role: "Engineer",
}))

const cols: XColumn<Row>[] = [
  { key: "name", label: "Name", sortable: true, columnFilter: "basic" },
  { key: "city", label: "City", sortable: true, columnFilter: "select", align: "center" },
  { key: "role", label: "Role", align: "right" },
]

const table = (props: Partial<XTableProps<Row>> = {}) =>
  xTable<Row>({ rows: van.state(rows), columns: cols, rowKey: "id", ...props })

describe("default props emit only vx-* classes", () => {
  it("xButton", () => {
    mount(xButton({ label: "A" }), xButton({ label: "B", disabled: true }), xButton({ label: "C", icon: van.tags.span("*") }))
    expect(foreignClasses()).toEqual([])
  })

  it("xLastValue", () => {
    mount(
      xLastValue({ value: 1, title: "T", subtitle: "S" }),
      xLastValue({ value: 2, title: "T", onClick: () => undefined }),
      xLastValue({ value: 3, preicon: van.tags.span("+"), posticon: van.tags.span("%") }, van.tags.span("child")),
    )
    expect(foreignClasses()).toEqual([])
  })

  it("xSelect", async () => {
    // jsdom has no scrollIntoView, which ArrowDown reaches through a microtask.
    const proto = Element.prototype as { scrollIntoView?: () => void }
    proto.scrollIntoView = () => undefined
    const single = document.createElement("div")
    const multi = document.createElement("div")
    const search = document.createElement("div")
    mount(single, multi, search)
    van.add(single, xSelect({ placeholder: "Single" }, xOption({ data: "A", value: "a" }), xOption({ data: "B", value: "b", disabled: true })))
    van.add(
      multi,
      xSelect(
        { multiple: true, clearable: true },
        xOption({ data: "A", value: "a", selected: true }),
        xOption({ data: "B", value: "b" }),
        xOption({ data: "C", value: "c", disabled: true }),
      ),
    )
    van.add(search, xSelect({ searchable: true }, xOption({ data: "A", value: "a" })))
    await tick()
    for (const host of [single, multi]) {
      const input = host.querySelector("input")!
      await click(input)
      press(input, "ArrowDown")
      await tick()
    }
    const searchInput = search.querySelector("input")!
    await click(searchInput)
    searchInput.value = "zzz"
    searchInput.dispatchEvent(new Event("input", { bubbles: true }))
    await tick()
    delete proto.scrollIntoView
    expect(foreignClasses()).toEqual([])
  })

  it.each(["dark", "material"] as const)("xTable (%s) with selection, expansion, filters and pagination", async (theme) => {
    mount(
      table({
        theme,
        bordered: true,
        selection: "multiple",
        selected: van.state([rows[1]]),
        expanded: van.state([1]),
        filterCellsVisible: () => true,
        pagination: van.state({ page: 1, rowsPerPage: 5 }),
        slots: { expandedRow: ({ row }) => van.tags.div(row.name) },
      }),
    )
    await tick()
    const sortHandle = document.querySelector("thead th span")
    await click(sortHandle)
    await click(document.querySelector("thead th button"))
    const rpp = [...document.querySelectorAll("button")].find((b) => b.textContent?.trim().startsWith("5"))
    await click(rpp)
    expect(foreignClasses()).toEqual([])
  })

  it("xTable states: loading, empty, dense/flat/square, single selection, virtual scroll", async () => {
    mount(
      table({ loading: van.state(true) }),
      table({ rows: van.state([]), theme: "material", dense: true, flat: true, square: true, wrapCells: true }),
      table({ selection: "single" }),
      xTable<Row>({
        rows: van.state(Array.from({ length: 200 }, (_, i) => ({ ...rows[0], id: i }))),
        columns: cols,
        rowKey: "id",
        virtualScroll: true,
      }),
    )
    await tick()
    expect(foreignClasses()).toEqual([])
  })

  it("WizardComponent on its first and last step", async () => {
    mount(
      WizardComponent({
        title: "Wizard",
        closed: van.state(false),
        closeWizard: () => undefined,
        steps: [
          { name: "One", element: van.tags.div("1"), stepValid: van.state(true) },
          { name: "Two", element: van.tags.div("2"), stepValid: van.state(true) },
        ],
      }) as ChildDom,
    )
    await tick()
    const firstStepClasses = foreignClasses()
    const next = [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === "next")
    await click(next)
    expect([...firstStepClasses, ...foreignClasses()]).toEqual([])
  })

  it("TextAreaComponent", () => {
    mount(TextAreaComponent(van.state("x"), 80))
    expect(foreignClasses()).toEqual([])
  })

  it("Select (legacy), single and multiple with chips", () => {
    mount(
      Select<string>({ values: [{ value: "a", label: "A", description: "first" }, { value: "b", label: "B" }] }),
      Select<string>({
        values: [{ value: "a", label: "A" }, { value: "b", label: "B" }],
        multiple: true,
        multipleValues: van.state(["a", "b"]),
      }),
    )
    expect(foreignClasses()).toEqual([])
  })

  it("TableComponent (legacy) with filters, inline actions, action menu, pagination and no data", async () => {
    const legacy = (actions: number, data: Record<string, unknown>[]) =>
      TableComponent({
        columns: [
          { key: "sensor", label: "Sensor", order: true, filter: "basic" },
          {
            key: "status",
            label: "Status",
            filter: "checks",
            filterValues: van.state([{ value: van.state(true), uuid: "OK" }]),
          },
          {
            key: "unit",
            label: "Unit",
            filter: "complex",
            filterValues: van.state([{ value: van.state(false), label: "C" }]),
          },
        ],
        data: van.state(data),
        addMultiSelect: true,
        actionsColumn: Array.from({ length: actions }, (_, i) => ({
          label: `Act ${i}`,
          func: () => undefined,
          disable: () => i === 1,
        })),
        pagination: {
          page: van.state(1),
          pages: van.state(3),
          elements: van.state(25),
          firstFunc: () => undefined,
          prevFunc: () => undefined,
          nextFunc: () => undefined,
          lastFunc: () => undefined,
          selectFunc: () => undefined,
        },
      }) as ChildDom
    const data = [{ sensor: "T", status: "OK", unit: "C" }]
    const inline = document.createElement("div")
    const menu = document.createElement("div")
    mount(inline, menu, legacy(1, []))
    van.add(inline, legacy(2, data))
    van.add(menu, legacy(5, data))
    await tick()
    const seen: string[] = []
    for (let i = 0; i < 3; i++) {
      await click(inline.querySelectorAll("thead button")[i])
      seen.push(...foreignClasses())
    }
    await click(menu.querySelector("tbody tr td:last-child button"))
    expect([...seen, ...foreignClasses()]).toEqual([])
  })
})
