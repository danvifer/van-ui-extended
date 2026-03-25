import van, { ChildDom, State } from "vanjs-core"

const { table, thead, tbody, th, tr, td, input, button } = van.tags;

export type Column<T = Record<string, unknown>> = {
  key: keyof T | string
  label: string | State<string>
}

// Elemento de acción para definir un botón con una acción, título e icono
export type ActionElement<T = Record<string, unknown>> = {
  action: (item: T) => void
  title: string
  label: string
  icon?: string
  condition?: (item: T) => boolean
}

export interface TableProps<T = Record<string, unknown>> {
  readonly columns: Column<T>[]
  readonly data: T[]
  readonly addMultiSelect?: boolean
  readonly addEditButton?: boolean
  readonly addDelButton?: boolean
  readonly editfunction?: (item: T) => void
  readonly delfunction?: (item: T) => void
  readonly condensed?: boolean
  readonly tableClass?: string
  readonly theadClass?: string
  readonly tbodyClass?: string
  readonly tbodyhoverClass?: string
}

export const TableComponent = <T extends Record<string, unknown>>({
  columns = [],
  data = [],
  addMultiSelect = false,
  addEditButton = false,
  addDelButton = false,
  editfunction = (item: T) => {
    alert(`TODO: Edit ${JSON.stringify(item)}`)
  },
  delfunction = (item: T) => {
    alert(`TODO: Delete ${JSON.stringify(item)}`)
  },
  condensed = false,
  tableClass = "table-auto text-pretty block overflow-auto border-collapse text-sm w-full",
  theadClass = "text-center bg-stone-900 border-t border-b border-stone-700 dark:border-stone-600 text-stone-400 dark:text-stone-200 uppercase",
  tbodyClass = "bg-stone-800",
  tbodyhoverClass = "hover:bg-stone-900",
}: TableProps<T>) => {
    document.activeElement instanceof HTMLElement

    return () => {
        const tableElement = table({ id: "", class: tableClass },
            thead({ class: theadClass },
            tr({ class: "" },
                addMultiSelect ? th(
                { class: condensed ? "font-medium p-2" : "font-medium p-4" }
                , input({ class: "accent-teal-600 w-5 h-5 text-teal-600 accent-teal-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-gray-800 focus:ring-2 ", type: "checkbox" })) : null,
                ...columns.map(col => th(
                { class: condensed ? "font-medium p-2" : "font-medium p-4" }
                , col.label)),
                addEditButton || addDelButton ? td({ class: condensed ? "font-medium p-2" : "font-medium p-4" }
                , "") : null,
            )
            ),
          tbody(
            { class: tbodyClass },
            ...data.map((item) =>
              tr(
                { class: tbodyhoverClass },
                addMultiSelect
                  ? td(
                      {
                        class:
                          "text-center border-b border-stone-100 dark:border-stone-700 p-4",
                      },
                      input({
                        class:
                          "accent-teal-600 w-5 h-5 text-teal-600 accent-teal-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-gray-800 focus:ring-2 ",
                        type: "checkbox",
                      }),
                    )
                  : null,
                ...columns.map((col) => {
                  const val = item[col.key as keyof T]
                  return td(
                    {
                      class:
                        "text-center border-b border-stone-100 dark:border-stone-700 p-4 text-stone-500 dark:text-stone-400",
                    },
                    typeof val === "object" && val !== null
                      ? JSON.stringify(val)
                      : (String(val ?? "") as ChildDom),
                  )
                }),
                addEditButton || addDelButton
                  ? td(
                      {
                        class:
                          "text-center border-b border-stone-100 dark:border-stone-700 p-4 text-stone-500 dark:text-stone-400",
                      },
                      addEditButton
                        ? button(
                            {
                              class: "cursor-pointer mr-2",
                              onclick: () => editfunction(item),
                            },
                            "✏️",
                          )
                        : null,
                      addDelButton
                        ? button(
                            {
                              class: "cursor-pointer mr-2",
                              onclick: () => delfunction(item),
                            },
                            "🗑️",
                          )
                        : null,
                    )
                  : null,
              ),
            ),
          ),
        );
        return tableElement;
    }
  }


//Example
// const myColumns: Column[] = [
//     { key: "mail", label: i18n.val.t("mail") },
//     { key: "firstName", label: i18n.val.t("firstName") },
//     { key: "lastName", label: i18n.val.t("lastName") },
//     { key: "role", label: i18n.val.t("role") },
//   ];

//   myData = {} 
//   or 
//   myData = await myApi.getInstance().data.getAll();

// TableComponent({columns:myColumns, data:myData, addEditButton:true})