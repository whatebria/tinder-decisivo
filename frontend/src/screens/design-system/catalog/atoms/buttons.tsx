/**
 * Catalogo de atomos: BOTONES y controles interactivos.
 *
 * Incluye: Button, IconButton, Link, ActionButton, ThemeToggle, Toggle,
 * BookmarkButton.
 */

import React from "react";
import { View } from "react-native";

import {
  ActionButton,
  BookmarkButton,
  Button,
  Icon,
  IconButton,
  Link,
  ThemeToggle,
  Toggle,
  useActionColors,
} from "../../../../components";
import type { CatalogEntry } from "../../showcase/types";

// Wrapper para usar el hook useActionColors dentro de un render function
function ActionButtonDemo({ variant }: { variant: "like" | "dislike" | "undo" | "info" }) {
  const colors = useActionColors();
  const iconName = variant === "like" ? "heart" : variant === "dislike" ? "close" : variant === "undo" ? "undo" : "info";
  return (
    <ActionButton variant={variant} accessibilityLabel={variant}>
      <Icon name={iconName} size={variant === "like" || variant === "dislike" ? 28 : 22} color={colors[variant]} />
    </ActionButton>
  );
}

function ToggleDemo() {
  const [v, setV] = React.useState(true);
  return <Toggle value={v} onPress={() => setV(!v)} accessibilityLabel="Toggle demo" />;
}

function BookmarkDemo({ initial }: { initial: boolean }) {
  const [saved, setSaved] = React.useState(initial);
  return <BookmarkButton saved={saved} onPress={() => setSaved(!saved)} />;
}

export const buttonsCatalog: CatalogEntry[] = [
  {
    name: "Button",
    path: "atoms/Button",
    category: "atoms",
    description: "5 variantes semanticas x 3 tamanos. Loading, disabled y fullWidth. Icono a izquierda o derecha.",
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
    snippet: `import { Button } from "../components";

<Button variant="primary" onPress={handleSave}>
  Guardar cambios
</Button>`,
  },
  {
    name: "IconButton",
    path: "atoms/IconButton",
    category: "atoms",
    description: "Boton circular solo con icono. 3 variantes (soft, ghost, solid) y 3 tamanos. accessibilityLabel obligatorio.",
    variants: [
      {
        label: "soft / md",
        render: () => (
          <IconButton variant="soft" accessibilityLabel="Buscar">
            <Icon name="search" size={20} />
          </IconButton>
        ),
      },
      {
        label: "ghost / md",
        render: () => (
          <IconButton variant="ghost" accessibilityLabel="Cerrar">
            <Icon name="close" size={20} />
          </IconButton>
        ),
      },
      {
        label: "solid / md",
        render: () => (
          <IconButton variant="solid" accessibilityLabel="Agregar">
            <Icon name="plus" size={20} color="#FFF" />
          </IconButton>
        ),
      },
      {
        label: "sm",
        render: () => (
          <IconButton size="sm" accessibilityLabel="Info">
            <Icon name="info" size={16} />
          </IconButton>
        ),
      },
      {
        label: "lg",
        render: () => (
          <IconButton size="lg" accessibilityLabel="Notificaciones">
            <Icon name="bell" size={24} />
          </IconButton>
        ),
      },
    ],
    props: [
      { name: "children", type: "ReactNode", required: true, description: "Icono a renderizar (ej. <Icon />)." },
      { name: "accessibilityLabel", type: "string", required: true, description: "Texto para SR (obligatorio: sin label seria intocable a11y)." },
      { name: "variant", type: "\"soft\" | \"ghost\" | \"solid\"", defaultValue: "\"soft\"" },
      { name: "size", type: "\"sm\" | \"md\" | \"lg\"", defaultValue: "\"md\"" },
      { name: "onPress", type: "() => void" },
      { name: "disabled", type: "boolean" },
    ],
    snippet: `import { IconButton, Icon } from "../components";

<IconButton variant="soft" accessibilityLabel="Buscar" onPress={openSearch}>
  <Icon name="search" size={20} />
</IconButton>`,
  },
  {
    name: "Link",
    path: "atoms/Link",
    category: "atoms",
    description: "Texto interactivo estilo hyperlink. Modo inline (default) para \"aprende mas\" o block para acciones tipo \"Volver\".",
    variants: [
      { label: "inline", render: () => <Link onPress={() => {}}>Aprende mas</Link> },
      { label: "inline + underline", render: () => <Link underline onPress={() => {}}>Terminos y condiciones</Link> },
      { label: "block", render: () => <Link block onPress={() => {}}>Ir a mi perfil</Link> },
      { label: "color custom", render: () => <Link color="#B85C5C" onPress={() => {}}>Eliminar cuenta</Link> },
      { label: "disabled", render: () => <Link disabled onPress={() => {}}>No disponible</Link> },
    ],
    props: [
      { name: "children", type: "string", required: true },
      { name: "underline", type: "boolean", defaultValue: "false" },
      { name: "block", type: "boolean", defaultValue: "false", description: "Tap-area grande, stretch, texto centrado. Ideal para acciones dentro de un menu." },
      { name: "color", type: "string", description: "Color custom. Default: primary del tema." },
      { name: "onPress", type: "() => void" },
      { name: "disabled", type: "boolean" },
    ],
    snippet: `import { Link } from "../components";

<Link onPress={() => navigate("Terminos")}>
  Ver terminos completos
</Link>`,
  },
  {
    name: "ActionButton",
    path: "atoms/ActionButton",
    category: "atoms",
    description: "Circulo grande tipo Tinder para acciones swipe. 4 variantes (like, dislike, undo, info). Usa useActionColors() para el color del icono.",
    variants: [
      { label: "like (64px)", render: () => <ActionButtonDemo variant="like" /> },
      { label: "dislike (64px)", render: () => <ActionButtonDemo variant="dislike" /> },
      { label: "undo (48px)", render: () => <ActionButtonDemo variant="undo" /> },
      { label: "info (48px)", render: () => <ActionButtonDemo variant="info" /> },
    ],
    props: [
      { name: "children", type: "ReactNode", required: true, description: "Icono a renderizar." },
      { name: "variant", type: "\"like\" | \"dislike\" | \"undo\" | \"info\"", required: true },
      { name: "accessibilityLabel", type: "string", required: true },
      { name: "onPress", type: "() => void" },
      { name: "disabled", type: "boolean" },
    ],
    snippet: `import { ActionButton, Icon, useActionColors } from "../components";

function LikeButton() {
  const colors = useActionColors();
  return (
    <ActionButton variant="like" accessibilityLabel="Me gusta" onPress={onLike}>
      <Icon name="heart" size={28} color={colors.like} />
    </ActionButton>
  );
}`,
  },
  {
    name: "ThemeToggle",
    path: "atoms/ThemeToggle",
    category: "atoms",
    description: "Segmented control claro/oscuro/sistema. Persistente. Reactivo al tema actual.",
    variants: [{ label: "default", render: () => <ThemeToggle /> }],
    props: [
      { name: "hideLabel", type: "boolean", defaultValue: "false", description: "Reservado: oculta el label superior (aun no implementado en el render actual)." },
    ],
    snippet: `import { ThemeToggle } from "../components";

<ThemeToggle />`,
  },
  {
    name: "Toggle",
    path: "atoms/Toggle",
    category: "atoms",
    description: "Switch on/off tipo pill. Alternativa a Checkbox para preferencias. accessibilityLabel obligatorio.",
    variants: [
      { label: "off", render: () => <Toggle value={false} onPress={() => {}} accessibilityLabel="Toggle off" /> },
      { label: "on", render: () => <Toggle value={true} onPress={() => {}} accessibilityLabel="Toggle on" /> },
      { label: "interactive", render: () => <ToggleDemo /> },
      { label: "disabled", render: () => <Toggle value={true} disabled onPress={() => {}} accessibilityLabel="Toggle disabled" /> },
    ],
    props: [
      { name: "value", type: "boolean", required: true },
      { name: "accessibilityLabel", type: "string", required: true },
      { name: "onPress", type: "() => void" },
      { name: "disabled", type: "boolean" },
    ],
    snippet: `import { Toggle } from "../components";

<Toggle
  value={notifsEnabled}
  onPress={() => setNotifsEnabled(!notifsEnabled)}
  accessibilityLabel="Activar notificaciones"
/>`,
  },
  {
    name: "BookmarkButton",
    path: "atoms/BookmarkButton",
    category: "atoms",
    description: "Chip para guardar/quitar de guardados. Idempotente (label cambia Guardar <-> Guardado). Sin iconos SVG.",
    variants: [
      { label: "unsaved", render: () => <BookmarkDemo initial={false} /> },
      { label: "saved", render: () => <BookmarkDemo initial={true} /> },
      { label: "loading", render: () => <BookmarkButton saved={false} loading onPress={() => {}} /> },
    ],
    props: [
      { name: "saved", type: "boolean", required: true },
      { name: "onPress", type: "() => void", required: true },
      { name: "loading", type: "boolean", defaultValue: "false" },
      { name: "accessibilityLabel", type: "string", description: "Default: 'Guardado' o 'Guardar' segun estado." },
    ],
    snippet: `import { BookmarkButton } from "../components";

<BookmarkButton
  saved={isBookmarked}
  onPress={toggleBookmark}
/>`,
  },
];
