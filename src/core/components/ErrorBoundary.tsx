import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from './AppText';
import { ActionButton } from './ActionButton';
import { FontSize, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Replaces the shared fallback UI when the host owns recovery presentation. */
  fallback?: React.ReactNode;
  onError?: (error: Error, componentStack?: string) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface FallbackViewProps {
  error: Error | null;
  onRetry: () => void;
}

// ─── Fallback UI (functional, can use hooks) ──────────────────────────────────

function FallbackView({ error, onRetry }: FallbackViewProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>页面出现错误</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{error?.message}</Text>
      <ActionButton onPress={onRetry}>重试</ActionButton>
    </View>
  );
}

// ─── Error Boundary (class component required by React) ───────────────────────

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.(error, info.componentStack ?? undefined);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback !== undefined
        ? this.props.fallback
        : <FallbackView error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSize.base,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
});
