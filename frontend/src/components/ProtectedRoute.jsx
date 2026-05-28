import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

/**
 * Wraps routes that require authentication.
 * Uses refreshToken as the source of truth — if it exists, the user is
 * considered logged in (the Axios interceptor will refresh the accessToken
 * if it has expired).
 */
export default function ProtectedRoute({ children }) {
  const refreshToken = useAuthStore((s) => s.refreshToken)
  if (!refreshToken) return <Navigate to="/" replace />
  return children
}
