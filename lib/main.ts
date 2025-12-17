import van from "vanjs-core"
import { xlastValue } from "./lastValue"

const { div, button, main } = van.tags
const { path, svg } = van.tags("http://www.w3.org/2000/svg")

const infoIcon = svg(
  {
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: "1.5",
    stroke: "currentColor",
    class: "w-5 h-5",
  },
  path({
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z",
  })
)

const temperatureIcon = svg(
  {
    viewBox: "0 0 24 24",
    width: "24",
    height: "24",
    fill: "none",
    strokeWidth: "1.5",
    stroke: "currentColor",
    class: "w-5 h-5",
    xmlns: "http://www.w3.org/2000/svg",
  },

  path({
    d: "M5 11.9995C3.78555 12.9117 3 14.3641 3 15.9999C3 18.7613 5.23858 20.9999 8 20.9999C10.7614 20.9999 13 18.7613 13 15.9999C13 14.3641 12.2144 12.9117 11 11.9995",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  }),

  path({
    d: "M5 12V3H11V12",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  }),

  path({
    d: "M11 3L13 3",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  }),

  path({
    d: "M11 6L13 6",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  }),

  path({
    d: "M11 9H13",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  }),

  path({
    d: "M8 14C6.89543 14 6 14.8954 6 16C6 17.1046 6.89543 18 8 18C9.10457 18 10 17.1046 10 16C10 14.8954 9.10457 14 8 14ZM8 14V6",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  }),

  path({
    d: "M19 6V18M19 18L21.5 15.5M19 18L16.5 15.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  })
)

const pencilIcon = svg(
  {
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: "1.5",
    stroke: "currentColor",
    class: "w-5 h-5",
  },
  path({
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10",
  })
)

const test = xlastValue(
  {
    title: "Titulo de Temperatura",
    subtitle: "Subtitulo de temperatura",
    value: "42°C",
    posticon: pencilIcon,
    onClick: () => console.log("click"),
  },
  div(
    { class: "px-4 pb-3 flex flex-wrap justify-center gap-3" },
    button(
      {
        class:
          "rounded-md border border-stone-800 bg-neutral-900 text-white select-none cursor-pointer hover:bg-neutral-800 px-4 py-2",
        onclick: (e: MouseEvent) => {
          e.stopPropagation()
          console.log("View details")
        },
      },
      "Detalles"
    ),
    button(
      {
        class:
          "rounded-md border border-stone-800 bg-neutral-900 text-white select-none cursor-pointer hover:bg-neutral-800 px-4 py-2",
        onclick: (e: MouseEvent) => {
          e.stopPropagation()
          console.log("Edit value")
        },
      },
      "Editar"
    )
  )
)

const cardLeft = xlastValue(
  {
    title: "Temperatura interior",
    subtitle: "temperatura",
    value: "18°C",
    className: "bg-neutral-950 border-stone-700",
    hoverClass: "hover:bg-stone-900 hover:border-stone-600",
    titleClass: "px-4 pt-3 text-sm text-stone-300",
    subtitleClass: "px-4 pb-3 text-xs text-stone-400",
    valueClass:
      "ml-0 text-left font-semibold text-teal-300 " +
      "text-[clamp(1.75rem,5vw,2.5rem)] tabular-nums",
    onClick: () => console.log("Card izquierda"),
  },

  div(
    { class: "px-4 pb-3 flex justify-start" },
    button(
      {
        class:
          "px-4 py-2 rounded-md bg-teal-700 text-white text-sm font-medium " +
          "hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300",
        onclick: (e: MouseEvent) => {
          e.stopPropagation()
          console.log("Abrir detalles")
        },
      },
      "Ver detalles"
    )
  )
)

const cardCenteredWithImage = xlastValue(
  {
    title: "Temperatura exterior",
    subtitle: "Estación meteorológica",
    value: "18°C",
    className:"bg-cover bg-center border-stone-800",
    hoverClass: "hover:brightness-110",
    titleClass: "px-4 pt-3 text-sm text-white/90",
    subtitleClass: "px-4 pb-3 text-xs text-white/80",
    valueClass:"ml-0 text-center font-bold text-white drop-shadow-md text-[clamp(2rem,6vw,3rem)]",
    preicon: infoIcon,
    posticon: temperatureIcon,
    preiconClass:"shrink-0 flex items-center justify-center text-teal-300 drop-shadow-sm",
    posticonClass:"shrink-0 flex items-center justify-center text-teal-300 drop-shadow-sm",
    onClick: () => console.log("Card imagen"),
  }
)

van.add(
  document.body,
  main(
    {
      role: "main",
      class: "p-4 sm:p-6 md:p-8 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-3xl mx-auto",
    },
    div(
      { class: "flex flex-col gap-4" },
      test,
      cardLeft,
      cardCenteredWithImage
    )
  )
)
