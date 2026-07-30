/**
 * Showcase colocated de Button — consumido por el catalogo autogenerado
 * (src/screens/design-system/catalog/index.generated.ts).
 *
 * Contrato: default export con shape { description, variants, props, snippet }.
 * El generator llena name/category/path/sourcePath desde el filesystem.
 */

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { Button } from "./Button";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "5 variantes semanticas x 3 tamanos. Loading, disabled y fullWidth. Icono a izquierda o derecha.",
  variants: [
    { label: "primary / md", render: () => <Button onPress={() => {}}>Guardar</Button> },
    { label: "secondary / md", render: () => <Button variant="secondary" onPress={() => {}}>Cancelar</Button> },
    { label: "ghost / md", render: () => <Button variant="ghost" onPress={() => {}}>Volver</Button> },
    { label: "danger / md", render: () => <Button variant="danger" onPress={() => {}}>Eliminar</Button> },
    { label: "success / md", render: () => <Button variant="success" onPress={() => {}}>Confirmar</Button> },
    { label: "sm", render: () => <Button size="sm" fullWidth={false} onPress={() => {}}>Chico</Button> },
    { label: "lg", render: () => <Button size="lg" fullWidth={false} onPress={() => {}}>Grande</Button> },
    { label: "loading", render: () => <Button loading onPress={() => {}}>Guardando...</Button> },
    { label: "disabled", render: () => <Button disabled onPress={() => {}}>No disponible</Button> },
  ],
  props: [
    { name: "children", type: "string", required: true, description: "Label visible del boton." },
    { name: "variant", type: "\"primary\" | \"secondary\" | \"ghost\" | \"danger\" | \"success\"", defaultValue: "\"primary\"" },
    { name: "size", type: "\"sm\" | \"md\" | \"lg\"", defaultValue: "\"md\"" },
    { name: "loading", type: "boolean", defaultValue: "false", description: "Muestra spinner y bloquea taps." },
    { name: "disabled", type: "boolean", defaultValue: "false" },
    { name: "fullWidth", type: "boolean", defaultValue: "true", description: "Si es true, ocupa todo el ancho del padre." },
    { name: "leftIcon", type: "ReactNode", description: "Icono a la izquierda del label." },
    { name: "rightIcon", type: "ReactNode", description: "Icono a la derecha del label." },
    { name: "onPress", type: "() => void", description: "Handler del tap." },
  ],
  snippet: `import { Button } from "@/components";

<Button variant="primary" onPress={handleSave}>
  Guardar cambios
</Button>`,
};

export default showcase;
