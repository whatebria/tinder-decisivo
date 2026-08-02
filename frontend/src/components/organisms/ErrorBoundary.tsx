/**
 * Error boundary global. Atrapa errores de render en el arbol de componentes.
 *
 * NOTA: no atrapa errores en event handlers, async, o setTimeout - eso lo cubre
 * el toast global via `useToast()` en cada catch.
 *
 * Muestra un fallback minimalista con boton de reintento (recarga el arbol).
 * El fallback usa hooks de tema (dark/light) via el componente funcional interno.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "../../theme/useTheme";

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary atrapo:", error, info.componentStack);
  }

  handleReset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 400,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: { fontWeight: "700", fontSize: 15 },
});

function ErrorFallback({ error, onReset }: { error: Error; onReset: () => void }) {
  const c = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <Text style={styles.emoji}>!</Text>
      <Text style={[styles.title, { color: c.text }]}>Algo se rompio</Text>
      <Text style={[styles.message, { color: c.textSecondary }]}>{error.message}</Text>
      <Pressable
        style={[styles.button, { backgroundColor: c.primary }]}
        onPress={onReset}
        accessibilityRole="button"
        accessibilityLabel="Reintentar"
      >
        <Text style={[styles.buttonText, { color: c.textOnPrimary }]}>Reintentar</Text>
      </Pressable>
    </View>
  );
}
