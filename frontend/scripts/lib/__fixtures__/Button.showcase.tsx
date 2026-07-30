import { Button } from "./Button";

export default {
  description: "Boton primario del design system.",
  variants: [
    { label: "primary", render: () => <Button>Guardar</Button> },
  ],
  props: [
    { name: "children", type: "string", required: true },
    { name: "variant", type: "\"primary\" | \"secondary\"", defaultValue: "\"primary\"" },
    { name: "loading", type: "boolean" },
    { name: "onPress", type: "() => void", required: false },
  ],
  snippet: `<Button>Guardar</Button>`,
};
