import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { PrivateRoute, PublicRoute } from './components/auth/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import TPODashboard from './pages/dashboards/TPODashboard'
import StudentDashboard from './pages/dashboards/StudentDashboard'
import RecruiterDashboard from './pages/dashboards/RecruiterDashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e1c3a',
              color: '#e8e6f0',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: { iconTheme: { primary: '#6168f1', secondary: '#fff' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public routes (redirect if logged in) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Admin routes */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
          </Route>

          {/* TPO routes */}
          <Route element={<PrivateRoute allowedRoles={['tpo']} />}>
            <Route path="/tpo-dashboard" element={<TPODashboard />} />
            <Route path="/tpo-dashboard/*" element={<TPODashboard />} />
          </Route>

          {/* Student routes */}
          <Route element={<PrivateRoute allowedRoles={['student']} />}>
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/student-dashboard/*" element={<StudentDashboard />} />
          </Route>

          {/* Recruiter routes */}
          <Route element={<PrivateRoute allowedRoles={['recruiter']} />}>
            <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter-dashboard/*" element={<RecruiterDashboard />} />
          </Route>

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
