import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProtectedRoute  from './components/ProtectedRoute'
import AuthPage        from './pages/AuthPage'
import HomePage        from './pages/HomePage'
import RoomPage        from './pages/RoomPage'
import CabinetPage     from './pages/CabinetPage'
import SettingsPage    from './pages/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<AuthPage />} />

          {/* Protected */}
          <Route path="/home"     element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/room"     element={<ProtectedRoute><RoomPage /></ProtectedRoute>} />
          <Route path="/cabinet"  element={<ProtectedRoute><CabinetPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
