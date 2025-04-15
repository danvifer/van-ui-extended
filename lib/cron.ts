import { CronFields } from "./cron/nodes/CronFields";
import { CronExpresionInput } from "./cron/nodes/CronExpresionInput";
import "./cron/index.css"
if (!customElements.get("cron-expression-input")) {
    customElements.define("cron-expression-input", CronExpresionInput);
}
if (!customElements.get("cron-fields")) {
    customElements.define("cron-fields", CronFields);
}

export const CronComponent = CronExpresionInput
