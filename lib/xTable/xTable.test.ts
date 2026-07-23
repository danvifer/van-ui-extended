import { describe, it, expect, beforeEach } from "vitest";
import van from "vanjs-core";
import { computeWindow } from "./xTable.virtualScroll";
import {
  defaultCompare,
  filterRows,
  getCellValue,
  paginateRows,
  resolveRowKey,
  sortRows,
} from "./xTable.helpers";
import type { XColumn } from "./xTable.types";
import { xTable } from "./xTable";

interface Sensor {
  readonly id: number;
  readonly sensor: string;
  readonly value: number;
  readonly unit: string;
  readonly status: string;
}

const sensorCols: XColumn<Sensor>[] = [
  { key: "sensor", label: "Sensor", sortable: true },
  { key: "value", label: "Value", sortable: true, align: "right" },
  { key: "unit", label: "Unit" },
  { key: "status", label: "Status", sortable: true },
];

const sampleSensors: Sensor[] = [
  { id: 1, sensor: "Temperatura", value: 23.5, unit: "°C", status: "OK" },
  { id: 2, sensor: "Humedad", value: 61, unit: "%", status: "OK" },
  { id: 3, sensor: "Presión", value: 1013, unit: "hPa", status: "OK" },
  { id: 4, sensor: "CO2", value: 412, unit: "ppm", status: "Warning" },
];

const getValue = <T>(c: XColumn<T>, r: T): unknown => getCellValue(c, r);

describe("xTable / virtual scroll helper", () => {
  it("top of list — startIndex 0 and endIndex bounded by 2 * sliceSize", () => {
    const r = computeWindow({
      scrollTop: 0,
      containerHeight: 480,
      itemSize: 32,
      sliceSize: 30,
      rowCount: 10_000,
      stickyStart: 0,
      stickyEnd: 0,
    });
    expect(r.startIndex).toBe(0);
    expect(r.endIndex - r.startIndex).toBeLessThanOrEqual(60);
    expect(r.paddingTop).toBe(0);
    expect(r.paddingBottom).toBe((10_000 - r.endIndex) * 32);
  });

  it("middle of list — start tracks scrollTop / itemSize with overscan", () => {
    const r = computeWindow({
      scrollTop: 32 * 500,
      containerHeight: 480,
      itemSize: 32,
      sliceSize: 30,
      rowCount: 10_000,
      stickyStart: 0,
      stickyEnd: 0,
    });
    expect(r.startIndex).toBeGreaterThanOrEqual(500 - 30);
    expect(r.startIndex).toBeLessThanOrEqual(500);
    expect(r.endIndex - r.startIndex).toBeLessThanOrEqual(60);
  });

  it("bottom of list — endIndex clamps to rowCount", () => {
    const r = computeWindow({
      scrollTop: 32 * 10_000,
      containerHeight: 480,
      itemSize: 32,
      sliceSize: 30,
      rowCount: 10_000,
      stickyStart: 0,
      stickyEnd: 0,
    });
    expect(r.endIndex).toBe(10_000);
    expect(r.paddingBottom).toBe(0);
  });

  it("sticky bands shrink the effective viewport", () => {
    const sticky = computeWindow({
      scrollTop: 100,
      containerHeight: 480,
      itemSize: 32,
      sliceSize: 30,
      rowCount: 10_000,
      stickyStart: 60,
      stickyEnd: 40,
    });
    const noSticky = computeWindow({
      scrollTop: 100,
      containerHeight: 480,
      itemSize: 32,
      sliceSize: 30,
      rowCount: 10_000,
      stickyStart: 0,
      stickyEnd: 0,
    });
    expect(sticky.startIndex).toBeLessThanOrEqual(noSticky.startIndex);
  });

  it("empty list — returns zeros", () => {
    expect(
      computeWindow({
        scrollTop: 0,
        containerHeight: 480,
        itemSize: 32,
        sliceSize: 30,
        rowCount: 0,
        stickyStart: 0,
        stickyEnd: 0,
      }),
    ).toEqual({ startIndex: 0, endIndex: 0, paddingTop: 0, paddingBottom: 0 });
  });
});

describe("xTable / helpers", () => {
  it("resolveRowKey — property accessor", () => {
    expect(resolveRowKey({ id: 42 } as { id: number }, "id")).toBe(42);
  });

  it("resolveRowKey — function accessor", () => {
    expect(
      resolveRowKey({ a: 1, b: 2 } as { a: number; b: number }, (r) => `${r.a}-${r.b}`),
    ).toBe("1-2");
  });

  it("getCellValue — uses column.value when present", () => {
    const col: XColumn<{ a: number; b: number }> = {
      key: "sum",
      label: "Sum",
      value: (r) => r.a + r.b,
    };
    expect(getCellValue(col, { a: 2, b: 3 })).toBe(5);
  });

  it("getCellValue — falls back to row[key]", () => {
    const col: XColumn<{ x: string }> = { key: "x", label: "X" };
    expect(getCellValue(col, { x: "hello" })).toBe("hello");
  });

  it("defaultCompare — numbers, strings, nullish, booleans", () => {
    expect(defaultCompare(1, 2)).toBe(-1);
    expect(defaultCompare("apple", "banana")).toBeLessThan(0);
    expect(defaultCompare(null, 1)).toBe(-1);
    expect(defaultCompare(1, null)).toBe(1);
    expect(defaultCompare(null, null)).toBe(0);
    expect(defaultCompare(true, false)).toBeGreaterThan(0);
  });

  it("sortRows — null sortBy returns input unchanged", () => {
    const out = sortRows(sampleSensors, null, false, sensorCols, getValue);
    expect(out).toBe(sampleSensors);
  });

  it("sortRows — ascending numeric", () => {
    const out = sortRows(sampleSensors, "value", false, sensorCols, getValue);
    expect(out.map((s) => s.value)).toEqual([23.5, 61, 412, 1013]);
  });

  it("sortRows — descending string", () => {
    const out = sortRows(sampleSensors, "sensor", true, sensorCols, getValue);
    expect(out[0].sensor).toBe("Temperatura");
  });

  it("sortRows — custom comparator wins over default", () => {
    const cols: XColumn<Sensor>[] = [
      {
        key: "value",
        label: "v",
        sortable: true,
        sort: (a, b) => Number(b) - Number(a), // forced descending
      },
    ];
    const out = sortRows(sampleSensors, "value", false, cols, getValue);
    expect(out[0].value).toBe(1013);
  });

  it("sortRows — does not mutate input", () => {
    const snapshot = sampleSensors.slice();
    sortRows(sampleSensors, "value", true, sensorCols, getValue);
    expect(sampleSensors).toEqual(snapshot);
  });

  it("paginateRows — slices correctly", () => {
    expect(paginateRows([1, 2, 3, 4, 5], 2, 2)).toEqual([3, 4]);
    expect(paginateRows([1, 2, 3, 4, 5], 3, 2)).toEqual([5]);
  });

  it("paginateRows — rowsPerPage 0 returns all", () => {
    const all = paginateRows(sampleSensors, 1, 0);
    expect(all).toBe(sampleSensors);
  });

  it("filterRows — default substring matches across columns", () => {
    const out = filterRows(sampleSensors, "ok", sensorCols, getValue);
    expect(out.length).toBe(3);
  });

  it("filterRows — empty term returns all", () => {
    expect(filterRows(sampleSensors, "", sensorCols, getValue)).toBe(sampleSensors);
  });

  it("filterRows — custom method bypasses default", () => {
    const out = filterRows(
      sampleSensors,
      "anything",
      sensorCols,
      getValue,
      (rs) => rs.filter((r) => r.sensor === "CO2"),
    );
    expect(out).toEqual([sampleSensors[3]]);
  });
});

describe("xTable / DOM render", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders columns × rows with default values", () => {
    const rows = van.state(sampleSensors);
    van.add(document.body, xTable({ rows, columns: sensorCols }));

    const headers = document.body.querySelectorAll("thead th");
    expect(headers.length).toBe(4);
    expect(headers[0].textContent).toContain("Sensor");

    const bodyRows = document.body.querySelectorAll("tbody tr");
    expect(bodyRows.length).toBe(4);
    expect(bodyRows[0].textContent).toContain("Temperatura");
    expect(bodyRows[3].textContent).toContain("CO2");
  });

  it("click on sortable header cycles asc → desc → none", () => {
    const rows = van.state(sampleSensors);
    const sortBy = van.state<string | null>(null);
    const descending = van.state(false);
    van.add(
      document.body,
      xTable({ rows, columns: sensorCols, sortBy, descending }),
    );

    const headerSpan = document.body.querySelectorAll(
      "thead th",
    )[1].querySelector("span");
    if (!headerSpan) throw new Error("expected sortable header span");

    headerSpan.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(sortBy.val).toBe("value");
    expect(descending.val).toBe(false);

    headerSpan.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(descending.val).toBe(true);

    headerSpan.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(sortBy.val).toBe(null);
    expect(descending.val).toBe(false);
  });

  it("binaryStateSort skips the 'none' state", () => {
    const rows = van.state(sampleSensors);
    const sortBy = van.state<string | null>(null);
    const descending = van.state(false);
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        sortBy,
        descending,
        binaryStateSort: true,
      }),
    );

    const headerSpan = document.body.querySelectorAll(
      "thead th",
    )[1].querySelector("span");
    if (!headerSpan) throw new Error("expected sortable header span");

    headerSpan.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(sortBy.val).toBe("value");
    expect(descending.val).toBe(false);

    headerSpan.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(descending.val).toBe(true);

    headerSpan.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(sortBy.val).toBe("value"); // does NOT clear
    expect(descending.val).toBe(false);
  });

  it("pagination — changing page renders the next slice", async () => {
    const rows = van.state(sampleSensors);
    const pagination = van.state({ page: 1, rowsPerPage: 2 });
    van.add(
      document.body,
      xTable({ rows, columns: sensorCols, pagination }),
    );

    expect(document.body.querySelectorAll("tbody tr").length).toBe(2);
    expect(document.body.querySelector("tbody tr")?.textContent).toContain("Temperatura");

    pagination.val = { ...pagination.val, page: 2 };
    await Promise.resolve();
    await Promise.resolve();

    expect(document.body.querySelectorAll("tbody tr").length).toBe(2);
    expect(document.body.querySelector("tbody tr")?.textContent).toContain("Presión");
  });

  it("rowsPerPage: 0 shows all rows", () => {
    const rows = van.state(sampleSensors);
    const pagination = van.state({ page: 1, rowsPerPage: 0 });
    van.add(
      document.body,
      xTable({ rows, columns: sensorCols, pagination }),
    );
    expect(document.body.querySelectorAll("tbody tr").length).toBe(sampleSensors.length);
  });
});

describe("xTable / selection", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("selection 'none' renders no select column", () => {
    const rows = van.state(sampleSensors);
    van.add(document.body, xTable({ rows, columns: sensorCols }));
    expect(document.body.querySelectorAll("thead th").length).toBe(sensorCols.length);
    const firstRow = document.body.querySelector("tbody tr");
    expect(firstRow?.querySelectorAll("td").length).toBe(sensorCols.length);
  });

  it("selection 'single' uses radios and clears prior selection", async () => {
    const rows = van.state(sampleSensors);
    const selected = van.state<Sensor[]>([]);
    van.add(
      document.body,
      xTable({ rows, columns: sensorCols, selection: "single", selected, rowKey: "id" }),
    );

    const radios = document.body.querySelectorAll<HTMLInputElement>(
      'tbody input[type="radio"]',
    );
    expect(radios.length).toBe(sampleSensors.length);

    radios[0].dispatchEvent(new Event("change", { bubbles: true }));
    expect(selected.val.map((s) => s.id)).toEqual([1]);

    radios[2].dispatchEvent(new Event("change", { bubbles: true }));
    expect(selected.val.map((s) => s.id)).toEqual([3]);
  });

  it("selection 'multiple' — header indeterminate when partially selected", async () => {
    const rows = van.state(sampleSensors);
    const selected = van.state<Sensor[]>([]);
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        selection: "multiple",
        selected,
        rowKey: "id",
      }),
    );

    const rowCheckboxes = document.body.querySelectorAll<HTMLInputElement>(
      'tbody input[type="checkbox"]',
    );
    const headerCheckbox = document.body.querySelector<HTMLInputElement>(
      'thead input[type="checkbox"]',
    );
    if (!headerCheckbox) throw new Error("header checkbox missing");

    expect(headerCheckbox.indeterminate).toBe(false);
    expect(headerCheckbox.checked).toBe(false);

    rowCheckboxes[0].dispatchEvent(new Event("change", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();
    expect(selected.val.map((s) => s.id)).toEqual([1]);
    expect(headerCheckbox.indeterminate).toBe(true);

    rowCheckboxes[1].dispatchEvent(new Event("change", { bubbles: true }));
    rowCheckboxes[2].dispatchEvent(new Event("change", { bubbles: true }));
    rowCheckboxes[3].dispatchEvent(new Event("change", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();
    expect(headerCheckbox.indeterminate).toBe(false);
    expect(headerCheckbox.checked).toBe(true);
  });

  it("selection 'multiple' — clicking header toggles all visible", async () => {
    const rows = van.state(sampleSensors);
    const selected = van.state<Sensor[]>([]);
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        selection: "multiple",
        selected,
        rowKey: "id",
      }),
    );

    const headerCheckbox = document.body.querySelector<HTMLInputElement>(
      'thead input[type="checkbox"]',
    );
    if (!headerCheckbox) throw new Error("header checkbox missing");

    headerCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
    expect(selected.val.length).toBe(sampleSensors.length);

    headerCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
    expect(selected.val.length).toBe(0);
  });

  it("rowKey as function — selection identity uses the function output", () => {
    const rows = van.state(sampleSensors);
    const selected = van.state<Sensor[]>([]);
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        selection: "multiple",
        selected,
        rowKey: (r) => `key-${r.sensor}`,
      }),
    );

    const rowCheckboxes = document.body.querySelectorAll<HTMLInputElement>(
      'tbody input[type="checkbox"]',
    );
    rowCheckboxes[1].dispatchEvent(new Event("change", { bubbles: true }));
    expect(selected.val).toEqual([sampleSensors[1]]);
  });
});

describe("xTable / filter", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("global filter — narrows rows to matches", async () => {
    const rows = van.state(sampleSensors);
    const filter = van.state("");
    van.add(
      document.body,
      xTable({ rows, columns: sensorCols, filter }),
    );

    expect(document.body.querySelectorAll("tbody tr").length).toBe(4);

    filter.val = "ok";
    await Promise.resolve();
    await Promise.resolve();
    expect(document.body.querySelectorAll("tbody tr").length).toBe(3);

    filter.val = "";
    await Promise.resolve();
    await Promise.resolve();
    expect(document.body.querySelectorAll("tbody tr").length).toBe(4);
  });

  it("custom filterMethod takes over the default", async () => {
    const rows = van.state(sampleSensors);
    const filter = van.state("anything");
    let callCount = 0;
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        filter,
        filterMethod: (rs) => {
          callCount += 1;
          return rs.filter((r) => r.sensor === "CO2");
        },
      }),
    );
    expect(callCount).toBeGreaterThanOrEqual(1);
    expect(document.body.querySelectorAll("tbody tr").length).toBe(1);
    expect(document.body.querySelector("tbody tr")?.textContent).toContain("CO2");
  });

  it("per-column popover — clicking the filter icon toggles popover open", async () => {
    const rows = van.state(sampleSensors);
    const filterableCols: XColumn<Sensor>[] = sensorCols.map((c, i) =>
      i === 0 ? { ...c, columnFilter: "basic" } : c,
    );
    van.add(
      document.body,
      xTable({ rows, columns: filterableCols }),
    );

    const filterBtn = document.body.querySelector<HTMLButtonElement>(
      "thead th button",
    );
    if (!filterBtn) throw new Error("filter button missing");

    filterBtn.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
    await Promise.resolve();
    await Promise.resolve();
    expect(document.body.querySelectorAll("thead th div").length).toBeGreaterThan(0);

    const popoverInput = document.body.querySelector<HTMLInputElement>(
      'thead th input[type="text"]',
    );
    expect(popoverInput).not.toBeNull();
  });

  it("per-column popover — Apply narrows rows, Clear restores", async () => {
    const rows = van.state(sampleSensors);
    const filterableCols: XColumn<Sensor>[] = sensorCols.map((c, i) =>
      i === 0 ? { ...c, columnFilter: "basic" } : c,
    );
    van.add(
      document.body,
      xTable({ rows, columns: filterableCols }),
    );

    const filterBtn = document.body.querySelector<HTMLButtonElement>(
      "thead th button",
    );
    if (!filterBtn) throw new Error("filter button missing");
    filterBtn.click();
    await Promise.resolve();

    const popoverInput = document.body.querySelector<HTMLInputElement>(
      'thead th input[type="text"]',
    );
    if (!popoverInput) throw new Error("popover input missing");

    popoverInput.value = "Humedad";
    popoverInput.dispatchEvent(new Event("input", { bubbles: true }));

    const popoverButtons = document.body.querySelectorAll<HTMLButtonElement>(
      "thead th button",
    );
    const applyBtn = Array.from(popoverButtons).find(
      (b) => b.textContent?.includes("Apply"),
    );
    const clearBtn = Array.from(popoverButtons).find(
      (b) => b.textContent?.includes("Clear"),
    );
    if (!applyBtn || !clearBtn) throw new Error("Apply/Clear missing");

    applyBtn.click();
    await Promise.resolve();
    await Promise.resolve();

    expect(document.body.querySelectorAll("tbody tr").length).toBe(1);
    expect(document.body.querySelector("tbody tr")?.textContent).toContain("Humedad");

    // re-open and clear
    filterBtn.click();
    await Promise.resolve();
    const clearBtn2 = Array.from(
      document.body.querySelectorAll<HTMLButtonElement>("thead th button"),
    ).find((b) => b.textContent?.includes("Clear"));
    if (!clearBtn2) throw new Error("Clear missing on re-open");
    clearBtn2.click();
    await Promise.resolve();
    await Promise.resolve();
    expect(document.body.querySelectorAll("tbody tr").length).toBe(sampleSensors.length);
  });

  it("expansion — no expander column when slot is absent", () => {
    const rows = van.state(sampleSensors);
    van.add(document.body, xTable({ rows, columns: sensorCols }));
    expect(document.body.querySelectorAll("thead th").length).toBe(sensorCols.length);
  });

  it("expansion — chevron click adds rowKey to expanded state", async () => {
    const rows = van.state(sampleSensors);
    const expanded = van.state<(string | number)[]>([]);
    const calls: Array<{ rowKey: string | number; cols: number }> = [];
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        rowKey: "id",
        expanded,
        slots: {
          expandedRow: ({ row, rowKey, cols }) => {
            calls.push({ rowKey, cols: cols.length });
            return `expanded ${(row as Sensor).sensor}`;
          },
        },
      }),
    );

    expect(document.body.querySelectorAll("thead th").length).toBe(sensorCols.length + 1);

    const firstRowExpander = document.body.querySelector(
      'tbody tr td span[onclick], tbody tr td span',
    );
    // tighter selector: chevron is in the first td of the first row
    const chevron = document.body
      .querySelector("tbody tr")
      ?.querySelector("span");
    if (!chevron) throw new Error("chevron missing");
    chevron.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();

    expect(expanded.val).toEqual([1]);
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0].cols).toBe(sensorCols.length);
    expect(document.body.textContent).toContain("expanded Temperatura");

    chevron.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();
    expect(expanded.val).toEqual([]);
    void firstRowExpander; // suppress unused
  });

  it("virtual scroll — renders ≤ sliceSize × 2 + 2 spacer trs for 10k rows", async () => {
    const big = Array.from({ length: 10_000 }, (_, i) => ({
      id: i,
      sensor: `S${i}`,
      value: i,
      unit: "u",
      status: "OK",
    }));
    const rows = van.state(big);
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        rowKey: "id",
        virtualScroll: true,
        virtualScrollItemSize: 32,
        virtualScrollSliceSize: 30,
      }),
    );

    const trCount = document.body.querySelectorAll("tbody tr").length;
    expect(trCount).toBeGreaterThan(0);
    expect(trCount).toBeLessThanOrEqual(30 * 2 + 2);
  });

  it("virtual scroll — scrolling advances the slice start index", async () => {
    const big = Array.from({ length: 10_000 }, (_, i) => ({
      id: i,
      sensor: `S${i}`,
      value: i,
      unit: "u",
      status: "OK",
    }));
    const rows = van.state(big);
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        rowKey: "id",
        virtualScroll: true,
        virtualScrollItemSize: 32,
        virtualScrollSliceSize: 30,
      }),
    );

    const viewport = document.body.querySelector<HTMLDivElement>("div.overflow-auto");
    if (!viewport) throw new Error("virtual scroll viewport missing");

    // Initial render: first data row should be S0
    expect(document.body.textContent).toContain("S0");

    Object.defineProperty(viewport, "scrollTop", { value: 32 * 500, writable: true });
    viewport.dispatchEvent(new Event("scroll", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();

    // After scrolling 500 rows down, S500 (± overscan) is visible, S0 is not in the slice
    expect(document.body.textContent).toContain("S500");
  });

  it("virtual scroll — hides pagination footer silently", () => {
    const rows = van.state(sampleSensors);
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        virtualScroll: true,
        virtualScrollItemSize: 32,
        virtualScrollSliceSize: 30,
      }),
    );
    // pagination footer renders an empty span when hidden
    const footer = document.body.querySelector("div.flex.items-center.justify-between");
    expect(footer).toBeNull();
  });

  it("slots.bodyCell overrides default cell render for ALL columns", () => {
    const rows = van.state(sampleSensors);
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        slots: {
          bodyCell: ({ value }) => `<<${String(value)}>>`,
        },
      }),
    );
    const cells = document.body.querySelectorAll("tbody tr:first-child td");
    expect(cells[0].textContent).toBe("<<Temperatura>>");
    expect(cells[1].textContent).toBe("<<23.5>>");
  });

  it("bodyCellByKey overrides only the matching column", () => {
    const rows = van.state(sampleSensors);
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        bodyCellByKey: {
          value: ({ value }) => `#${String(value)}`,
        },
      }),
    );
    const cells = document.body.querySelectorAll("tbody tr:first-child td");
    expect(cells[0].textContent).toBe("Temperatura");
    expect(cells[1].textContent).toBe("#23.5");
    expect(cells[2].textContent).toBe("°C");
  });

  it("slots.noData renders when no rows and not loading", async () => {
    const rows = van.state<Sensor[]>([]);
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        slots: {
          noData: ({ filterActive }) =>
            `nothing here (filterActive=${filterActive})`,
        },
      }),
    );
    expect(document.body.textContent).toContain("nothing here (filterActive=false)");
  });

  it("slots.loading renders when loading is true", () => {
    const rows = van.state(sampleSensors);
    const loading = van.state(true);
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        loading,
        slots: { loading: ({ label }) => `~~ ${label} ~~` },
      }),
    );
    expect(document.body.textContent).toContain("~~ Loading...");
  });

  it("server-side — onRequest provided: sort/filter helpers are bypassed (rows render unchanged)", async () => {
    const rows = van.state(sampleSensors);
    const filter = van.state("nonsense-would-match-nothing");
    const sortBy = van.state<string | null>("value");
    const descending = van.state(true);
    let onRequestCalls = 0;
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        filter,
        sortBy,
        descending,
        onRequest: () => {
          onRequestCalls += 1;
        },
      }),
    );

    // All 4 rows render — server-side bypasses the filter/sort pipeline.
    // Order is unchanged (the caller is responsible for the order on the server).
    const bodyRows = document.body.querySelectorAll("tbody tr");
    expect(bodyRows.length).toBe(sampleSensors.length);
    expect(bodyRows[0].textContent).toContain("Temperatura");
  });

  it("server-side — onRequest fires when pagination.page changes", async () => {
    const rows = van.state(sampleSensors);
    let calls = 0;
    const pagination = van.state({ page: 1, rowsPerPage: 10, rowsNumber: 100 });
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        pagination,
        onRequest: () => {
          calls += 1;
        },
      }),
    );
    expect(calls).toBe(0); // initial run is skipped

    pagination.val = { ...pagination.val, page: 2 };
    await Promise.resolve();
    await Promise.resolve();
    expect(calls).toBeGreaterThanOrEqual(1);
  });

  it("server-side — rowsNumber drives the pages count in the footer", () => {
    const rows = van.state(sampleSensors);
    const pagination = van.state({ page: 5, rowsPerPage: 10, rowsNumber: 1000 });
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        pagination,
      }),
    );
    // 1000 / 10 = 100 pages; on page 5 the visible range is 41–50.
    const footerText = document.body.textContent ?? "";
    expect(footerText).toContain("41–50 of 1000");
  });

  it("pagination footer — rows-per-page dropdown opens and applies on click", async () => {
    const rows = van.state(sampleSensors);
    const pagination = van.state({ page: 1, rowsPerPage: 2 });
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        pagination,
        rowsPerPageOptions: [2, 4, 0],
      }),
    );

    // Find the rows-per-page trigger — the button whose text reads "2" (current rpp).
    const allButtons = Array.from(
      document.body.querySelectorAll<HTMLButtonElement>("button"),
    );
    const trigger = allButtons.find((b) => b.textContent?.trim().startsWith("2"));
    if (!trigger) throw new Error("rows-per-page trigger missing");

    trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();

    // Options panel rendered; one of its options is "4".
    const fourOption = Array.from(document.body.querySelectorAll("div")).find(
      (d) =>
        d.textContent?.trim() === "4" &&
        d.getAttribute("class")?.includes("cursor-pointer"),
    );
    if (!fourOption) throw new Error("option '4' missing from open dropdown");

    fourOption.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();

    expect(pagination.val.rowsPerPage).toBe(4);
    expect(pagination.val.page).toBe(1); // reset on rpp change
    expect(document.body.querySelectorAll("tbody tr").length).toBe(sampleSensors.length); // all 4 rows fit on page 1
  });

  it("pagination footer — renders the spinner SVG by default when loading", () => {
    const rows = van.state(sampleSensors);
    const loading = van.state(true);
    van.add(
      document.body,
      xTable({ rows, columns: sensorCols, loading }),
    );
    const svgEl = document.body.querySelector("tbody svg");
    expect(svgEl).not.toBeNull();
    expect(svgEl?.getAttribute("class") ?? "").toContain("animate-spin");
  });

  it("server-side — rowsNumber without onRequest still bypasses pipeline silently", () => {
    const rows = van.state(sampleSensors);
    const filter = van.state("xxxxx-no-match-here");
    const pagination = van.state({ page: 1, rowsPerPage: 10, rowsNumber: 4 });
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        filter,
        pagination,
      }),
    );
    expect(document.body.querySelectorAll("tbody tr").length).toBe(sampleSensors.length);
  });

  it("columnFilter 'select' — popover renders a <select> with distinct values + (All)", async () => {
    const rows = van.state(sampleSensors);
    const cols: XColumn<Sensor>[] = [
      { key: "sensor", label: "Sensor" },
      { key: "status", label: "Status", columnFilter: "select" },
    ];
    van.add(document.body, xTable({ rows, columns: cols, rowKey: "id" }));

    const filterBtn = document.body.querySelector<HTMLButtonElement>(
      "thead th button",
    );
    if (!filterBtn) throw new Error("filter button missing");
    filterBtn.click();
    await Promise.resolve();
    await Promise.resolve();

    const selectEl = document.body.querySelector<HTMLSelectElement>(
      "thead th select",
    );
    if (!selectEl) throw new Error("select control missing");

    const optionValues = Array.from(selectEl.querySelectorAll("option")).map(
      (o) => o.value,
    );
    // (All) + the 2 distinct statuses ("OK", "Warning") — order: empty first, then sorted
    expect(optionValues).toEqual(["", "OK", "Warning"]);
  });

  it("columnFilter 'select' — Apply does an EXACT match (not substring)", async () => {
    const rowsData: Sensor[] = [
      ...sampleSensors,
      { id: 5, sensor: "Anemometer", value: 12, unit: "m/s", status: "OK-Override" },
    ];
    const rows = van.state(rowsData);
    const cols: XColumn<Sensor>[] = [
      { key: "sensor", label: "Sensor" },
      { key: "status", label: "Status", columnFilter: "select" },
    ];
    van.add(document.body, xTable({ rows, columns: cols, rowKey: "id" }));

    document.body.querySelector<HTMLButtonElement>("thead th button")?.click();
    await Promise.resolve();

    const selectEl = document.body.querySelector<HTMLSelectElement>(
      "thead th select",
    );
    if (!selectEl) throw new Error("select missing");
    selectEl.value = "OK";
    selectEl.dispatchEvent(new Event("change", { bubbles: true }));

    const applyBtn = Array.from(
      document.body.querySelectorAll<HTMLButtonElement>("thead th button"),
    ).find((b) => b.textContent?.includes("Apply"));
    applyBtn?.click();
    await Promise.resolve();
    await Promise.resolve();

    const rendered = document.body.querySelectorAll("tbody tr");
    // Exact match on "OK" — does NOT include the row whose status is "OK-Override"
    expect(rendered.length).toBe(3);
    expect(document.body.textContent).not.toContain("Anemometer");
  });

  it("per-column popover — typing does NOT re-mount the input element", async () => {
    const rows = van.state(sampleSensors);
    const cols: XColumn<Sensor>[] = [
      { key: "sensor", label: "Sensor", columnFilter: "basic" },
    ];
    van.add(document.body, xTable({ rows, columns: cols, rowKey: "id" }));

    document.body.querySelector<HTMLButtonElement>("thead th button")?.click();
    await Promise.resolve();
    await Promise.resolve();

    const firstInput = document.body.querySelector<HTMLInputElement>(
      'thead th input[type="text"]',
    );
    if (!firstInput) throw new Error("popover input missing");

    firstInput.focus();
    firstInput.value = "T";
    firstInput.dispatchEvent(new Event("input", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();

    firstInput.value = "Te";
    firstInput.dispatchEvent(new Event("input", { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();

    const sameInput = document.body.querySelector<HTMLInputElement>(
      'thead th input[type="text"]',
    );
    // Same DOM reference proves no re-render replaced the input — focus is preserved.
    expect(sameInput).toBe(firstInput);
    expect(document.activeElement).toBe(firstInput);
  });

  it("theme 'material' — applies material classes on key surfaces", () => {
    const rows = van.state(sampleSensors);
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        theme: "material",
      }),
    );
    const thead = document.body.querySelector("thead");
    expect(thead?.className).toContain("bg-white");
    expect(thead?.className).toContain("text-slate-600");
    const tbody = document.body.querySelector("tbody");
    expect(tbody?.className).toContain("bg-white");
  });

  it("theme defaults to 'dark' when not provided", () => {
    const rows = van.state(sampleSensors);
    van.add(document.body, xTable({ rows, columns: sensorCols }));
    const thead = document.body.querySelector("thead");
    expect(thead?.className).toContain("bg-stone-900");
  });

  it("primaryColor — pins the --xtable-primary CSS variable on the wrapper", () => {
    const rows = van.state(sampleSensors);
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        theme: "material",
        primaryColor: "#7c3aed",
      }),
    );
    const wrapper = document.body.querySelector<HTMLElement>("div.xtable");
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute("style") ?? "").toContain("--xtable-primary: #7c3aed");
  });

  it("primaryColor — omitted: no inline style set (var inherits / falls back)", () => {
    const rows = van.state(sampleSensors);
    van.add(
      document.body,
      xTable({ rows, columns: sensorCols, theme: "material" }),
    );
    const wrapper = document.body.querySelector<HTMLElement>("div.xtable");
    const style = wrapper?.getAttribute("style") ?? "";
    expect(style).not.toContain("--xtable-primary");
  });

  it("mutation guard — frozen columns survive the popover lifecycle", async () => {
    const rows = van.state(sampleSensors);
    const frozenCol = Object.freeze({
      key: "sensor" as const,
      label: "Sensor",
      sortable: true,
      columnFilter: "basic" as const,
    });
    const cols = [frozenCol, ...sensorCols.slice(1)];

    expect(() =>
      van.add(document.body, xTable({ rows, columns: cols })),
    ).not.toThrow();

    const filterBtn = document.body.querySelector<HTMLButtonElement>(
      "thead th button",
    );
    expect(filterBtn).not.toBeNull();
    filterBtn?.click();
    await Promise.resolve();
    await Promise.resolve();

    // No write to the frozen column object would have happened — verify
    // by ensuring it remains frozen and structurally identical.
    expect(Object.isFrozen(frozenCol)).toBe(true);
    expect(frozenCol.key).toBe("sensor");
  });
});

describe("xTable / per-column filter row", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("filterCellByKey — renders one filter <td> per column, keyed content aligned", () => {
    const rows = van.state(sampleSensors);
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        filterCellByKey: {
          sensor: () => {
            const i = document.createElement("input");
            i.type = "text";
            i.className = "sensor-filter";
            return i;
          },
          status: () => "STATUS_FILTER",
        },
      }),
    );

    const theadRows = document.body.querySelectorAll("thead tr");
    // header row + per-column filter row
    expect(theadRows.length).toBe(2);

    const filterCells = theadRows[1].querySelectorAll("td");
    // one <td> per data column — aligned with the headers above
    expect(filterCells.length).toBe(sensorCols.length);

    // sensor (col 0) hosts the input; status (col 3) hosts the text
    expect(filterCells[0].querySelector("input.sensor-filter")).not.toBeNull();
    expect(filterCells[3].textContent).toContain("STATUS_FILTER");
    // value (col 1) and unit (col 2) have no filter -> empty cells
    expect(filterCells[1].textContent).toBe("");
    expect(filterCells[2].textContent).toBe("");
  });

  it("filterCellByKey — no extra row when omitted (backward compatible)", () => {
    const rows = van.state(sampleSensors);
    van.add(document.body, xTable({ rows, columns: sensorCols }));
    expect(document.body.querySelectorAll("thead tr").length).toBe(1);
  });

  it("filterCellsVisible — false hides the filter row, reactive to true", async () => {
    const open = van.state(false);
    const rows = van.state(sampleSensors);
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        filterCellByKey: { sensor: () => "x" },
        filterCellsVisible: () => open.val,
      }),
    );

    const filterRow = document.body.querySelectorAll("thead tr")[1];
    expect(filterRow.className).toContain("hidden");

    open.val = true;
    await Promise.resolve();
    await Promise.resolve();
    expect(filterRow.className).not.toContain("hidden");
  });

  it("filterCellByKey — selection column adds a leading empty filter cell", () => {
    const rows = van.state(sampleSensors);
    const selected = van.state<Sensor[]>([]);
    van.add(
      document.body,
      xTable({
        rows,
        columns: sensorCols,
        selection: "multiple",
        selected,
        rowKey: "id",
        filterCellByKey: { sensor: () => "x" },
      }),
    );

    const filterRow = document.body.querySelectorAll("thead tr")[1];
    const cells = filterRow.querySelectorAll("td");
    // leading selection cell + one per data column
    expect(cells.length).toBe(sensorCols.length + 1);
    // first cell is the (empty) selection placeholder
    expect(cells[0].textContent).toBe("");
    // sensor filter now sits in the second cell
    expect(cells[1].textContent).toBe("x");
  });
});
