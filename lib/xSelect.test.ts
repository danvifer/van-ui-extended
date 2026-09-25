import { describe, it, expect, beforeEach } from "vitest";
import { xOption, xSelect } from "./xSelect";
import type { XSelectProps } from "./xSelect";

interface Opt {
  readonly value: string;
  readonly selected?: boolean;
}

/** Lets VanJS flush its scheduled DOM updates. */
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

const press = (el: HTMLElement, key: string) =>
  el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));

const type = (input: HTMLInputElement, text: string) => {
  input.value = text;
  input.dispatchEvent(new Event("input", { bubbles: true }));
};

/** The listbox is portaled to <body>, so options are looked up document-wide. */
const option = (text: string): HTMLElement => {
  const li = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(
    (el) => el.textContent === text,
  );
  if (!li) throw new Error(`no option "${text}"`);
  return li;
};

/**
 * A multi-select whose consumer keeps its own copy of the selection by toggling every value
 * `onSelected` reports — the way a table's per-column filter is usually wired. Any path that
 * changes the selection without reporting it leaves that copy filtering by stale values.
 */
const mountMirrored = (options: readonly Opt[], props: Partial<XSelectProps> = {}) => {
  let mirror = options.filter((o) => o.selected).map((o) => o.value);
  const calls: string[] = [];
  const root = xSelect(
    {
      multiple: true,
      searchable: true,
      ...props,
      onSelected: (value: string) => {
        calls.push(value);
        mirror = mirror.includes(value) ? mirror.filter((v) => v !== value) : [...mirror, value];
      },
    },
    ...options.map((o) =>
      xOption({ value: o.value, text: o.value, data: o.value, selected: o.selected }),
    ),
  );
  document.body.append(root);
  const input = root.querySelector("input");
  if (!input) throw new Error("xSelect rendered no input");
  return { root, input, calls, mirror: () => mirror };
};

describe("xSelect / onSelected reports every selection change", () => {
  beforeEach(() => document.body.replaceChildren());

  it("Backspace reports the option it removes, so the mirror matches the trigger", async () => {
    const s = mountMirrored([{ value: "CWE-20", selected: true }, { value: "CWE-120" }]);
    s.input.click();
    await tick();
    s.input.setSelectionRange(s.input.value.length, s.input.value.length);

    press(s.input, "Backspace");
    expect(s.mirror()).toEqual([]);

    option("CWE-120").click();
    press(s.input, "Escape");
    expect(s.input.value).toBe("CWE-120");
    expect(s.mirror()).toEqual(["CWE-120"]);
  });

  it("the clear button reports each option it removes, once", () => {
    const s = mountMirrored(
      [{ value: "A", selected: true }, { value: "B", selected: true }, { value: "C" }],
      { clearable: true },
    );
    const clear = s.root.querySelector<HTMLButtonElement>('button[aria-label="Clear selection"]');
    expect(clear).not.toBeNull();

    clear!.click();
    expect([...s.calls].sort()).toEqual(["A", "B"]);
    expect(s.mirror()).toEqual([]);
  });
});

describe("xSelect / Enter with a search query", () => {
  beforeEach(() => document.body.replaceChildren());

  it("picks the option typed in full over an earlier one that merely contains it", () => {
    const s = mountMirrored([{ value: "CWE-200" }, { value: "CWE-20" }]);
    s.input.click();
    type(s.input, "cwe-20");
    press(s.input, "Enter");
    expect(s.calls).toEqual(["CWE-20"]);
  });

  it("without an exact match, still picks the first option containing the query", () => {
    const s = mountMirrored([{ value: "CWE-200" }, { value: "CWE-20" }]);
    s.input.click();
    type(s.input, "cwe-2");
    press(s.input, "Enter");
    expect(s.calls).toEqual(["CWE-200"]);
  });
});
