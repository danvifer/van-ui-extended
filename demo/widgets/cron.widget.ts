import van from "vanjs-core";
import "../../lib/cron";

const { div, h3, p } = van.tags;
const cronTag = van.tags["cron-expression-input"];

export const cronWidget = (): HTMLElement =>
  div(
    { class: "h-full w-full flex flex-col p-3 gap-2" },
    h3({ class: "text-sm font-semibold text-slate-700" }, "CronComponent"),
    cronTag({
      value: "0 */5 * * *",
      width: "100%",
      height: "40px",
      color: "#334155",
    }),
    p(
      { class: "text-xs text-slate-500" },
      "Click the pencil icon to open the cron editor.",
    ),
  );
