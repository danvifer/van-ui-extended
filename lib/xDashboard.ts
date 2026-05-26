import van from "vanjs-core";
import type { State } from "vanjs-core";
import type {
  GridStack,
  GridStackOptions,
  GridStackNode,
} from "gridstack";

const { div } = van.tags;

export interface XDashboardItem {
  readonly id?: string;
  readonly x?: number;
  readonly y?: number;
  readonly w?: number;
  readonly h?: number;
  readonly minW?: number;
  readonly minH?: number;
  readonly maxW?: number;
  readonly maxH?: number;
  readonly locked?: boolean;
  readonly noResize?: boolean;
  readonly noMove?: boolean;
  readonly autoPosition?: boolean;
  readonly title?: string;
  readonly className?: string;
  readonly content: HTMLElement | (() => HTMLElement);
}

export type XDashboardItems = readonly XDashboardItem[];

export interface XDashboardProps {
  readonly items:
    | XDashboardItems
    | State<XDashboardItems>
    | (() => XDashboardItems);
  readonly column?: number;
  readonly cellHeight?: number | string;
  readonly margin?: number | string;
  readonly float?: boolean;
  readonly staticGrid?: boolean;
  readonly disableDrag?: boolean;
  readonly disableResize?: boolean;
  readonly animate?: boolean;
  readonly className?: string;
  readonly onInit?: (grid: GridStack) => void;
  readonly onChange?: (nodes: GridStackNode[]) => void;
}

const isVanState = <T>(v: unknown): v is State<T> =>
  !!v && typeof v === "object" && "val" in (v as Record<string, unknown>);

const resolveProp = <T>(v: T | State<T> | (() => T)): T => {
  if (typeof v === "function") return (v as () => T)();
  if (isVanState<T>(v)) return v.val;
  return v;
};

const onElementRemoved = (el: Element, onRemove: () => void) => {
  let removed = false;

  const stop = () => {
    if (removed) return;
    removed = true;
    try {
      onRemove();
    } catch {}
    try {
      observer.disconnect();
    } catch {}
  };

  const observer = new MutationObserver(() => {
    if (!document.contains(el)) stop();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  return stop;
};

type GridStackModuleLike = {
  GridStack: typeof GridStack;
};

const getGridStackApi = (mod: unknown): GridStackModuleLike => {
  const m = mod as Record<string, unknown>;
  const api =
    typeof m?.GridStack === "function"
      ? (m as unknown as GridStackModuleLike)
      : (m?.default as GridStackModuleLike | undefined);
  if (!api?.GridStack) {
    throw new Error("GridStack loaded but constructor was not found");
  }
  return api;
};

const setGsAttr = (
  el: HTMLElement,
  name: string,
  value: number | string | boolean | undefined,
) => {
  if (value === undefined || value === false) return;
  el.setAttribute(name, value === true ? "true" : String(value));
};

const buildItemElement = (item: XDashboardItem): HTMLDivElement => {
  const wrapper = div({
    class: `grid-stack-item${item.className ? ` ${item.className}` : ""}`,
  }) as HTMLDivElement;

  setGsAttr(wrapper, "gs-id", item.id);
  setGsAttr(wrapper, "gs-x", item.x);
  setGsAttr(wrapper, "gs-y", item.y);
  setGsAttr(wrapper, "gs-w", item.w);
  setGsAttr(wrapper, "gs-h", item.h);
  setGsAttr(wrapper, "gs-min-w", item.minW);
  setGsAttr(wrapper, "gs-min-h", item.minH);
  setGsAttr(wrapper, "gs-max-w", item.maxW);
  setGsAttr(wrapper, "gs-max-h", item.maxH);
  setGsAttr(wrapper, "gs-locked", item.locked);
  setGsAttr(wrapper, "gs-no-resize", item.noResize);
  setGsAttr(wrapper, "gs-no-move", item.noMove);
  setGsAttr(wrapper, "gs-auto-position", item.autoPosition);

  const inner = div({ class: "grid-stack-item-content" });

  if (item.title) {
    const titleEl = div(
      { class: "x-dashboard-item-title" },
      item.title,
    );
    inner.append(titleEl);
  }

  let node: HTMLElement;
  try {
    node = typeof item.content === "function" ? item.content() : item.content;
  } catch (err) {
    console.error(`[xDashboard] item "${item.id ?? "?"}" failed to render`, err);
    node = div(
      {
        class:
          "h-full w-full flex items-center justify-center text-xs text-rose-600 p-2 text-center",
      },
      `Failed to render: ${err instanceof Error ? err.message : String(err)}`,
    ) as HTMLDivElement;
  }

  inner.append(node);
  wrapper.append(inner);
  return wrapper;
};

export const xDashboard = ({
  items,
  column = 12,
  cellHeight = 80,
  margin = 8,
  float = false,
  staticGrid = false,
  disableDrag = false,
  disableResize = false,
  animate = true,
  className = "",
  onInit,
  onChange,
}: XDashboardProps): HTMLDivElement => {
  let gridStackApi: GridStackModuleLike | null = null;
  let grid: GridStack | null = null;
  let stopUnmountWatcher: (() => void) | null = null;
  let initialized = false;

  const container = div({
    class: `grid-stack${className ? ` ${className}` : ""}`,
  }) as HTMLDivElement;

  const dispose = () => {
    if (grid) {
      try {
        grid.offAll();
      } catch {}
      try {
        grid.destroy(false);
      } catch {}
      grid = null;
    }
    initialized = false;
  };

  const renderItems = (current: XDashboardItems) => {
    container.replaceChildren(
      ...current.map((item) => buildItemElement(item)),
    );
  };

  const buildGridOptions = (): GridStackOptions => ({
    column,
    cellHeight,
    margin,
    float,
    staticGrid,
    disableDrag,
    disableResize,
    animate,
  });

  const wireEvents = () => {
    if (!grid || !onChange) return;
    grid.on("change", (_event, nodes) => {
      onChange(nodes as GridStackNode[]);
    });
  };

  const init = async () => {
    if (initialized) return;

    const mod = await import("gridstack");
    gridStackApi = getGridStackApi(mod);

    const current = resolveProp(items);
    renderItems(current);

    grid = gridStackApi.GridStack.init(buildGridOptions(), container);
    initialized = true;

    onInit?.(grid);
    wireEvents();

    if (!stopUnmountWatcher) {
      stopUnmountWatcher = onElementRemoved(container, dispose);
    }
  };

  const rebuild = () => {
    if (!gridStackApi) return;
    const current = resolveProp(items);

    if (grid) {
      try {
        grid.offAll();
      } catch {}
      try {
        grid.destroy(false);
      } catch {}
      grid = null;
    }

    renderItems(current);
    grid = gridStackApi.GridStack.init(buildGridOptions(), container);
    onInit?.(grid);
    wireEvents();
  };

  requestAnimationFrame(() => {
    void init();
  });

  van.derive(() => {
    resolveProp(items);
    if (!initialized) return 0;
    rebuild();
    return 0;
  });

  return container;
};

export default xDashboard;
