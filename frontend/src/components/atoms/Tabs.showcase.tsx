import React from "react";

import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { Tabs } from "./Tabs";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

function TabsDemo() {
  const [active, setActive] = React.useState<"all" | "read" | "saved">("all");
  return (
    <Tabs
      value={active}
      onChange={(v) => setActive(v)}
      items={[
        { value: "all", label: "Todas", count: 128 },
        { value: "read", label: "Leidas", count: 44 },
        { value: "saved", label: "Guardadas", count: 12 },
      ]}
    />
  );
}

const showcase: ShowcaseEntry = {
  description:
    "Segmented control con contador opcional. Genericos por T (union de strings).",
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
  snippet: `import { Tabs } from "@/components";

<Tabs
  value={activeTab}
  onChange={setActiveTab}
  items={[
    { value: "all", label: "Todas", count: 128 },
    { value: "saved", label: "Guardadas", count: 12 },
  ]}
/>`,
};

export default showcase;
