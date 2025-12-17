import van from "vanjs-core"
const { div, p, h1, button, span } = van.tags
import * as vanX from "vanjs-ext"
import { GridStack } from "gridstack"
let grid: GridStack = {} as GridStack
const jsonSchemaDemo = {
  type: "object",
  additionalProperties: false,
  properties: {
    has_pet: {
      title: "Has Pet",
      type: "string",
      description: "Do you have a pet?",
      /*  oneOf: [
         { title: "Yes", const: "yes" },
         { title: "No", const: "no" },
       ], */
      "x-jsf-presentation": { inputType: "code", codemirrorType: "typescript" },
      //type: "string",
    },
    /* pet_name: {
      title: "Pet's name",
      description: "What's your pet's name?",
      "x-jsf-presentation": { inputType: "text" },
      type: "string",
    },
    pet_age: {
      title: "Pet's age",
      description:
        "What's your pet's age? With more than 5 years, we need to know more about your pet.",
      "x-jsf-presentation": { inputType: "number" },
      type: "number",
      default: 1,
    },
    dietary_needs: {
      title: "Dietary needs",
      description: "What are your pet's dietary needs?",
      "x-jsf-presentation": { inputType: "textarea", rows: 15, columns: 50 },
      type: "string",
    }, */
  },
  required: ["has_pet"],
  "x-jsf-order": ["has_pet", "pet_name", "pet_age", "dietary_needs"],
}

// App
const App = () => {
  const edit = van.state(false)
  const initialValues = { has_pet: "codigo", pet_name: "Simon", pet_age: 2 }
  const values = { has_pet: "yes", pet_name: "Pedro", pet_age: 5 }
  const isValid = van.state(false)
  const jsfConfig = {
    strictInputType: false,
    initialValues: initialValues,
    formValues: values,
    //valid: isValid
  }

  const handleOnChange = (e: Event) => {
    console.log(e)
    //e.preventDefault();
    const values = jsfConfig.formValues
    //alert(`Submitted successfully: ${JSON.stringify(values, null, 2)}`);
    console.log("Submitted!", values)
  }
  const vals = vanX.reactive([
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ])

  /* const button = {
    label: "Click Me",
    class:
      "og ogiconfilter path1 uppercase cursor-pointer rounded-md px-1 mx-2 py-2 text-white hover:bg-gray-600 focus:outline-none bg-gray-800",
    func: () => {
      console.log("Button in Grid clicked!")
    },
  } */

  console.log("Custom Element:")

  return div(
    () =>
      edit.val
        ? button(
            {
              class:
                "og ogiconfilter path1 uppercase cursor-pointer rounded-md px-1 mx-2 py-2 text-white hover:bg-gray-600 focus:outline-none bg-gray-800",
              onclick: () => {
                grid.enableMove(false)
                grid.enableResize(false)
                edit.val = false
                const widgets = grid.save() as any
                grid.removeAll()
                grid.load(widgets)
                console.log(grid.save())
              },
            },
            "Save"
          )
        : button(
            {
              class:
                "og ogiconfilter path1 uppercase cursor-pointer rounded-md px-1 mx-2 py-2 text-white hover:bg-gray-600 focus:outline-none bg-gray-800",
              onclick: () => {
                grid.enableMove(true)
                grid.enableResize(true)
                edit.val = true
              },
            },
            "Edit"
          ),
    div({ class: "grid-stack" })
  )
}

// Render the app
van.add(document.body, App())

const customElement = `tags.div(
  { onclick: () => console.log("Click") },
  tags.p("This is a custom element inside the grid.")
)`

console.log("Custom Element:", customElement)

/* grid.enableMove(false)
grid.enableResize(false) */
