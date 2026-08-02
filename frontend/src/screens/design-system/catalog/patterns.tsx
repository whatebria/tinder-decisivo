/**
 * Patrones UX oficiales del proyecto.
 *
 * No son componentes: son recetas de composicion que documentan
 * como combinar atoms + molecules + organisms para situaciones
 * recurrentes del producto.
 *
 * Cada entry usa category: "patterns" y sourcePath descriptivo.
 * Las variantes muestran implementaciones aprobadas.
 */

import React from "react";
import { Text, View } from "react-native";

import { useThemeColors } from "../../../theme/useTheme";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import type { CatalogEntry } from "../showcase/types";

// ---------------------------------------------------------------------------
// Primitiva de documentacion de patron
// ---------------------------------------------------------------------------

interface PatternDocsProps {
  whenToUse: string[];
  doNot: string[];
  recipe: string[];
  a11y?: string[];
}

function PatternDocs({ whenToUse, doNot, recipe, a11y }: PatternDocsProps) {
  const c = useThemeColors();

  const Section = ({ title, items, accent }: { title: string; items: string[]; accent: string }) => (
    <View style={{ marginBottom: spacing.sp4 }}>
      <Text style={[typography.overline, { color: accent, marginBottom: spacing.sp2 }]}>
        {title}
      </Text>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: "row", gap: spacing.sp2, marginBottom: spacing.sp1 }}>
          <Text style={[typography.small, { color: accent, lineHeight: 20 }]}>•</Text>
          <Text style={[typography.small, { color: c.text, flex: 1, lineHeight: 20 }]}>{item}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ maxWidth: 640 }}>
      <Section title="Cuando usar" items={whenToUse} accent={c.success} />
      <Section title="No usar cuando" items={doNot} accent={c.danger} />
      <Section title="Receta de composicion" items={recipe} accent={c.primary} />
      {a11y && <Section title="Accesibilidad" items={a11y} accent={c.info} />}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Patrones
// ---------------------------------------------------------------------------

export const patternsCatalog: CatalogEntry[] = [
  // ---- Estados Vacios -------------------------------------------------------
  {
    name: "Patron: Estado Vacio",
    category: "patterns",
    path: "patterns/empty-state",
    sourcePath: "docs/patterns/empty-state",
    description:
      "Como comunicar que no hay datos. Distingue entre 'aun no hay nada' (virgin state), 'tu filtro no dio resultados' (filtered empty) y 'algo fallo' (error state).",
    variants: [
      {
        label: "documentacion",
        render: () => (
          <PatternDocs
            whenToUse={[
              "Lista de candidatos sin resultados despues de filtrar.",
              "Guardados vacios (primer uso).",
              "Respuestas vacias (nunca respondio el cuestionario).",
            ]}
            doNot={[
              "No mostrar EmptyState mientras el request esta en vuelo — usar Spinner.",
              "No usar el mismo texto para 'empty por filtro' y 'empty virgin': el CTA es diferente.",
              "No omitir el CTA — el usuario necesita una salida.",
            ]}
            recipe={[
              "Empty virgin → EmptyState con icono + titulo 'Aun no tienes X' + Button primary 'Empezar'.",
              "Empty filtrado → EmptyState con titulo 'Ningun resultado' + Button ghost 'Limpiar filtros'.",
              "Empty error → ErrorBoundary o inline error + Button 'Reintentar'.",
              "No mezclar los tres casos en el mismo componente sin distinguir la causa.",
            ]}
            a11y={[
              "EmptyState no emite accessibilityLiveRegion — no lo agregues sin necesidad (puede ser ruidoso).",
              "El CTA button debe tener un label descriptivo, no solo 'Volver'.",
            ]}
          />
        ),
      },
    ],
    props: [],
    snippet: `// Empty virgin
<EmptyState
  icon="bookmark"
  title="Aun no guardaste candidatos"
  body="Guarda candidatos desde el ranking o sus perfiles."
  cta={{ label: "Ver ranking", onPress: () => navigation.navigate("Candidatos") }}
/>

// Empty filtrado (resetear filtro)
<EmptyState
  icon="filter-x"
  title="Ningun candidato coincide"
  cta={{ label: "Limpiar filtros", onPress: resetFiltros, variant: "ghost" }}
/>`,
  },

  // ---- Estados de Carga ----------------------------------------------------
  {
    name: "Patron: Estado de Carga",
    category: "patterns",
    path: "patterns/loading-state",
    sourcePath: "docs/patterns/loading-state",
    description:
      "Cuando y como mostrar feedback de carga. Distingue carga inicial (full-screen skeleton/spinner), re-fetch (overlay sutil) y accion puntual (loading en el boton).",
    variants: [
      {
        label: "documentacion",
        render: () => (
          <PatternDocs
            whenToUse={[
              "Carga inicial de pantalla: Spinner centrado o skeleton.",
              "Re-fetch (pull-to-refresh): ActivityIndicator encima del contenido.",
              "Accion de usuario (submit/guardar): loading={true} en el Button.",
            ]}
            doNot={[
              "No mostrar spinner de pantalla completa en re-fetches — el contenido anterior es mas util.",
              "No bloquear la UI sin deshabilitar el boton que inicio la accion (doble-press).",
              "No usar Text 'Cargando...' hardcodeado — usar el Spinner atom.",
              "No usar isLoading del hook directamente en el boton: puede ser true durante re-fetches.",
            ]}
            recipe={[
              "Carga inicial: if (isLoading && !data) return <Spinner size='lg' />.",
              "Boton con accion async: const [loading, setLoading] = useState(false); setLoading(true) antes del await.",
              "Error despues de carga: mostrar inline error + Button 'Reintentar', no sustituir toda la pantalla.",
            ]}
            a11y={[
              "Spinner atom incluye accessibilityRole='progressbar' por defecto.",
              "Button con loading={true} automaticamente desactiva taps y anuncia estado 'ocupado'.",
            ]}
          />
        ),
      },
    ],
    props: [],
    snippet: `// Carga inicial
if (isLoading && !data) return <Spinner size="lg" />;

// Accion de boton (BUG-033 pattern)
const [saving, setSaving] = useState(false);
async function handleSave() {
  setSaving(true);
  try { await doSave(); } finally { setSaving(false); }
}
<Button loading={saving} disabled={saving} onPress={handleSave}>Guardar</Button>`,
  },

  // ---- Confirmaciones Destructivas -----------------------------------------
  {
    name: "Patron: Confirmacion Destructiva",
    category: "patterns",
    path: "patterns/confirm-destructive",
    sourcePath: "docs/patterns/confirm-destructive",
    description:
      "Cuando una accion no es reversible (eliminar cuenta, reiniciar respuestas). Siempre requiere confirmacion explicita antes de ejecutar.",
    variants: [
      {
        label: "documentacion",
        render: () => (
          <PatternDocs
            whenToUse={[
              "Eliminar cuenta.",
              "Reiniciar todas las respuestas del cuestionario.",
              "Desvincular eleccion con datos asociados.",
            ]}
            doNot={[
              "No usar Button variant='ghost' para acciones destructivas primarias — usar variant='danger'.",
              "No ejecutar la accion directamente en onPress sin ConfirmModal.",
              "No reutilizar ConfirmModal para confirmaciones no-destructivas (informativas).",
            ]}
            recipe={[
              "Boton disparador: Button variant='danger' en zona de peligro visual.",
              "Modal: ConfirmModal con title descriptivo + body con consecuencias + confirmLabel='Eliminar' (danger) + cancelLabel='Cancelar' (ghost).",
              "Loading en el Modal: deshabilitar los dos botones mientras el request esta en vuelo.",
              "Toast de resultado: mostrar exito o error al cerrar el modal.",
            ]}
            a11y={[
              "ConfirmModal usa accessibilityViewIsModal={true} para aislar el foco.",
              "El label del boton de confirmacion debe describir la accion, no solo 'Confirmar'.",
            ]}
          />
        ),
      },
    ],
    props: [],
    snippet: `const [confirmOpen, setConfirmOpen] = useState(false);
const [deleting, setDeleting] = useState(false);

async function handleDelete() {
  setDeleting(true);
  try {
    await deleteAccount();
    navigation.reset({ routes: [{ name: "Login" }] });
  } catch {
    toast.error("No pudimos eliminar la cuenta");
  } finally {
    setDeleting(false);
    setConfirmOpen(false);
  }
}

// Boton disparador (en zona de peligro)
<Button variant="danger" onPress={() => setConfirmOpen(true)}>
  Eliminar cuenta
</Button>

// Modal
<ConfirmModal
  visible={confirmOpen}
  title="¿Eliminar tu cuenta?"
  body="Esta accion es permanente. Perderás todos tus matches y respuestas."
  confirmLabel="Eliminar cuenta"
  confirmVariant="danger"
  onConfirm={handleDelete}
  onCancel={() => setConfirmOpen(false)}
  loading={deleting}
/>`,
  },

  // ---- Matching / Resultados -----------------------------------------------
  {
    name: "Patron: Matching y Resultados",
    category: "patterns",
    path: "patterns/matching",
    sourcePath: "docs/patterns/matching",
    description:
      "Como presentar resultados de afinidad politica. Reglas de color por tier, confianza, y estados previos al primer resultado.",
    variants: [
      {
        label: "documentacion",
        render: () => (
          <PatternDocs
            whenToUse={[
              "Pantalla de ResultadosScreen (TopMatchSection + RankingCard/RankingRow).",
              "CandidateCard en lista de candidatos.",
              "CompararScreen (dos candidatos lado a lado).",
            ]}
            doNot={[
              "No hardcodear colores de match: usar getMatchColor(pct) de services/matching.ts.",
              "No mostrar match% cuando confianza='TENTATIVA' sin el banner de advertencia.",
              "No derivar esTipoBase dentro del componente: el screen lo calcula y lo pasa como prop.",
              "No mostrar resultados antes de MIN_PARA_RESULTADO (5 preguntas) respondidas.",
            ]}
            recipe={[
              "Tier de color: getMatchColor(pct) devuelve el hex correcto (5 tiers: aff1-aff5).",
              "Confianza: getConfianzaBadge(conf) + getConfianzaBadgeVariant(conf) para label y color.",
              "Resultado tentativo: isConfianzaTentativa(conf) === true → mostrar banner warning.",
              "Radar chart: breakdownToChartData(breakdown_por_eje) para ejeScores de RadarChart.",
              "TopMatchSection: para el candidato #1 del ranking.",
              "RankingCard: para candidatos 2-N en viewport grande.",
              "RankingRow: para candidatos 2-N en mobile (lista vertical).",
            ]}
            a11y={[
              "Match percentage: accessibilityLabel con texto completo ('87% de afinidad').",
              "RadarChart: incluir accessibilityLabel descriptivo de los ejes mas altos.",
              "Badge de confianza: variant='warning' en TENTATIVA para contraste correcto.",
            ]}
          />
        ),
      },
    ],
    props: [],
    snippet: `import {
  getMatchColor,
  getConfianzaBadge,
  getConfianzaBadgeVariant,
  isConfianzaTentativa,
  breakdownToChartData,
} from "@/services/matching";

// En el screen, antes de pasar a TopMatchSection:
const pct = Number(result.match_percentage);
const matchColor = getMatchColor(pct);
const chartData = breakdownToChartData(result.breakdown_por_eje);
const esTentativa = isConfianzaTentativa(result.confianza);
const conf = getConfianzaBadge(result.confianza);
const confVariant = getConfianzaBadgeVariant(result.confianza);`,
  },

  // ---- Cuestionario --------------------------------------------------------
  {
    name: "Patron: Cuestionario",
    category: "patterns",
    path: "patterns/cuestionario",
    sourcePath: "docs/patterns/cuestionario",
    description:
      "Flujo oficial del cuestionario: navegacion entre preguntas, guardado de respuestas en el store, submit y transicion a resultados.",
    variants: [
      {
        label: "documentacion",
        render: () => (
          <PatternDocs
            whenToUse={[
              "CuestionarioScreen: pantalla unica de preguntas.",
              "EditarRespuestaModal: edicion desde MisRespuestasScreen.",
            ]}
            doNot={[
              "No guardar respuestas directamente en el estado local del componente — usar el store (Zustand).",
              "No derivar esTipoBase dentro de la pantalla en el submit — puede estar undefined si el query no termino (BUG-026).",
              "No mostrar la barra de progreso dentro del ScrollView — debe ser sticky (CuestionarioHeader).",
              "No habilitar 'Siguiente' si el RadioGroup no tiene valor seleccionado.",
            ]}
            recipe={[
              "Header sticky: CuestionarioHeader con onBack + onInfo + respondidas/totalPreguntas.",
              "Pregunta: RadioGroup atom para opciones Likert + opcion 'No se' separada visualmente.",
              "Navegacion: prev/next gestionados por el screen (index en useState).",
              "Store: useCuestionarioStore() para getters/setters de respuestas.",
              "Submit: llamar a la mutation solo cuando todas las preguntas obligatorias tienen respuesta.",
              "Post-submit: navegar a SubmitDoneScreen o directamente a ResultadosScreen segun esTipoBase.",
            ]}
            a11y={[
              "RadioGroup: accessibilityRole='radio' en cada opcion, 'radiogroup' en el contenedor.",
              "Boton 'Siguiente' deshabilitado comunica su estado via accessibilityState={{ disabled: true }}.",
              "CuestionarioHeader: accessibilityRole='header' + progressbar con accessibilityValue.",
            ]}
          />
        ),
      },
    ],
    props: [],
    snippet: `// Estructura minima de CuestionarioScreen
<CuestionarioHeader
  title={tipoEleccion?.nombre}
  subtitle={\`\${index + 1} de \${total} · base\`}
  respondidas={index}
  totalPreguntas={total}
  onBack={canGoBack ? handleBack : undefined}
/>

<ScrollView>
  <RadioGroup
    options={pregunta.opciones}
    value={respuestas[pregunta.id] ?? null}
    onChange={(v) => setRespuesta(pregunta.id, v)}
  />
</ScrollView>

<Button
  onPress={handleNext}
  disabled={!respuestas[pregunta.id]}
>
  {isLast ? "Finalizar" : "Siguiente"}
</Button>`,
  },

  // ---- Filtros -------------------------------------------------------------
  {
    name: "Patron: Filtros",
    category: "patterns",
    path: "patterns/filtros",
    sourcePath: "docs/patterns/filtros",
    description:
      "Como implementar filtros en listas. Distingue filtros inline (chips), filtros en sheet (FilterBottomSheet) y busqueda por texto.",
    variants: [
      {
        label: "documentacion",
        render: () => (
          <PatternDocs
            whenToUse={[
              "CandidatosScreen: busqueda + chips de partido.",
              "CompararScreen: selector de candidato via ListPickerModal.",
              "ResultadosScreen: filtro de partido inline.",
              "NoticiasScreen: filtro de tema via FilterBottomSheet.",
            ]}
            doNot={[
              "No colocar filtros dentro del ScrollView cuando el contenido es largo — los chips se pierden.",
              "No omitir el CTA 'Limpiar filtros' cuando filteredResults === 0.",
              "No derivar la funcion de filtrado en el render — usar useMemo.",
              "No mutar el array original — filtrar a uno nuevo.",
            ]}
            recipe={[
              "Chips inline: ChipActivo para filtros activos + Chip para opciones disponibles.",
              "Sheet: FilterBottomSheet (organism) para multiples dimensiones de filtro.",
              "Busqueda: Input atom con debounce de 150ms.",
              "Conteo activo: filtrosActivosCount con useMemo para el badge del boton de filtros.",
              "Reset: limpiarTodo() con useCallback, asociado a Button ghost.",
            ]}
            a11y={[
              "ChipActivo incluye accessibilityState={{ selected: true }} cuando esta activo.",
              "El badge de conteo en el boton de filtros debe tener accessibilityLabel descriptivo.",
              "Input de busqueda con accessibilityLabel='Buscar candidatos'.",
            ]}
          />
        ),
      },
    ],
    props: [],
    snippet: `// Filtro simple con chips (CandidatosScreen pattern)
const filtered = useMemo(
  () => candidatos.filter((c) =>
    (!searchText || normalizar(c.nombre).includes(normalizar(searchText))) &&
    (!partidoFiltro || c.partido === partidoFiltro)
  ),
  [candidatos, searchText, partidoFiltro],
);

// CTA reset cuando empty
{filtered.length === 0 && partidoFiltro && (
  <Button variant="ghost" onPress={() => setPartidoFiltro(null)}>
    Limpiar filtros
  </Button>
)}`,
  },

  // ---- Navegacion Contextual -----------------------------------------------
  {
    name: "Patron: Navegacion Contextual",
    category: "patterns",
    path: "patterns/navegacion",
    sourcePath: "docs/patterns/navegacion",
    description:
      "Reglas de navegacion: que screens tienen BottomNav, que tab activo se muestra, y como navegar entre screens primarias y secundarias.",
    variants: [
      {
        label: "documentacion",
        render: () => (
          <PatternDocs
            whenToUse={[
              "Pantallas del tab bar (Home, Candidatos, Comparar, Noticias, Config): AppShell con active correspondiente.",
              "Pantallas secundarias (Perfil, MisGuardados, MisRespuestas, GestionElecciones): AppShell con active={null}.",
              "Flujos cerrados (Cuestionario, Onboarding): ScreenChrome sin BottomNav.",
            ]}
            doNot={[
              "No usar active='home' en ResultadosScreen — es una pantalla secundaria sin tab propia (TASK-067).",
              "No usar ScreenChrome en pantallas con BottomNav.",
              "No navegar con navigation.replace() en flujos de vuelta al tab: usar navigation.navigate().",
              "No duplicar el titulo de pantalla en el hero de la misma pantalla (UX-049 pattern).",
            ]}
            recipe={[
              "Tab primario: <AppShell active='home'> (o candidatos, comparar, noticias, config).",
              "Pantalla secundaria: <AppShell active={null}> — el BottomNav se renderiza sin tab activo.",
              "Flujo cerrado: <ScreenChrome> — sin BottomNav, solo el contenido.",
              "Back: siempre navigation.goBack() o el onBack de CuestionarioHeader.",
            ]}
            a11y={[
              "BottomNav: accessibilityRole='tablist' + accessibilityState={{ selected }} por tab.",
              "El tab activo debe anunciarse al screen reader al navegar.",
            ]}
          />
        ),
      },
    ],
    props: [],
    snippet: `// Pantalla con tab activo
<AppShell active="candidatos" navigation={navigation}>
  {/* contenido */}
</AppShell>

// Pantalla secundaria (sin tab activo)
<AppShell active={null} navigation={navigation}>
  {/* contenido */}
</AppShell>

// Flujo cerrado (sin BottomNav)
<ScreenChrome navigation={navigation} title="Cuestionario">
  {/* contenido */}
</ScreenChrome>`,
  },
];
