import van from "vanjs-core";
import { Select } from "./index";


const { div, p, h1, button } = van.tags;
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
  required: ["has_pet"],
  "x-jsf-order": ["has_pet", "pet_name", "pet_age", "dietary_needs"],
}

// App
const App = () => {
  const initialValues = { has_pet: "codigo", pet_name: "Simon", pet_age: 2 };
  const values = { has_pet: "yes", pet_name: "Pedro", pet_age: 5 };
  const isValid = van.state(false)
  const jsfConfig = {
    strictInputType: false,
    initialValues: initialValues,
    formValues: values,
    //valid: isValid
  };

  const handleOnChange = (e: Event) => {
    console.log(e)
    //e.preventDefault();
    const values = jsfConfig.formValues;
    //alert(`Submitted successfully: ${JSON.stringify(values, null, 2)}`);
    console.log("Submitted!", values);
  };
  const vals = vanX.reactive([{ value: "yes", label: "Yes" }, { value: "no", label: "No" }])
  return Select(
    {
      values: vals,
      modelValue: van.state(""),
      selected: "yes",
      multiple: false,
      selectClass: "bg-stone-800",
    },
  )
};

// Render the app
van.add(document.body, App());
