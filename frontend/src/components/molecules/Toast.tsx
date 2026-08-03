/**
 * Sistema de toasts sencillo, RN-nativo (sin deps externas).
 *
 * Uso desde cualquier componente:
 *   const toast = useToast();
 *   toast.error("Algo salio mal", "Detalle opcional");
 *   toast.success("Guardado!");
 *   toast.info("Cargando datos");
 *
 * Reemplaza Alert.alert() de RN, que en RN Web silenciosamente NO renderiza.
 *
 * Los toasts se auto-cierran a los 4 segundos y son tap-para-cerrar.
 * Se apilan verticalmente en la esquina superior (safe-area aware).
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors, useThemeShadows } from "../../theme/useTheme";

export type ToastVariant = "success" | "error" | "info";

/** Opciones opcionales para personalizar un toast. */
export interface ToastOptions {
  /** Milisegundos hasta auto-cerrar. Default: 4000. */
  duration?: number;
  /** Boton de accion inline (ej: "Deshacer"). */
  action?: { label: string; onPress: () => void };
}

interface Toast {
  id: number;
  title: string;
  detail?: string;
  variant: ToastVariant;
  duration: number;
  action?: { label: string; onPress: () => void };
}

interface ToastContextValue {
  show: (variant: ToastVariant, title: string, detail?: string, opts?: ToastOptions) => void;
  success: (title: string, detail?: string, opts?: ToastOptions) => void;
  error: (title: string, detail?: string, opts?: ToastOptions) => void;
  info: (title: string, detail?: string, opts?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4000;

// TASK-066: layout estatico a nivel de modulo. Colores dinamicos inline.
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    right: 12,
    gap: 8,
    zIndex: 9999,
    alignItems: "center",
  },
  toast: {
    width: "100%",
    maxWidth: 480,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  detail: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.95,
  },
  actionBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const c = useThemeColors();
  const shadows = useThemeShadows();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const insets = useSafeAreaInsets();

  // Objeto plano, no necesita useMemo -- el tema no cambia frecuentemente
  // y la evaluacion es O(1). useMemo aqui solo anade overhead de closure.
  const VARIANT_STYLES: Record<ToastVariant, { bg: string; fg: string }> = {
    success: { bg: c.success, fg: c.textOnPrimary },
    error: { bg: c.danger, fg: c.textOnPrimary },
    info: { bg: c.primary, fg: c.textOnPrimary },
  };

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (variant: ToastVariant, title: string, detail?: string, opts?: ToastOptions) => {
      const id = nextId.current++;
      const duration = opts?.duration ?? AUTO_DISMISS_MS;
      setToasts((prev) => [...prev, { id, title, detail, variant, duration, action: opts?.action }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  // useMemo correcto: memoiza el valor del contexto para evitar re-renders
  // innecesarios de todos los consumidores cuando ToastProvider re-renders.
  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (t, d, o) => show("success", t, d, o),
      error: (t, d, o) => show("error", t, d, o),
      info: (t, d, o) => show("info", t, d, o),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View
        style={[styles.container, { top: insets.top + 12, pointerEvents: "box-none" }]}
      >
        {toasts.map((t) => {
          const vstyle = VARIANT_STYLES[t.variant];
          return (
            <Pressable
              key={t.id}
              onPress={() => dismiss(t.id)}
              style={[styles.toast, shadows.shSm, { backgroundColor: vstyle.bg }]}
              accessibilityRole="alert"
              accessibilityLabel={`${t.variant}: ${t.title}`}
            >
              <Text style={[styles.title, { color: vstyle.fg }]} numberOfLines={2}>
                {t.title}
              </Text>
              {t.detail ? (
                <Text style={[styles.detail, { color: vstyle.fg }]} numberOfLines={3}>
                  {t.detail}
                </Text>
              ) : null}
              {t.action ? (
                <Pressable
                  onPress={() => { t.action!.onPress(); dismiss(t.id); }}
                  style={styles.actionBtn}
                  accessibilityRole="button"
                  accessibilityLabel={t.action.label}
                >
                  <Text style={[styles.actionLabel, { color: vstyle.fg }]}>
                    {t.action.label}
                  </Text>
                </Pressable>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
