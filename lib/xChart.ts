import van from "vanjs-core";
import type { State } from "vanjs-core";
import type { ECharts, EChartsOption } from "echarts";

const { div } = van.tags;

export type XChartEvents = Record<string, (params: any) => void>;

export interface XChartProps {
  readonly options:
    | EChartsOption
    | State<EChartsOption>
    | (() => EChartsOption);
  readonly theme?:
    | string
    | object
    | State<string | object | undefined>
    | (() => string | object | undefined);
  readonly onInit?: (chart: ECharts) => void;
  readonly events?:
    | XChartEvents
    | State<XChartEvents | undefined>
    | (() => XChartEvents | undefined);
  readonly width?: string | State<string> | (() => string);
  readonly height?: string | State<string> | (() => string);
  readonly className?: string;
  readonly ariaLabel?: string;
}

const isVanState = <T>(v: unknown): v is State<T> =>
  !!v && typeof v === "object" && "val" in (v as any);

const resolveProp = <T>(v: T | State<T> | (() => T)): T => {
  if (typeof v === "function") return (v as () => T)();
  if (isVanState<T>(v)) return v.val;
  return v;
};

const cssValue = (v: unknown, fallback: string) =>
  typeof v === "string" && v.trim() ? v.trim() : fallback;

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

const createThemeName = () =>
  `xchart_theme_${Math.random().toString(36).slice(2)}`;

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

type EChartsModuleLike = {
  init: (el: HTMLElement, theme?: string) => ECharts;
  registerTheme: (name: string, theme: object) => void;
};

const getEChartsApi = (mod: any): EChartsModuleLike => {
  const api = mod?.init ? mod : mod?.default;
  if (!api?.init) {
    throw new Error("ECharts loaded but init() was not found");
  }
  return api;
};

export const xChart = ({
  options,
  theme,
  onInit,
  events,
  width = "100%",
  height = "320px",
  className = "",
  ariaLabel = "Chart",
}: XChartProps) => {
  let echartsApi: EChartsModuleLike | null = null;
  let chart: ECharts | null = null;

  let resizeObserver: ResizeObserver | null = null;
  let windowResizeHandler: (() => void) | null = null;
  let stopUnmountWatcher: (() => void) | null = null;

  const boundEvents = new Map<string, (params: any) => void>();
  let resolvedThemeName: string | null = null;

  const container = div({
    class: className,
    role: "img",
    tabindex: 0,
    "aria-label": ariaLabel,
    "aria-roledescription": "chart",
    style: `width:${cssValue(resolveProp(width), "100%")};height:${cssValue(
      resolveProp(height),
      "320px",
    )};`,
  }) as HTMLDivElement;

  container.textContent = "Loading chart…";

  const applySize = () => {
    container.style.cssText =
      `width:${cssValue(resolveProp(width), "100%")};` +
      `height:${cssValue(resolveProp(height), "320px")};`;
  };

  const dispose = () => {
    if (chart) {
      for (const [evt, fn] of boundEvents) {
        try {
          chart.off(evt, fn);
        } catch {}
      }
      boundEvents.clear();
    }

    try {
      resizeObserver?.disconnect();
    } catch {}
    resizeObserver = null;

    if (windowResizeHandler) {
      try {
        window.removeEventListener("resize", windowResizeHandler);
      } catch {}
      windowResizeHandler = null;
    }

    try {
      chart?.dispose();
    } catch {}
    chart = null;
    resolvedThemeName = null;
  };

  const applyOptions = () => {
    if (!chart) return;
    chart.setOption(resolveProp(options), {
      notMerge: true,
      lazyUpdate: false,
    });
  };

  const bindEvents = () => {
    if (!chart) return;

    for (const [evt, fn] of boundEvents) {
      try {
        chart.off(evt, fn);
      } catch {}
    }
    boundEvents.clear();

    const ev = events ? resolveProp(events) : undefined;
    if (!ev || typeof ev !== "object") return;

    for (const [evt, fn] of Object.entries(ev)) {
      if (typeof fn !== "function") continue;
      chart.on(evt, fn);
      boundEvents.set(evt, fn);
    }
  };

  const enableResize = () => {
    if (!chart) return;

    if (!resizeObserver && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => chart?.resize());
      resizeObserver.observe(container);
    }

    if (!windowResizeHandler) {
      windowResizeHandler = () => chart?.resize();
      window.addEventListener("resize", windowResizeHandler, { passive: true });
    }

    if (!stopUnmountWatcher) {
      stopUnmountWatcher = onElementRemoved(container, dispose);
    }
  };

  const resolveTheme = (): string | null => {
    const t = theme ? resolveProp(theme) : undefined;

    if (typeof t === "string") return t.trim() || null;
    if (isPlainObject(t)) {
      const name = createThemeName();
      echartsApi!.registerTheme(name, t);
      return name;
    }
    return null;
  };

  const init = async () => {
    if (chart) return;

    applySize();

    const mod = await import("echarts");
    echartsApi = getEChartsApi(mod);

    resolvedThemeName = resolveTheme();

    container.textContent = "";
    chart = echartsApi.init(container, resolvedThemeName ?? undefined);

    onInit?.(chart);
    applyOptions();
    bindEvents();
    enableResize();
    chart.resize();
  };

  requestAnimationFrame(() => {
    void init();
  });

  van.derive(() => {
    resolveProp(options);
    events && resolveProp(events);
    theme && resolveProp(theme);

    applySize();
    if (!chart) return 0;

    applyOptions();
    bindEvents();
    chart.resize();
    return 0;
  });

  return container;
};

export default xChart;
