import van from "vanjs-core"
const { div, p, h1, button, span } = van.tags
import { xButton } from "./index"
const { svg, path } = van.tags("http://www.w3.org/2000/svg")
import * as vanX from "vanjs-ext"
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
    xButton({
      icon: svg(
        {
          xmlns: "http://www.w3.org/2000/svg",
          fill: "none",
          viewBox: "0 0 24 24",
          "stroke-width": "1.5",
          stroke: "currentColor",
          class: "size-6",
        },
        path({
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          d: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99",
        })
      ),
      onClick: () => {},
    })
  )
}

// Render the app
van.add(document.body, App())
