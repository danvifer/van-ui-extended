import van from "vanjs-core"
import { xSelect, xOption } from "./xSelect"

const { div, main, span, h1, h2, h3 } = van.tags
const svgNS = van.tags("http://www.w3.org/2000/svg")

const Flag = (svgEl: any) =>
  div(
    {
      class:
        "inline-flex items-center justify-center w-5 h-5 rounded-sm overflow-hidden shrink-0",
    },
    svgEl
  )

const svgSpain = svgNS.svg(
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 2048 2048",
    class: "w-full h-full",
  },
  svgNS.path({
    style: "fill:#ffc501",
    d: "M255.999 793.25h1536v461.501h-1536z",
  }),
  svgNS.path({
    style: "fill:#c60b1e",
    d: "M255.999 1254.75h1536v230.75h-1536z",
  }),
  svgNS.path({
    style: "fill:#c60b1e",
    d: "M255.999 562.499h1536v230.75h-1536z",
  })
)

const svgBrazil = svgNS.svg(
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 2048 2048",
    class: "w-full h-full",
  },
  svgNS.path({ style: "fill:#009b3a", d: "M256 562.5h1536v923H256z" }),
  svgNS.path({
    style: "fill:#ffe52b",
    transform: "scale(1.76006 1) rotate(-45 1351.967 232.216)",
    d: "M0 0h495.002v495.002H0z",
  }),
  svgNS.path({
    style: "fill:#005eac",
    d: "M1247.07 1024c0 123.247-99.875 223.151-223.074 223.151-123.2 0-223.075-99.904-223.075-223.149 0-123.241 99.875-223.149 223.075-223.149 123.2 0 223.074 99.908 223.074 223.148z",
  }),
  svgNS.path({
    style: "fill:#fff",
    d: "m1246.04 1061.92-9.38 35.884S1086.995 937.792 805.25 970.992l12.804-37.293s249.245-41.232 427.987 128.221z",
  })
)

const svgGermany = svgNS.svg(
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 2048 2048",
    class: "w-full h-full",
  },
  svgNS.path({ style: "fill:#000", d: "M255.999 562.744h1536V870.33h-1536z" }),
  svgNS.path({ style: "fill:#d00", d: "M255.999 870.329h1536v307.586h-1536z" }),
  svgNS.path({
    style: "fill:#ffce00",
    d: "M255.999 1177.92h1536v307.586h-1536z",
  })
)

const arrowDownShortIcon = svgNS.svg(
  {
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: "1.5",
    stroke: "currentColor",
    class: "w-5 h-5",
  },
  svgNS.path({
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M15.75 17.25 12 21m0 0-3.75-3.75M12 21V3",
  })
)
1

const arrowUpShortIcon = svgNS.svg(
  {
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: "1.5",
    stroke: "currentColor",
    class: "w-5 h-5",
  },
  svgNS.path({
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18",
  })
)

const optionRow = (flagSvg: any, label: string) =>
  div({ class: "flex items-center gap-2" }, Flag(flagSvg), span(label))

const optSpain = xOption({
  value: "es",
  text: "España",
  data: optionRow(svgSpain, "España"),
})
const optBrazil = xOption({
  value: "br",
  text: "Brasil",
  data: optionRow(svgBrazil, "Brasil"),
})
const optGermany = xOption({
  value: "de",
  text: "Alemania",
  data: optionRow(svgGermany, "Alemania"),
})

const selectSimpleSearch = xSelect(
  { placeholder: "Escoja un pais", searchable: false, search_autofocus: true },
  xOption({ value: "es", text: "España", data: span("España") }),
  xOption({ value: "br", text: "Brasil", data: span("Brasil") }),
  xOption({ value: "ger", text: "Alemania", data: span("Alemania") })
)

const selectSimpleSearchIcons = xSelect(
  {
    searchable: true,
    placeholder: "Escoja un país",
    search_autofocus: false,
    multiple: false,
  },
  optSpain,
  optBrazil,
  optGermany
)

const selectDisabled = xSelect(
  {
    searchable: true,
    disabled: true,
    placeholder: "Escoja un país",
    search_autofocus: false,
    multiple: false,
  },
  optSpain,
  optBrazil,
  optGermany
)

const selectOtherIconsDownAndUp = xSelect(
  {
    searchable: true,
    iconCollapse: arrowUpShortIcon,
    iconDown: arrowDownShortIcon,
    placeholder: "Escoja un país",
    search_autofocus: true,
    multiple: false,
  },
  optSpain,
  optBrazil,
  optGermany
)

const selectMultipleSearchIcons = xSelect(
  {
    searchable: true,
    placeholder: "Escoja uno o varios países",
    search_autofocus: true,
    multiple: true,
  },
  optSpain,
  optBrazil,
  optGermany
)

const selectSearchMultiple = xSelect(
  {
    searchable: true,
    placeholder: "Seleccione uno o varios colores",
    search_autofocus: true,
    multiple: true,
  },
  xOption({ value: "es", text: "España", data: span("España") }),
  xOption({ value: "br", text: "Brasil", data: span("Brasil") }),
  xOption({ value: "ger", text: "Alemania", data: span("Alemania") })
)

const optDisabledStyled = xOption({
  value: "it",
  text: "Italia",
  disabled: true,
  data: span("Italia (no disponible)"),
})

const optSelectedStyled = xOption({
  value: "fr",
  text: "Francia",
  selected: true,
  data: span("Francia"),
})

const selectWithDisabledAndSelectedStyles = xSelect(
  { searchable: true, placeholder: "País con estilos", search_autofocus: true },
  optSpain,
  optBrazil,
  optGermany,
  optDisabledStyled,
  optSelectedStyled
)

const selectWithOnSelected = xSelect(
  {
    searchable: true,
    placeholder: "Selecciona un país (onSelected)",
    search_autofocus: true,
    onSelected: (value) => {
      alert(`Has seleccionado: ${value}`)
    },
    optionClassName: "bg-sky-700 text-white font-semibold",
    optionSelectedClass: "bg-sky-700 text-white font-semibold",
    optionDisabledClass: "bg-sky-700 text-white font-semibold",
  },
  optSpain,
  optBrazil,
  optGermany
)

const selectMultipleClareable = xSelect(
  {
    searchable: true,
    placeholder: "Escoja uno o varios países",
    search_autofocus: true,
    multiple: true,
    clearable: true,
  },
  optSpain,
  optBrazil,
  optGermany
)

const selectCompact = xSelect(
  {
    searchable: true,
    placeholder: "Compact",
    search_ph: "Buscar...",
    multiple: true,

    className:
      "relative w-full rounded border border-stone-700 bg-neutral-900 px-2 pr-9 py-1.5 text-xs " +
      "text-white placeholder:text-stone-500 outline-none " +
      "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900",

    checkboxInputClass:
      "appearance-none h-3.5 w-3.5 shrink-0 rounded border border-stone-500 bg-neutral-900 " +
      "grid place-content-center cursor-pointer " +
      "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 " +
      "checked:bg-emerald-400 checked:border-emerald-400 " +
      "before:content-[''] before:w-2 before:h-1 before:border-b-2 before:border-l-2 before:border-neutral-900 " +
      "before:-rotate-45 before:opacity-0 checked:before:opacity-100",
    optionClassName: "bg-sky-700 text-white font-semibold",
    optionSelectedClass: "bg-sky-700 text-white font-semibold",
    optionDisabledClass: "bg-sky-700 text-white font-semibold",
  },
  xOption({
    text: "Colorado",
    value: "co",
    data: "Colorado",
  }),
  xOption({
    text: "Florida",
    value: "fl",
    data: "Florida",
  })
)

van.add(
  document.body,
  main(
    h1(
      {
        class: "text-center text-2xl font-semibold mb-8 mt-4",
      },
      "Componente xSelect y xOption"
    ),
    div(
      {
        class:
          "w-full p-6 " +
          "max-w-6xl mx-auto " +
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-start",
      },

      div(
        { class: "space-y-2" },
        span("Sin búsqueda ni iconos"),
        selectSimpleSearch
      ),

      div(
        { class: "space-y-2" },
        span("Con búsqueda e iconos"),
        selectSimpleSearchIcons
      ),

      div({ class: "space-y-2" }, span("Select disabled"), selectDisabled),

      div(
        { class: "space-y-2" },
        span("Múltiple con búsqueda y sin iconos"),
        selectSearchMultiple
      ),

      div(
        { class: "space-y-2" },
        span("Múltiple con búsqueda e iconos"),
        selectMultipleSearchIcons
      ),

      div(
        { class: "space-y-2" },
        span("Iconos up y down modificados"),
        selectOtherIconsDownAndUp
      ),
      div(
        { class: "space-y-2" },
        span("Disabled_class y selectedClass"),
        selectWithDisabledAndSelectedStyles
      ),
      div({ class: "space-y-2" }, span("onSelected"), selectWithOnSelected),
      div({ class: "space-y-2" }, span("clareable"), selectMultipleClareable),
      div({ class: "space-y-2" }, span("selectHighContrast"), selectCompact)
    )
  )
)
