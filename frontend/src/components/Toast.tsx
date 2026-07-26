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

import { useThemeColors } from "../theme/useTheme";

export type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: number;
  title: string;
  detail?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (variant: ToastVariant, title: string, detail?: string) => void;
  success: (title: string, detail?: string) => void;
  error: (title: string, detail?: string) => void;
  info: (title: string, detail?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const c = useThemeColors();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const insets = useSafeAreaInsets();

  const VARIANT_STYLES: Record<ToastVariant, { bg: string; fg: string }> = useMemo(
    () => ({
      success: { bg: c.success, fg: c.textOnPrimary },
      error: { bg: c.danger, fg: c.textOnPrimary },
      info: { bg: c.primary, fg: c.textOnPrimary },
    }),
    [c]
  );

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (variant: ToastVariant, title: string, detail?: string) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, title, detail, variant }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (t, d) => show("success", t, d),
      error: (t, d) => show("error", t, d),
      info: (t, d) => show("info", t, d),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View
        pointerEvents="box-none"
        style={[styles.container, { top: insets.top + 12 }]}
      >
        {toasts.map((t) => {
          const style = VARIANT_STYLES[t.variant];
          return (
            <Pressable
              key={t.id}
              onPress={() => dismiss(t.id)}
              style={[styles.toast, { backgroundColor: style.bg }]}
              accessibilityRole="alert"
              accessibilityLabel={`${t.variant}: ${t.title}`}
            >
              <Text style={[styles.title, { color: style.fg }]} numberOfLines={2}>
                {t.title}
              </Text>
              {t.detail ? (
                <Text style={[styles.detail, { color: style.fg }]} numberOfLines={3}>
                  {t.detail}
                </Text>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
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
});
