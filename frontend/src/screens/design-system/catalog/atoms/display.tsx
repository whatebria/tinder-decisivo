/**
 * Catalogo de atomos: DISPLAY y elementos de dominio.
 *
 * Incluye: Chip, StatBlock, Avatar, Timeline, Tabs, Icon, RadarChart,
 * ElectionCard, ElectionCardAdd, TabBarItem.
 */

import React from "react";
import { View } from "react-native";

import {
  Avatar,
  Chip,
  ElectionCard,
  ElectionCardAdd,
  Icon,
  type IconName,
  PageDots,
  RadarChart,
  StatBlock,
  TabBarItem,
  Tabs,
  Timeline,
} from "../../../../components";
import type { CatalogEntry } from "../../showcase/types";

function ChipDemo() {
  const [selected, setSelected] = React.useState("todos");
  return (
    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
      {["todos", "positivos", "neutrales"].map((k) => (
        <Chip key={k} active={selected === k} onPress={() => setSelected(k)}>
          {k}
        </Chip>
      ))}
    </View>
  );
}

function TabsDemo() {
  const [active, setActive] = React.useState<"all" | "read" | "saved">("all");
  return (
    <Tabs
      value={active}
      onChange={(v) => setActive(v as any)}
      items={[
        { value: "all", label: "Todas", count: 128 },
        { value: "read", label: "Leidas", count: 44 },
        { value: "saved", label: "Guardadas", count: 12 },
      ]}
    />
  );
}

const ICON_NAMES: IconName[] = [
  "chevron-right", "chevron-left", "check", "close", "info", "alert", "clock",
  "user", "heart", "undo", "search", "plus", "mail", "link", "bell", "gear",
  "news", "columns", "home", "bookmark", "whatsapp", "twitter",
];

const RADAR_DATA = {
  ECONOMIA: 85,
  SOCIEDAD: 72,
  AMBIENTE: 90,
  SEGURIDAD: 45,
  DDHH: 78,
  INTERNACIONAL: 60,
  INSTITUCIONAL: 55,
  OTRO: 40,
};

export const displayCatalog: CatalogEntry[] = [
  {
    name: "Chip",
    path: "atoms/Chip",
    category: "atoms",
    description: "Pill grande para filtros o tags. Pressable opcional. accessibilityState=selected cuando active.",
    variants: [
      { label: "default (no interactivo)", render: () => <Chip>Educacion</Chip> },
      { label: "interactive", render: () => <ChipDemo /> },
      { label: "active", render: () => <Chip active onPress={() => {}}>Seleccionado</Chip> },
      { label: "inactive", render: () => <Chip onPress={() => {}}>Sin seleccionar</Chip> },
    ],
    props: [
      { name: "children", type: "string", required: true },
      { name: "active", type: "boolean", defaultValue: "false" },
      { name: "onPress", type: "() => void", description: "Si no se pasa, renderiza como View no interactivo." },
    ],
    snippet: `import { Chip } from "../components";

<Chip active={filter === "presidencial"} onPress={() => setFilter("presidencial")}>
  Presidencial
</Chip>`,
  },
  {
    name: "StatBlock",
    path: "atoms/StatBlock",
    category: "atoms",
    description: "Metrica destacada: numero grande + label chico. 4 variantes de color. Delta opcional.",
    variants: [
      { label: "default", render: () => <StatBlock value={128} label="Noticias" /> },
      { label: "primary", render: () => <StatBlock value="85%" label="Match" variant="primary" /> },
      { label: "success", render: () => <StatBlock value={12} label="Guardados" variant="success" /> },
      { label: "warning + delta", render: () => <StatBlock value={3} label="Alertas" variant="warning" delta="+2 esta semana" /> },
    ],
    props: [
      { name: "value", type: "string | number", required: true },
      { name: "label", type: "string", required: true },
      { name: "variant", type: "\"default\" | \"primary\" | \"success\" | \"warning\"", defaultValue: "\"default\"" },
      { name: "delta", type: "string", description: "Texto pequeno debajo (ej: '+3 vs mes anterior')." },
    ],
    snippet: `import { StatBlock } from "../components";

<StatBlock value="87%" label="Coincidencia" variant="primary" />`,
  },
  {
    name: "Avatar",
    path: "atoms/Avatar",
    category: "atoms",
    description: "Circulo con iniciales o imagen. 4 tamanos. Fallback automatico a iniciales si la imagen falla.",
    variants: [
      { label: "sm (32)", render: () => <Avatar initials="JB" size="sm" /> },
      { label: "md (44)", render: () => <Avatar initials="GB" size="md" /> },
      { label: "lg (64)", render: () => <Avatar initials="JK" size="lg" /> },
      { label: "xl (96)", render: () => <Avatar initials="MB" size="xl" /> },
      { label: "color custom", render: () => <Avatar initials="EP" size="lg" backgroundColor="#B85C5C" /> },
    ],
    props: [
      { name: "initials", type: "string", required: true, description: "Se cortan a 3 chars y pasan a mayusculas." },
      { name: "imageUrl", type: "string | null", description: "URL de la foto. Fallback a iniciales si falla." },
      { name: "size", type: "\"sm\" | \"md\" | \"lg\" | \"xl\"", defaultValue: "\"md\"" },
      { name: "backgroundColor", type: "string", description: "Solo para fallback iniciales. Default: secondary." },
      { name: "color", type: "string", description: "Color del texto (iniciales). Default: textOnPrimary." },
    ],
    snippet: `import { Avatar } from "../components";

<Avatar initials="JB" imageUrl={user.photoUrl} size="lg" />`,
  },
  {
    name: "Timeline",
    path: "atoms/Timeline",
    category: "atoms",
    description: "Trayectoria vertical con dots + linea. Estado 'past' atenua para eventos historicos.",
    variants: [
      {
        label: "trayectoria candidato",
        render: () => (
          <View style={{ width: 250 }}>
            <Timeline
              items={[
                { year: "2024 - Actual", desc: "Presidente de la Republica" },
                { year: "2018 - 2022", desc: "Diputado por Magallanes", past: true },
                { year: "2013 - 2018", desc: "Presidente Federacion Estudiantes", past: true },
              ]}
            />
          </View>
        ),
      },
    ],
    props: [
      { name: "items", type: "TimelineItem[]", required: true, description: "{ year, desc, past? }" },
    ],
    snippet: `import { Timeline } from "../components";

<Timeline
  items={[
    { year: "2024 - Actual", desc: "Presidente" },
    { year: "2018 - 2022", desc: "Diputado", past: true },
  ]}
/>`,
  },
  {
    name: "Tabs",
    path: "atoms/Tabs",
    category: "atoms",
    description: "Segmented control con contador opcional. Genericos por T (union de strings).",
    variants: [
      { label: "3 tabs con count", render: () => <TabsDemo /> },
      {
        label: "sin count",
        render: () => (
          <Tabs
            value="a"
            onChange={() => {}}
            items={[
              { value: "a", label: "Opcion A" },
              { value: "b", label: "Opcion B" },
            ]}
          />
        ),
      },
    ],
    props: [
      { name: "value", type: "T (extends string)", required: true },
      { name: "onChange", type: "(v: T) => void", required: true },
      { name: "items", type: "TabItem<T>[]", required: true, description: "{ value, label, count? }" },
    ],
    snippet: `import { Tabs } from "../components";

<Tabs
  value={activeTab}
  onChange={setActiveTab}
  items={[
    { value: "all", label: "Todas", count: 128 },
    { value: "saved", label: "Guardadas", count: 12 },
  ]}
/>`,
  },
  {
    name: "Icon",
    path: "atoms/Icon",
    category: "atoms",
    description: "Set curado de 23 iconos SVG (stroke 2, currentColor). Todos con viewBox 24x24.",
    variants: [
      {
        label: "grid completo (23 iconos)",
        render: () => (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {ICON_NAMES.map((n) => (
              <View key={n} style={{ alignItems: "center", width: 60 }}>
                <Icon name={n} size={24} />
                <View style={{ marginTop: 4 }}>
                  <React.Fragment>{/* icon name label */}</React.Fragment>
                </View>
              </View>
            ))}
          </View>
        ),
      },
      { label: "size custom", render: () => <Icon name="heart" size={48} /> },
      { label: "color custom", render: () => <Icon name="alert" size={32} color="#B85C5C" /> },
      { label: "fill (heart lleno)", render: () => <Icon name="heart" size={32} color="#B85C5C" fill="#B85C5C" /> },
    ],
    props: [
      { name: "name", type: "IconName", required: true, description: "Union de 23 nombres (ver Icon.tsx)." },
      { name: "size", type: "number", defaultValue: "20" },
      { name: "color", type: "string", defaultValue: "\"currentColor\"", description: "Color del stroke." },
      { name: "strokeWidth", type: "number", defaultValue: "2" },
      { name: "fill", type: "string", defaultValue: "\"none\"", description: "Fill del path (para heart 'lleno')." },
    ],
    snippet: `import { Icon } from "../components";

<Icon name="heart" size={24} color="#B85C5C" />`,
  },
  {
    name: "RadarChart",
    path: "atoms/RadarChart",
    category: "atoms",
    description: "Poligono SVG que muestra score por eje tematico. Usa react-native-svg (funciona en iOS/Android/web).",
    variants: [
      {
        label: "default (8 ejes)",
        render: () => <RadarChart data={RADAR_DATA} size={220} />,
      },
      {
        label: "sin labels",
        render: () => <RadarChart data={RADAR_DATA} size={180} showLabels={false} />,
      },
      {
        label: "color custom",
        render: () => <RadarChart data={RADAR_DATA} size={200} color="#B85C5C" />,
      },
    ],
    props: [
      { name: "data", type: "Record<string, number>", required: true, description: "Score 0-100 por eje. <3 ejes retorna null." },
      { name: "size", type: "number", defaultValue: "240", description: "Cuadrado contenedor." },
      { name: "color", type: "string", description: "Color del poligono. Default: primary." },
      { name: "showLabels", type: "boolean", defaultValue: "true" },
      { name: "levels", type: "number", defaultValue: "4", description: "Cantidad de anillos concentricos." },
    ],
    snippet: `import { RadarChart } from "../components";

<RadarChart
  data={{ ECONOMIA: 85, SOCIEDAD: 72, AMBIENTE: 90 }}
  size={240}
/>`,
  },
  {
    name: "ElectionCard",
    path: "atoms/ElectionCard",
    category: "atoms",
    description: "Card de eleccion activa en Home HUB. 3 variantes (active, secondary, pending). Badge de estado (Completado/Pendiente) si isCompleted esta definido.",
    variants: [
      {
        label: "active + completado",
        render: () => (
          <ElectionCard
            name="Presidencial 2025"
            scope="NACIONAL"
            isCompleted
            matchPercent={87}
            progressPercent={100}
            variant="active"
          />
        ),
      },
      {
        label: "secondary + completado",
        render: () => (
          <ElectionCard
            name="Municipal Providencia"
            scope="COMUNAL"
            isCompleted
            matchPercent={64}
            progressPercent={100}
          />
        ),
      },
      {
        label: "pending (sin cuestionario)",
        render: () => (
          <ElectionCard
            name="Convencion Constituyente 2026"
            scope="NACIONAL"
            isCompleted={false}
            progressPercent={0}
            pendingLabel="6 preguntas pendientes"
            variant="pending"
          />
        ),
      },
      {
        label: "loading (sin badge)",
        render: () => (
          <ElectionCard
            name="Plebiscito Constitucional"
            scope="NACIONAL"
            progressPercent={0}
            pendingLabel="Cargando…"
            variant="pending"
          />
        ),
      },
    ],
    props: [
      { name: "name", type: "string", required: true },
      { name: "scope", type: "string", description: "Ej. 'NACIONAL', 'COMUNAL'." },
      { name: "isCompleted", type: "boolean", description: "Si el user completo el cuestionario. Undefined oculta el badge (util para skeletons)." },
      { name: "matchPercent", type: "number | null", description: "0-100. null si aun no hay match." },
      { name: "progressPercent", type: "number", required: true, description: "0-100 progreso del cuestionario." },
      { name: "pendingLabel", type: "string", description: "Texto alt cuando no hay match." },
      { name: "variant", type: "\"active\" | \"secondary\" | \"pending\"", defaultValue: "\"secondary\"" },
      { name: "onPress", type: "() => void" },
    ],
    snippet: `import { ElectionCard } from "../components";

<ElectionCard
  name="Presidencial 2025"
  scope="NACIONAL"
  isCompleted
  matchPercent={87}
  progressPercent={100}
  variant="active"
  onPress={() => selectElection(id)}
/>`,
  },
  {
    name: "ElectionCardAdd",
    path: "atoms/ElectionCardAdd",
    category: "atoms",
    description: "Card dashed '+ Activar' al final del strip del Home HUB. Invita a agregar una eleccion nueva.",
    variants: [
      { label: "default", render: () => <ElectionCardAdd label="Activar Congreso" onPress={() => {}} /> },
    ],
    props: [
      { name: "label", type: "string", required: true },
      { name: "onPress", type: "() => void" },
      { name: "accessibilityLabel", type: "string", description: "Default: usa el label." },
    ],
    snippet: `import { ElectionCardAdd } from "../components";

<ElectionCardAdd label="Activar Congreso" onPress={openWizard} />`,
  },
  {
    name: "TabBarItem",
    path: "atoms/TabBarItem",
    category: "atoms",
    description: "Item individual del BottomNav / Sidebar. Icon 24px + label 11px. Estado activo con bg tinted.",
    variants: [
      {
        label: "bottom / inactive",
        render: () => (
          <View style={{ width: 80 }}>
            <TabBarItem icon="home" label="Home" onPress={() => {}} />
          </View>
        ),
      },
      {
        label: "bottom / active",
        render: () => (
          <View style={{ width: 80 }}>
            <TabBarItem icon="home" label="Home" active onPress={() => {}} />
          </View>
        ),
      },
      {
        label: "side / active",
        render: () => (
          <View style={{ width: 80 }}>
            <TabBarItem icon="news" label="Noticias" active variant="side" onPress={() => {}} />
          </View>
        ),
      },
    ],
    props: [
      { name: "icon", type: "IconName", required: true },
      { name: "label", type: "string", required: true },
      { name: "active", type: "boolean", defaultValue: "false" },
      { name: "variant", type: "\"bottom\" | \"side\"", defaultValue: "\"bottom\"", description: "Bottom usa bg 8% primary, side usa 10%." },
      { name: "onPress", type: "() => void" },
    ],
    snippet: `import { TabBarItem } from "../components";

<TabBarItem
  icon="home"
  label="Home"
  active={route === "home"}
  onPress={() => navigate("Home")}
/>`,
  },
];
