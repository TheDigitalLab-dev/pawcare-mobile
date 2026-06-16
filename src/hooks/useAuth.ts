/**
 * Hook de autenticación (F4). Fachada delgada sobre la sesión: expone el estado
 * (rol, usuario, si está autenticado) y las acciones de auth. La fuente de verdad
 * vive en `SessionProvider`; los tokens viven en SecureStore, nunca aquí.
 */
import { useSession } from '@/session/SessionProvider';

export function useAuth() {
  const session = useSession();

  return {
    status: session.status,
    role: session.role,
    user: session.user,
    isRestoring: session.status === 'restoring',
    isAuthenticated: session.role !== 'public',
    signIn: session.signIn,
    register: session.register,
    forgotPassword: session.forgotPassword,
    resetPassword: session.resetPassword,
    signOut: session.signOut,
  };
}
