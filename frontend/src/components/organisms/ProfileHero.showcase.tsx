import type { CatalogEntry } from "../../screens/design-system/showcase/types";
import { ProfileHero } from "./ProfileHero";

type ShowcaseEntry = Pick<
  CatalogEntry,
  "description" | "variants" | "props" | "snippet"
>;

const showcase: ShowcaseEntry = {
  description:
    "Header de perfil de candidato. Avatar XL + partido pill + nombre + subtitulo + stats inline. Fondo tinted segun tilt.",
  variants: [
    {
      label: "con stats",
      render: () => (
        <ProfileHero
          name="Gabriel Boric Font"
          initials="GB"
          partido="Frente Amplio"
          subtitle="Presidente de Chile - 38 anios - Magallanes"
          tilt="left"
          stats={[
            { value: "87%", label: "Match" },
            { value: 42, label: "Posturas" },
            { value: 12, label: "Ejes" },
          ]}
        />
      ),
    },
    {
      label: "sin stats, tilt=right",
      render: () => (
        <ProfileHero
          name="Jose Antonio Kast"
          initials="JK"
          partido="Republicanos"
          subtitle="Candidato - 57 anios - Region Metropolitana"
          tilt="right"
        />
      ),
    },
  ],
  props: [
    { name: "name", type: "string", required: true },
    { name: "initials", type: "string", required: true },
    { name: "partido", type: "string", required: true },
    { name: "subtitle", type: "string", required: true },
    { name: "stats", type: "ReadonlyArray<{value, label}>" },
    { name: "tilt", type: "\"left\" | \"center\" | \"right\" | \"default\"", defaultValue: "\"default\"" },
  ],
  snippet: `import { ProfileHero } from "@/components";

<ProfileHero
  name={candidato.nombre}
  initials={candidato.iniciales}
  partido={candidato.partido}
  subtitle={\`\${candidato.cargo} - \${candidato.edad} anios\`}
  tilt={candidato.tendencia}
  stats={[
    { value: \`\${match}%\`, label: "Match" },
    { value: posturas.length, label: "Posturas" },
  ]}
/>`,
};

export default showcase;
