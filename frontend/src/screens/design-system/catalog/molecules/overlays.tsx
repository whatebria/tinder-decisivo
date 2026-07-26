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

import {
  Button,
  CambiarPasswordModal,
  ConfirmModal,
  EliminarCuentaModal,
  Modal,
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
        <Text style={{ fontSize: 14 }}>
          Este es el body del modal. Puede contener cualquier contenido: texto, forms, listas...
        </Text>
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
            <Text style={{ fontSize: 13, color: "#666" }}>
              Requiere un objeto MiRespuesta real del API. Ver EditarRespuestaModal en uso desde MisRespuestasScreen.
            </Text>
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
];
