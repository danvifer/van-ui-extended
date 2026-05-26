import van from "vanjs-core";

const { div, header, main, h1, p, a, section } = van.tags;

export interface IsolatedPageProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly content: HTMLElement | (() => HTMLElement);
}

export const isolatedLayout = ({
  title,
  subtitle,
  content,
}: IsolatedPageProps): HTMLElement => {
  const body = typeof content === "function" ? content() : content;

  return div(
    { class: "min-h-screen bg-slate-100 text-slate-900" },
    header(
      { class: "px-6 py-4 bg-white border-b border-slate-200" },
      a(
        {
          href: "/",
          class: "text-xs text-slate-500 hover:text-slate-900 underline",
        },
        "← back to dashboard home",
      ),
      h1({ class: "text-2xl font-bold mt-1" }, title),
      subtitle
        ? p({ class: "text-sm text-slate-500" }, subtitle)
        : null,
    ),
    main(
      { class: "p-6" },
      section(
        {
          class:
            "max-w-5xl mx-auto bg-white border border-slate-200 rounded-lg p-6 shadow-sm",
        },
        body,
      ),
    ),
  );
};
