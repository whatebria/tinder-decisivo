/**
 * Error boundary global. Atrapa errores de render en el arbol de componentes.
 *
 * NOTA: no atrapa errores en event handlers, async, o setTimeout — eso lo cubre
 * el toast global via `useToast()` en cada catch.
 *
 * Muestra un fallback minimalista con boton de reintento (recarga el arbol).
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";

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
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>!</Text>
          <Text style={styles.title}>Algo se rompio</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <Pressable
            style={styles.button}
            onPress={this.handleReset}
            accessibilityRole="button"
            accessibilityLabel="Reintentar"
          >
            <Text style={styles.buttonText}>Reintentar</Text>
          </Pressable>
        </View>
      );
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
    backgroundColor: colors.background,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 400,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
