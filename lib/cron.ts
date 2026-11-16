import { CronFields } from "./cron/nodes/CronFields.js";
import { CronExpresionInput } from "./cron/nodes/CronExpresionInput.js";
// Styles live in lib/cron.css and ship in the package stylesheet (van-ui-extended/style.css).
// WHY: registration needs the browser's custom element registry. Without a DOM the module must
// still load (issue #23); nothing can be rendered there anyway.
if (typeof customElements !== "undefined") {
    if (!customElements.get("cron-expression-input")) {
        customElements.define("cron-expression-input", CronExpresionInput);
    }
    if (!customElements.get("cron-fields")) {
        customElements.define("cron-fields", CronFields);
    }
}

export const CronComponent = CronExpresionInput
