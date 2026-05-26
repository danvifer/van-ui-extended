import van from "vanjs-core";
import { WizardComponent } from "../../lib/wizard";

const { div, h3, button, p, input, label } = van.tags;

export const wizardWidget = (): HTMLElement => {
  const closed = van.state(true);

  const step1Valid = van.state(false);
  const step2Valid = van.state(false);
  const step3Valid = van.state(true);

  const deviceName = van.state("");
  const deviceType = van.state("");

  const fieldClass =
    "block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500";

  const step1 = div(
    { class: "space-y-2 p-2 text-slate-900" },
    label({ class: "block text-sm font-medium" }, "Device name"),
    input({
      class: fieldClass,
      value: deviceName,
      oninput: (e: Event) => {
        const v = (e.target as HTMLInputElement).value;
        deviceName.val = v;
        step1Valid.val = v.trim().length > 0;
      },
    }),
  );

  const step2 = div(
    { class: "space-y-2 p-2 text-slate-900" },
    label({ class: "block text-sm font-medium" }, "Device type"),
    input({
      class: fieldClass,
      placeholder: "gateway, sensor, actuator…",
      value: deviceType,
      oninput: (e: Event) => {
        const v = (e.target as HTMLInputElement).value;
        deviceType.val = v;
        step2Valid.val = v.trim().length > 0;
      },
    }),
  );

  const step3 = div(
    { class: "space-y-1 p-2 text-slate-900 text-sm" },
    p(() => `Name: ${deviceName.val}`),
    p(() => `Type: ${deviceType.val}`),
  );

  const openWizard = () => {
    closed.val = false;
  };

  const wizard = WizardComponent({
    title: "Register device",
    closed,
    closeWizard: () => {
      closed.val = true;
    },
    steps: [
      { name: "Name", element: step1, stepValid: step1Valid },
      { name: "Type", element: step2, stepValid: step2Valid },
      { name: "Review", element: step3, stepValid: step3Valid },
    ],
  });

  return div(
    { class: "h-full w-full flex flex-col p-3 gap-2" },
    h3({ class: "text-sm font-semibold text-slate-700" }, "WizardComponent"),
    button(
      {
        class:
          "self-start rounded-md px-3 py-1.5 text-sm font-medium bg-slate-900 text-white hover:bg-slate-700",
        onclick: openWizard,
      },
      "Open wizard",
    ),
    p(
      { class: "text-xs text-slate-500 mt-auto" },
      () => `Wizard ${closed.val ? "closed" : "open"} — name: ${deviceName.val || "—"} / type: ${deviceType.val || "—"}`,
    ),
    wizard as unknown as HTMLElement,
  );
};
