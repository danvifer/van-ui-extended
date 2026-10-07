import { CronFields } from "./cron/nodes/CronFields";
import { CronExpresionInput } from "./cron/nodes/CronExpresionInput";
// Styles live in lib/cron.css and ship in the package stylesheet (van-ui-extended/style.css).
if (!customElements.get("cron-expression-input")) {
    customElements.define("cron-expression-input", CronExpresionInput);
}
if (!customElements.get("cron-fields")) {
    customElements.define("cron-fields", CronFields);
}

export const CronComponent = CronExpresionInput
