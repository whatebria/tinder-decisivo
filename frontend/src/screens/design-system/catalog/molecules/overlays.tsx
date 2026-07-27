/**
 * Catalogo de moleculas: OVERLAYS (modales y toast).
 *
 * Incluye: Modal, ConfirmModal, ShareModal, PreguntaInfoModal,
 * CambiarPasswordModal, EliminarCuentaModal, EditarRespuestaModal, Toast.
 *
 * Nota: los modales de dominio usan RN Modal directo (no el Modal base)
 * para evitar bugs de Tamagui en RN Web. El Modal atomo si es el base
 * reusable para nuevos casos.
 */

import React from "react";
import { Text, View } from "react-native";

import { DemoText } from "../../showcase/DemoText";

import {
  Button,
  CambiarPasswordModal,
  ConfirmModal,
  EliminarCuentaModal,
  Modal,
  NoticiaDetailSheet,
  PreguntaInfoModal,
  ShareModal,
  useToast,
} from "../../../../components";
import type { CatalogEntry } from "../../showcase/types";

// ============ demos con estado interno ============
function ModalDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)} fullWidth={false}>Abrir Modal base</Button>
      <Modal
        visible={open}
        onClose={() => setOpen(false)}
        title="Titulo del modal"
        footer={
          <>
            <Button variant="ghost" onPress={() => setOpen(false)} fullWidth={false}>Cancelar</Button>
            <Button onPress={() => setOpen(false)} fullWidth={false}>Aceptar</Button>
          </>
        }
      >
        <DemoText style={{ fontSize: 14 }}>
          Este es el body del modal. Puede contener cualquier contenido: texto, forms, listas...
        </DemoText>
      </Modal>
    </>
  );
}

function ConfirmModalDemo({ variant }: { variant: "danger" | "primary" }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)} variant={variant === "danger" ? "danger" : "primary"} fullWidth={false}>
        {`Abrir Confirm (${variant})`}
      </Button>
      <ConfirmModal
        visible={open}
        title={variant === "danger" ? "Eliminar cuenta" : "Guardar cambios"}
        message={variant === "danger" ? "Esta accion no se puede deshacer. Se borran todos tus datos." : "Se guardaran los cambios y se recalculara tu match."}
        confirmLabel={variant === "danger" ? "Si, eliminar" : "Guardar"}
        variant={variant}
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

function ShareModalDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)} fullWidth={false}>Abrir Share</Button>
      <ShareModal
        visible={open}
        text="Mira mi match electoral 2025: coincido 87% con el candidato X. Averigua el tuyo en tinder-decisivo.cl"
        onClose={() => setOpen(false)}
      />
    </>
  );
}

function PreguntaInfoDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)} fullWidth={false}>Abrir Pregunta Info</Button>
      <PreguntaInfoModal
        visible={open}
        onClose={() => setOpen(false)}
        pregunta={{
          texto: "El Estado deberia aumentar el gasto en salud publica financiado con mas impuestos.",
          eje_tematico_display: "Economia y salud",
          explicacion: "Esta pregunta explora tu vision sobre el rol del Estado en la provision de servicios de salud y la disposicion a financiarlo con impuestos.",
          repercusiones: {
            economico: "Mayor gasto publico requiere subir impuestos o reasignar recursos.",
            social: "Puede reducir desigualdades en acceso a salud.",
            institucional: "Fortalece FONASA vs sistema privado (ISAPRE).",
          },
        }}
      />
    </>
  );
}

function CambiarPasswordDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)} fullWidth={false}>Abrir Cambiar Password</Button>
      <CambiarPasswordModal
        visible={open}
        onCancel={() => setOpen(false)}
        onSubmit={() => setOpen(false)}
      />
    </>
  );
}

function EliminarCuentaDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="danger" onPress={() => setOpen(true)} fullWidth={false}>Abrir Eliminar Cuenta</Button>
      <EliminarCuentaModal
        visible={open}
        onCancel={() => setOpen(false)}
        onSubmit={() => setOpen(false)}
      />
    </>
  );
}

function ToastDemo() {
  const toast = useToast();
  return (
    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
      <Button variant="success" fullWidth={false} onPress={() => toast.success("Guardado!", "Todo listo.")}>success</Button>
      <Button variant="danger" fullWidth={false} onPress={() => toast.error("Algo salio mal", "Intenta de nuevo.")}>error</Button>
      <Button fullWidth={false} onPress={() => toast.info("Sincronizando datos...")}>info</Button>
    </View>
  );
}

function NoticiaDetailSheetDemo({ variant }: { variant: "completa" | "minima" | "sinLink" }) {
  const [open, setOpen] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const noticiaCompleta = {
    id: 1,
    titulo: "Gabriel Boric anuncia nueva pol\u00edtica de vivienda con foco en clase media",
    descripcion:
      "El presidente present\u00f3 un plan de subsidios y regulaci\u00f3n del mercado de arriendos que apunta a reducir la brecha entre ingresos y costo de vida. Incluye 60 mil nuevas soluciones habitacionales en 2026 y modificaciones tributarias para propiedades sin uso.",
    url: "https://www.latercera.com/noticia/ejemplo",
    fuente: "La Tercera",
    imagenUrl: "https://picsum.photos/seed/noticia1/800/400",
    fechaFormateada: "hace 3 horas",
    sentiment: "positive" as const,
    candidatosMencionados: [
      { id: 1, nombre: "Gabriel", apellido: "Boric" },
      { id: 2, nombre: "Jose Antonio", apellido: "Kast" },
    ],
  };

  const noticiaMinima = {
    id: 2,
    titulo: "Debate presidencial reune a 5 candidatos en TVN",
    descripcion:
      "Los candidatos discutieron econom\u00eda, seguridad y educaci\u00f3n en un formato de 90 minutos.",
    url: "https://www.emol.com/noticia/ejemplo",
    fuente: "Emol",
    imagenUrl: null,
    fechaFormateada: "ayer",
    sentiment: "neutral" as const,
  };

  const noticiaSinLink = {
    id: 3,
    titulo: "Encuesta muestra empate t\u00e9cnico entre principales candidatos",
    descripcion: "Segun el sondeo, 3 de cada 5 votantes sigue indeciso.",
    url: null,
    fuente: "Cadem",
    imagenUrl: null,
    fechaFormateada: "hace 2 dias",
    sentiment: "negative" as const,
  };

  const noticia =
    variant === "completa" ? noticiaCompleta : variant === "minima" ? noticiaMinima : noticiaSinLink;

  return (
    <>
      <Button onPress={() => setOpen(true)} fullWidth={false}>
        Abrir preview
      </Button>
      <NoticiaDetailSheet
        visible={open}
        onClose={() => setOpen(false)}
        noticia={noticia}
        bookmarked={variant === "completa" ? saved : undefined}
        onToggleBookmark={variant === "completa" ? () => setSaved((s) => !s) : undefined}
      />
    </>
  );
}

export const overlaysCatalog: CatalogEntry[] = [
  {
    name: "Modal",
    path: "molecules/Modal",
    category: "molecules",
    description: "Dialog base reusable. Header (title + close) + body scrollable + footer. Backdrop tap-para-cerrar.",
    variants: [{ label: "abrir demo", render: () => <ModalDemo /> }],
    props: [
      { name: "visible", type: "boolean", required: true },
      { name: "onClose", type: "() => void", required: true },
      { name: "title", type: "string", description: "Si se omite, no se renderiza header." },
      { name: "children", type: "ReactNode", required: true, description: "Body scrollable." },
      { name: "footer", type: "ReactNode", description: "Botones del footer." },
      { name: "maxWidth", type: "number", defaultValue: "480" },
      { name: "dismissOnBackdrop", type: "boolean", defaultValue: "true" },
    ],
    snippet: `import { Modal, Button } from "../components";

<Modal
  visible={open}
  onClose={() => setOpen(false)}
  title="Editar perfil"
  footer={<Button onPress={handleSave}>Guardar</Button>}
>
  <Text>Contenido...</Text>
</Modal>`,
  },
  {
    name: "ConfirmModal",
    path: "molecules/ConfirmModal",
    category: "molecules",
    description: "Modal generico de confirmacion. 2 variantes (danger, primary). Loading opcional.",
    variants: [
      { label: "primary", render: () => <ConfirmModalDemo variant="primary" /> },
      { label: "danger", render: () => <ConfirmModalDemo variant="danger" /> },
    ],
    props: [
      { name: "visible", type: "boolean", required: true },
      { name: "title", type: "string", required: true },
      { name: "message", type: "string", required: true },
      { name: "confirmLabel", type: "string", defaultValue: "\"Confirmar\"" },
      { name: "cancelLabel", type: "string", defaultValue: "\"Cancelar\"" },
      { name: "variant", type: "\"danger\" | \"primary\"", defaultValue: "\"primary\"" },
      { name: "onConfirm", type: "() => void", required: true },
      { name: "onCancel", type: "() => void", required: true },
      { name: "loading", type: "boolean", defaultValue: "false" },
    ],
    snippet: `import { ConfirmModal } from "../components";

<ConfirmModal
  visible={open}
  title="Eliminar postura"
  message="Se quitara de tus guardados. Puedes volver a agregarla despues."
  variant="danger"
  confirmLabel="Si, eliminar"
  onConfirm={handleDelete}
  onCancel={() => setOpen(false)}
  loading={mutation.isPending}
/>`,
  },
  {
    name: "ShareModal",
    path: "molecules/ShareModal",
    category: "molecules",
    description: "Preview del texto a compartir + botones copiar/share nativo. Fallback a copy-only en desktop.",
    variants: [{ label: "abrir demo", render: () => <ShareModalDemo /> }],
    props: [
      { name: "visible", type: "boolean", required: true },
      { name: "text", type: "string", required: true, description: "Texto a compartir." },
      { name: "onClose", type: "() => void", required: true },
    ],
    snippet: `import { ShareModal } from "../components";

<ShareModal
  visible={open}
  text={\`Mira mi match: coincido 87% con X\`}
  onClose={() => setOpen(false)}
/>`,
  },
  {
    name: "PreguntaInfoModal",
    path: "molecules/PreguntaInfoModal",
    category: "molecules",
    description: "Modal educativo con contexto de una pregunta: explicacion + repercusiones por dimension (economica, social, cultural, ambiental, institucional).",
    variants: [{ label: "abrir demo", render: () => <PreguntaInfoDemo /> }],
    props: [
      { name: "visible", type: "boolean", required: true },
      { name: "onClose", type: "() => void", required: true },
      { name: "pregunta", type: "{ texto, eje_tematico_display?, explicacion?, repercusiones? } | null", required: true },
    ],
    snippet: `import { PreguntaInfoModal } from "../components";

<PreguntaInfoModal
  visible={showInfo}
  onClose={() => setShowInfo(false)}
  pregunta={preguntaActual}
/>`,
  },
  {
    name: "CambiarPasswordModal",
    path: "molecules/CambiarPasswordModal",
    category: "molecules",
    description: "Formulario para cambiar password: current + new + confirm. Valida match en cliente.",
    variants: [{ label: "abrir demo", render: () => <CambiarPasswordDemo /> }],
    props: [
      { name: "visible", type: "boolean", required: true },
      { name: "onCancel", type: "() => void", required: true },
      { name: "onSubmit", type: "(current: string, next: string) => void", required: true },
      { name: "loading", type: "boolean", defaultValue: "false" },
    ],
    snippet: `import { CambiarPasswordModal } from "../components";

<CambiarPasswordModal
  visible={open}
  onCancel={() => setOpen(false)}
  onSubmit={(current, next) => mutation.mutate({ current, next })}
  loading={mutation.isPending}
/>`,
  },
  {
    name: "EliminarCuentaModal",
    path: "molecules/EliminarCuentaModal",
    category: "molecules",
    description: "Doble confirmacion destructiva: requiere password + escribir 'ELIMINAR' (uppercase) para habilitar el boton.",
    variants: [{ label: "abrir demo", render: () => <EliminarCuentaDemo /> }],
    props: [
      { name: "visible", type: "boolean", required: true },
      { name: "onCancel", type: "() => void", required: true },
      { name: "onSubmit", type: "(password: string) => void", required: true },
      { name: "loading", type: "boolean", defaultValue: "false" },
    ],
    snippet: `import { EliminarCuentaModal } from "../components";

<EliminarCuentaModal
  visible={open}
  onCancel={() => setOpen(false)}
  onSubmit={(pwd) => deleteAccount(pwd)}
  loading={mutation.isPending}
/>`,
  },
  {
    name: "EditarRespuestaModal",
    path: "molecules/EditarRespuestaModal",
    category: "molecules",
    description: "Modal para editar opcion + peso de una respuesta guardada. Muestra aviso de que recalcula el match.",
    variants: [
      {
        label: "no demoable aqui",
        render: () => (
          <View style={{ padding: 12 }}>
            <DemoText tone="secondary" style={{ fontSize: 13 }}>
              Requiere un objeto MiRespuesta real del API. Ver EditarRespuestaModal en uso desde MisRespuestasScreen.
            </DemoText>
          </View>
        ),
      },
    ],
    props: [
      { name: "visible", type: "boolean", required: true },
      { name: "respuesta", type: "MiRespuesta | null", required: true, description: "Tipo del API. { opcion_elegida, peso, pregunta_texto, ... }" },
      { name: "onCancel", type: "() => void", required: true },
      { name: "onSubmit", type: "(opcionId: number, peso: number) => void", required: true },
      { name: "loading", type: "boolean", defaultValue: "false" },
    ],
    snippet: `import { EditarRespuestaModal } from "../components";

<EditarRespuestaModal
  visible={editingId !== null}
  respuesta={misRespuestas.find((r) => r.id === editingId) ?? null}
  onCancel={() => setEditingId(null)}
  onSubmit={(opcionId, peso) => mutation.mutate({ id: editingId, opcionId, peso })}
  loading={mutation.isPending}
/>`,
  },
  {
    name: "Toast (useToast)",
    path: "molecules/Toast",
    category: "molecules",
    description: "Sistema de toasts via context. Auto-dismiss 4s, tap-para-cerrar. Reemplaza Alert.alert() (que no renderiza en RN Web).",
    variants: [{ label: "disparar toasts", render: () => <ToastDemo /> }],
    props: [
      { name: "useToast()", type: "() => ToastContextValue", description: "Hook. Retorna { success, error, info, show }." },
      { name: "show", type: "(variant, title, detail?) => void" },
      { name: "success", type: "(title, detail?) => void" },
      { name: "error", type: "(title, detail?) => void" },
      { name: "info", type: "(title, detail?) => void" },
    ],
    snippet: `import { useToast } from "../components";

function MyScreen() {
  const toast = useToast();

  async function handleSave() {
    try {
      await save();
      toast.success("Guardado!");
    } catch (e) {
      toast.error("Algo salio mal", String(e));
    }
  }
}

// En App.tsx, envolver con <ToastProvider>.`,
  },
  {
    name: "NoticiaDetailSheet",
    path: "molecules/NoticiaDetailSheet",
    category: "molecules",
    description:
      "Bottom sheet con el detalle completo de una noticia (imagen hero, meta, titulo, descripcion, candidatos mencionados) + boton \"Abrir noticia original\" que hace Linking.openURL. Se abre al tocar una NewsCard.",
    variants: [
      { label: "completa (imagen + bookmark + candidatos)", render: () => <NoticiaDetailSheetDemo variant="completa" /> },
      { label: "minima (sin imagen ni bookmark)", render: () => <NoticiaDetailSheetDemo variant="minima" /> },
      { label: "sin link (footer oculto)", render: () => <NoticiaDetailSheetDemo variant="sinLink" /> },
    ],
    props: [
      { name: "visible", type: "boolean", required: true },
      { name: "onClose", type: "() => void", required: true },
      { name: "noticia", type: "NoticiaDetail | null", required: true, description: "{ id, titulo, descripcion, url?, fuente?, imagenUrl?, fechaFormateada, sentiment, candidatosMencionados? }" },
      { name: "bookmarked", type: "boolean", description: "Si se pasa junto con onToggleBookmark, muestra el BookmarkButton." },
      { name: "onToggleBookmark", type: "() => void" },
      { name: "bookmarkLoading", type: "boolean", defaultValue: "false" },
    ],
    snippet: `import { NoticiaDetailSheet, type NoticiaDetail } from "../components";

const [selected, setSelected] = useState<NoticiaDetail | null>(null);

<NewsCard
  onPress={() =>
    setSelected({
      id: n.id,
      titulo: n.titulo,
      descripcion: n.descripcion,
      url: n.url,
      fuente: n.fuente,
      imagenUrl: n.imagen_url,
      fechaFormateada: formatearFecha(n.fecha_publicacion),
      sentiment: "neutral",
      candidatosMencionados: n.candidatos_mencionados_data,
    })
  }
  // ...
/>

<NoticiaDetailSheet
  visible={selected !== null}
  onClose={() => setSelected(null)}
  noticia={selected}
/>`,
  },
];
