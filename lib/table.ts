import van from "vanjs-core"
import { State } from "vanjs-core"

const { table, thead, tbody, th, tr, td, input, button } = van.tags;

export type Column = {
         key: string;
         label: string | State<string>;
    };

    //TODO: Crear un elemento de acción que permita definir un botón con una acción y un título y un icono a la columna actions de la tabla
export type actionelement = {
    action: (item: any) => void
    title: string,
    label: string,
    icon?: string,
    condition?: (item: any) => void
}

export interface TableProps {
    readonly columns: Column[],
    readonly data: any[],
    //TODO: El multiselect deberia ser un objeto que permita definir qué acciones permiten la multiselección que se activarán desde un menú contextual en la parte superior de la tabla
    readonly addMultiSelect?: boolean,

    //TODO: Sustituir estos campos por un array de actionelement
    readonly addEditButton?: boolean,
    readonly addDelButton?: boolean,
    readonly editfunction?: (item: any) => void,
    readonly delfunction?: (item: any) => void,

    readonly condensed?: boolean,
    readonly tableClass?: string,
    readonly theadClass?: string,
    readonly tbodyClass?: string,
    readonly tbodyhoverClass?: string,
  }
  
  export const TableComponent = (
    {
        columns = [],
        data=[],
        addMultiSelect = false,
        addEditButton = false,
        addDelButton = false,
        editfunction = (id: any) => {alert(`TODO: Edit ${id}`)},
        delfunction = (id: any) => {alert(`TODO: Delete ${id}`)},
        condensed = false,
        tableClass = "table-auto text-pretty block overflow-auto border-collapse text-sm w-full",
        theadClass = "text-center bg-stone-900 border-t border-b border-stone-700 dark:border-stone-600 text-stone-400 dark:text-stone-200 uppercase",
        tbodyClass = "bg-stone-800",
        tbodyhoverClass = "hover:bg-stone-900",
    }: TableProps,
  ) => {
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
            tbody({ class: tbodyClass }
            , ...data.map(item =>
                tr({ class: tbodyhoverClass },
                addMultiSelect ? td(
                    { class: "text-center border-b border-stone-100 dark:border-stone-700 p-4" }
                    , input({ class: "accent-teal-600 w-5 h-5 text-teal-600 accent-teal-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-gray-800 focus:ring-2 ", type: "checkbox" })) : null,
                ...columns.map(col => td(
                    { class: "text-center border-b border-stone-100 dark:border-stone-700 p-4 text-stone-500 dark:text-stone-400" }
                    , typeof item[col.key as keyof any] === 'object' ? JSON.stringify(item[col.key as keyof any]) : item[col.key as keyof any])),
                addEditButton || addDelButton ? td(
                    { class: "text-center border-b border-stone-100 dark:border-stone-700 p-4 text-stone-500 dark:text-stone-400" },
                    addEditButton ? button({class:"cursor-pointer mr-2", onclick: () => editfunction(item)}, "✏️") : null,
                    addDelButton ? button({class:"cursor-pointer mr-2", onclick: () => delfunction(item) }, "🗑️") : null
                ) : null
                )
            )
            )
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