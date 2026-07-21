import { Component, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { config } from '@/config/env';

/**
 * Barrera de errores raíz: una excepción de render no puede dejar la app en
 * pantalla blanca. Muestra un mensaje legible y permite reintentar (re-monta el
 * árbol). Vive FUERA de los providers (tema incluido) a propósito — debe
 * funcionar aunque un provider sea el que falló — por eso usa colores fijos.
 */
interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    // Punto único para crash reporting (Sentry/Bugsnag) cuando se configure.
    if (config.isDev) console.error('ErrorBoundary:', error);
  }

  private reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>🐾</Text>
        <Text style={styles.title}>Algo salió mal</Text>
        <Text style={styles.body}>
          La aplicación encontró un error inesperado. Tus datos locales están a salvo.
        </Text>
        {config.isDev ? (
          <Text style={styles.detail} numberOfLines={4}>
            {this.state.error.message}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reintentar"
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={this.reset}
        >
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
    backgroundColor: '#f5f8f7',
  },
  emoji: { fontSize: 48 },
  title: { fontSize: 20, fontWeight: '700', color: '#1c2b3a' },
  body: { fontSize: 15, color: '#3d5166', textAlign: 'center', lineHeight: 22 },
  detail: { fontSize: 12, color: '#8a2020', textAlign: 'center' },
  button: {
    marginTop: 8,
    backgroundColor: '#0e7268',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
