import van, { ChildDom } from "vanjs-core"

const { div, input, ul, li, button, span, label } = van.tags
const { path, svg } = van.tags("http://www.w3.org/2000/svg")

const chevronDownIcon = svg(
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
    d: "m19.5 8.25-7.5 7.5-7.5-7.5",
  })
)

const chevronUpIcon = svg(
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
    d: "m4.5 15.75 7.5-7.5 7.5 7.5",
  })
)

const xMarkIcon = svg(
  {
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: "1.8",
    stroke: "currentColor",
    class: "w-4 h-4",
  },
  path({
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M6 18 18 6M6 6l12 12",
  })
)

export interface XSelectProps {
  readonly searchable?: boolean
  readonly placeholder?: string
  readonly search_ph?: string
  readonly search_autofocus?: boolean
  readonly iconDown?: string | ChildDom
  readonly iconDownClass?: string
  readonly iconCollapse?: string | ChildDom
  readonly iconCollapseClass?: string
  readonly disabled?: boolean
  readonly onSelected?: (value: any) => void
  readonly multiple?: boolean
  readonly clearable?: boolean
  readonly className?: string
  readonly listClass?: string
  readonly optionClass?: string
  readonly optionActiveClass?: string
  readonly noResultsClass?: string
  readonly iconButtonClass?: string
  readonly clearButtonClass?: string
  readonly checkboxLabelClass?: string
  readonly checkboxInputClass?: string
  readonly optionClassName?: string
  readonly optionDisabledClass?: string
  readonly optionSelectedClass?: string
}

export interface XOptionProps {
  readonly disabled?: boolean
  readonly selected?: boolean
  readonly data: ChildDom
  readonly value?: any
  readonly text?: string
}

export const xOption = ({
  disabled = false,
  selected = false,
  data,
  value,
  text,
}: XOptionProps) => ({
  __xOption: true as const,
  props: {
    disabled,
    selected,
    data,
    value,
    text,
  } satisfies XOptionProps,
})

const asChildDom = (value: string | ChildDom): ChildDom => {
  if (typeof value === "string") return span(value)
  return value instanceof Node ? (value.cloneNode(true) as ChildDom) : value
}

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()

export const xSelect = (
  {
    searchable = false,
    placeholder = "",
    search_ph = "Search...",
    search_autofocus = false,

    iconDown = chevronDownIcon,
    iconDownClass = "",
    iconCollapse = chevronUpIcon,
    iconCollapseClass = "",

    disabled = false,
    onSelected,
    multiple = false,
    clearable = false,

    className = "relative w-full rounded-md border border-stone-800 bg-neutral-900 px-3 pr-10 py-2 text-sm " +
      "text-white placeholder:text-stone-500 caret-white shadow-sm outline-none " +
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-stone-600 focus-visible:ring-offset-neutral-900 " +
      "disabled:cursor-not-allowed disabled:opacity-50",

    listClass = "absolute z-20 mt-2 w-full overflow-auto max-h-60 rounded-md border border-stone-800 bg-neutral-900 shadow-lg",

    optionClass = "",
    optionActiveClass = "bg-neutral-800",
    noResultsClass = "px-3 py-2 text-sm text-stone-400",

    iconButtonClass = "absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded p-1 " +
      "text-stone-300 hover:bg-neutral-800 hover:text-white " +
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-stone-600 focus-visible:ring-offset-neutral-900",

    clearButtonClass = "absolute right-8 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded p-1 " +
      "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 " +
      "text-stone-300 hover:bg-neutral-800 hover:text-white " +
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-stone-600 focus-visible:ring-offset-neutral-900",

    checkboxLabelClass = "flex items-center gap-3 w-full cursor-pointer select-none",

    checkboxInputClass = "appearance-none h-4 w-4 shrink-0 rounded border border-stone-500 bg-neutral-900 " +
      "grid place-content-center cursor-pointer " +
      "focus-visible:ring-2 focus-visible:ring-stone-600 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 " +
      "checked:bg-neutral-100 checked:border-neutral-100 " +
      "before:content-[''] before:w-2 before:h-1 before:border-b-2 before:border-l-2 before:border-neutral-900 " +
      "before:-rotate-45 before:opacity-0 checked:before:opacity-100 " +
      "disabled:opacity-50 disabled:cursor-not-allowed",
    optionClassName = "w-full text-left px-3 py-2 text-sm text-white hover:bg-neutral-800 focus:outline-none",
    optionDisabledClass = "opacity-50 cursor-not-allowed",
    optionSelectedClass = "",
  }: XSelectProps,
  ...options: Array<ReturnType<typeof xOption>>
) => {
  const optionItems = options.map((o) => o.props)

  const selectedIndexes = van.state<number[]>([])
  const defaultSelectedIndexes = optionItems
    .map((opt, idx) => (opt.selected ? idx : -1))
    .filter((idx) => idx >= 0)

  if (!selectedIndexes.val.length && defaultSelectedIndexes.length) {
    selectedIndexes.val = defaultSelectedIndexes
  }

  const isDropdownOpen = van.state(false)
  const searchQuery = van.state("")
  const activeFilteredIndex = van.state<number>(-1)

  const listboxId = `xsel-list-${Math.random().toString(36).slice(2)}`
  const inputId = `xsel-in-${Math.random().toString(36).slice(2)}`
  const optionDomId = (realIndex: number) => `${listboxId}-opt-${realIndex}`
  const checkboxDomId = (realIndex: number) => `${listboxId}-cb-${realIndex}`

  const isIndexSelected = (index: number) => selectedIndexes.val.includes(index)

  const getOptionText = (index: number) => {
    const opt = optionItems[index]
    if (opt.text) return opt.text
    if (typeof opt.data === "string") return opt.data
    return ""
  }

  const getSingleSelectedLabel = () =>
    selectedIndexes.val.length ? getOptionText(selectedIndexes.val[0]) : ""

  const getSelectedSummary = () =>
    selectedIndexes.val.map(getOptionText).filter(Boolean).join(", ")

  const getMultiPrefix = () => {
    const summary = getSelectedSummary()
    return summary ? `${summary} ` : ""
  }

  const getFilteredRealIndexes = () => {
    const query = normalizeText(searchQuery.val)
    const baseIndexes = optionItems.map((_, i) => i)
    if (!searchable || !query) return baseIndexes
    return baseIndexes.filter((i) =>
      normalizeText(getOptionText(i)).includes(query)
    )
  }

  const openDropdown = () => {
    if (disabled) return
    isDropdownOpen.val = true
    const filtered = getFilteredRealIndexes()
    activeFilteredIndex.val = filtered.length ? 0 : -1

    if (searchable && search_autofocus) {
      queueMicrotask(() => {
        inputEl.focus()
        if (!multiple) inputEl.select()
        else {
          const len = inputEl.value.length
          inputEl.setSelectionRange(len, len)
        }
      })
    }
  }

  const closeDropdown = () => {
    isDropdownOpen.val = false
    //searchQuery.val = ""
    activeFilteredIndex.val = -1
    inputEl.value = multiple ? getSelectedSummary() : getSingleSelectedLabel()
  }

  const scrollActiveOptionIntoView = () => {
    const filtered = getFilteredRealIndexes()
    if (
      activeFilteredIndex.val < 0 ||
      activeFilteredIndex.val >= filtered.length
    )
      return
    const realIndex = filtered[activeFilteredIndex.val]
    const optionEl = listboxEl.querySelector<HTMLElement>(
      `#${optionDomId(realIndex)}`
    )
    optionEl?.scrollIntoView({ block: "nearest" })
  }

  const moveActive = (delta: number) => {
    const filtered = getFilteredRealIndexes()
    if (!filtered.length) {
      activeFilteredIndex.val = -1
      return
    }
    const next =
      activeFilteredIndex.val < 0
        ? 0
        : (activeFilteredIndex.val + delta + filtered.length) % filtered.length
    activeFilteredIndex.val = next
    queueMicrotask(scrollActiveOptionIntoView)
  }

  const clearSelection = () => {
    selectedIndexes.val = []
    searchQuery.val = ""
    inputEl.value = ""
    queueMicrotask(() => inputEl.focus())
  }

  const removeLastSelected = () => {
    if (!selectedIndexes.val.length) return
    selectedIndexes.val = selectedIndexes.val.slice(0, -1)

    if (isDropdownOpen.val && searchable && multiple) {
      queueMicrotask(() => {
        const len = inputEl.value.length
        inputEl.setSelectionRange(len, len)
      })
    }
  }

  const toggleByRealIndex = (realIndex: number) => {
    if (optionItems[realIndex].disabled) return

    const value =
      optionItems[realIndex].value ??
      optionItems[realIndex].text ??
      optionItems[realIndex].data
    onSelected?.(value)
    if (searchable) {
      searchQuery.val = optionItems[realIndex].text || ""
    }
    if (!multiple) {
      selectedIndexes.val = [realIndex]
      inputEl.value = getOptionText(realIndex)
      closeDropdown()
      return
    }

    if (isIndexSelected(realIndex)) {
      selectedIndexes.val = selectedIndexes.val.filter((i) => i !== realIndex)
    } else {
      selectedIndexes.val = [...selectedIndexes.val, realIndex]
    }

    if (searchable) {
      searchQuery.val = ""
      queueMicrotask(() => {
        inputEl.focus()
        const len = inputEl.value.length
        inputEl.setSelectionRange(len, len)
      })
    } else {
      inputEl.value = getSelectedSummary()
      queueMicrotask(() => inputEl.focus())
    }
  }

  const selectActiveOption = () => {
    const filtered = getFilteredRealIndexes()
    if (!filtered.length) return
    const idx = activeFilteredIndex.val < 0 ? 0 : activeFilteredIndex.val
    toggleByRealIndex(filtered[idx])
  }

  const listboxEl = ul({
    id: listboxId,
    role: "listbox",
    "aria-label": placeholder || "Select options",
    ...(multiple ? { "aria-multiselectable": "true" } : {}),
    tabIndex: -1,
    class: listClass,
  })

  const renderListbox = () => {
    const filtered = getFilteredRealIndexes()

    if (filtered.length === 0) activeFilteredIndex.val = -1
    else if (activeFilteredIndex.val >= filtered.length)
      activeFilteredIndex.val = filtered.length - 1
    else if (activeFilteredIndex.val === -1) activeFilteredIndex.val = 0

    if (!filtered.length) {
      listboxEl.replaceChildren(li({ class: noResultsClass }, "No results"))
      return
    }

    listboxEl.replaceChildren(
      ...filtered.map((realIndex, filteredIndex) => {
        const opt = optionItems[realIndex]
        const disabledOption = !!opt.disabled
        const activeOption = filteredIndex === activeFilteredIndex.val
        const selectedOption = isIndexSelected(realIndex)

        const activeStyle = activeOption ? optionActiveClass : ""
        const selectedStyle = selectedOption ? optionSelectedClass : ""
        const disabledStyle = disabledOption ? optionDisabledClass : ""

        const optionClassFinal = [
          "cursor-pointer",
          optionClassName,
          activeStyle,
          selectedStyle,
          disabledStyle,
        ]
          .join(" ")
          .trim()

        if (!multiple) {
          return li(
            {
              id: optionDomId(realIndex),
              role: "option",
              "aria-disabled": disabledOption ? "true" : "false",
              "aria-selected": selectedOption ? "true" : "false",
              class: optionClassFinal,
              onclick: () => toggleByRealIndex(realIndex),
              onmouseenter: () => (activeFilteredIndex.val = filteredIndex),
            },
            opt.data
          )
        }

        const id = checkboxDomId(realIndex)

        const cb = input({
          id,
          type: "checkbox",
          class: checkboxInputClass,
          checked: selectedOption,
          disabled: disabledOption,
          tabIndex: -1,
          onchange: (e: Event) => {
            e.stopPropagation()
            toggleByRealIndex(realIndex)
          },
        })

        const content = label(
          { class: checkboxLabelClass, for: id },
          cb,
          opt.data
        )

        return li(
          {
            id: optionDomId(realIndex),
            role: "option",
            "aria-disabled": disabledOption ? "true" : "false",
            "aria-selected": selectedOption ? "true" : "false",
            class: optionClassFinal,
            onmouseenter: () => (activeFilteredIndex.val = filteredIndex),
            onclick: (e: MouseEvent) => {
              const t = e.target
              if (t instanceof HTMLElement && t.closest("label")) return
              toggleByRealIndex(realIndex)
            },
          },
          content
        )
      })
    )
  }

  const toggleButtonEl = button(
    {
      type: "button",
      class: iconButtonClass,
      onclick: (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        isDropdownOpen.val ? closeDropdown() : openDropdown()
      },
      "aria-label": "Toggle menu",
    },
    span({ class: iconDownClass }, asChildDom(iconDown)),
    span({ class: iconCollapseClass }, asChildDom(iconCollapse))
  )

  const clearButtonEl =
    multiple && clearable
      ? button(
          {
            type: "button",
            class: clearButtonClass,
            onclick: (e: MouseEvent) => {
              e.preventDefault()
              e.stopPropagation()
              clearSelection()
            },
            "aria-label": "Clear selection",
          },
          xMarkIcon
        )
      : null
  const readOnly = !searchable
    ? "read-only:cursor-pointer read-only:caret-transparent "
    : ""
  const inputEl = input({
    id: inputId,
    type: "text",
    disabled,
    class: readOnly + className,
    placeholder: searchable ? search_ph : placeholder,
    value: multiple ? getSelectedSummary() : getSingleSelectedLabel(),
    readOnly: !searchable,
    role: "combobox",
    "aria-controls": listboxId,
    "aria-autocomplete": searchable ? "list" : "none",
    "aria-label": placeholder || "Select",
    title: placeholder || "Select",

    onfocus: () => openDropdown(),
    onclick: () => openDropdown(),

    onkeydown: (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDropdown()
        e.preventDefault()
        return
      }

      if (e.key === "ArrowDown") {
        if (!isDropdownOpen.val) openDropdown()
        moveActive(+1)
        e.preventDefault()
        return
      }

      if (e.key === "ArrowUp") {
        if (!isDropdownOpen.val) openDropdown()
        moveActive(-1)
        e.preventDefault()
        return
      }

      if (e.key === "Enter" || (e.key === " " && !searchable)) {
        if (!isDropdownOpen.val) openDropdown()
        else selectActiveOption()
        e.preventDefault()
        return
      }

      if (multiple && e.key === "Backspace") {
        const el = e.target as HTMLInputElement
        const v = el.value ?? ""

        const hasQuery = searchable && searchQuery.val.trim().length > 0
        if (hasQuery) return

        const start = el.selectionStart ?? 0
        const end = el.selectionEnd ?? 0
        const hasSelection = start !== end
        const caretAtEnd = start === v.length && end === v.length

        if (!hasSelection && caretAtEnd && selectedIndexes.val.length > 0) {
          removeLastSelected()
          e.preventDefault()
          return
        }
      }
    },

    oninput: (e: InputEvent) => {
      if (!searchable) return
      const full = (e.target as HTMLInputElement).value

      if (multiple && isDropdownOpen.val) {
        const prefix = getMultiPrefix()
        searchQuery.val = full.startsWith(prefix)
          ? full.slice(prefix.length)
          : full
      } else {
        searchQuery.val = full
      }

      isDropdownOpen.val = true
      activeFilteredIndex.val = 0
      renderListbox()
    },
  }) as HTMLInputElement

  const rootEl = div(
    { class: "relative inline-block w-full" },
    div({ class: "relative" }, inputEl, clearButtonEl, toggleButtonEl),
    listboxEl
  )

  const syncUi = () => {
    listboxEl.style.display = isDropdownOpen.val ? "block" : "none"

    const down = toggleButtonEl.children[0] as HTMLElement
    const up = toggleButtonEl.children[1] as HTMLElement
    down.style.display = isDropdownOpen.val ? "none" : "block"
    up.style.display = isDropdownOpen.val ? "block" : "none"

    if (clearButtonEl) {
      const hasSelection = selectedIndexes.val.length > 0
      ;(clearButtonEl as HTMLButtonElement).style.display = hasSelection
        ? "inline-flex"
        : "none"
    }

    if (!isDropdownOpen.val) {
      inputEl.value = multiple ? getSelectedSummary() : getSingleSelectedLabel()
    } else {
      if (searchable) {
        if (multiple) inputEl.value = getMultiPrefix() + searchQuery.val
        else inputEl.value = searchQuery.val
      } else {
        inputEl.value = multiple
          ? getSelectedSummary()
          : getSingleSelectedLabel()
      }
    }

    inputEl.setAttribute("aria-expanded", isDropdownOpen.val ? "true" : "false")

    const filtered = getFilteredRealIndexes()
    const activeId =
      activeFilteredIndex.val >= 0 && activeFilteredIndex.val < filtered.length
        ? optionDomId(filtered[activeFilteredIndex.val])
        : ""
    inputEl.setAttribute("aria-activedescendant", activeId)

    if (isDropdownOpen.val && searchable && multiple) {
      queueMicrotask(() => {
        const len = inputEl.value.length
        inputEl.setSelectionRange(len, len)
      })
    }
  }

  van.derive(() => {
    void isDropdownOpen.val
    void searchQuery.val
    void selectedIndexes.val
    void activeFilteredIndex.val
    syncUi()
    renderListbox()
    return 0
  })

  document.addEventListener(
    "pointerdown",
    (e) => {
      if (!isDropdownOpen.val) return
      const targetNode = e.target
      if (!(targetNode instanceof Node)) return
      if (rootEl.contains(targetNode)) return
      closeDropdown()
    },
    true
  )

  renderListbox()
  syncUi()

  return rootEl
}
