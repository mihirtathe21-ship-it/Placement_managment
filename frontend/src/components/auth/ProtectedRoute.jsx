import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ROLE_PATHS = {
  admin: '/admin-dashboard',
  tpo: '/tpo-dashboard',
  student: '/student-dashboard',
  recruiter: '/recruiter-dashboard',
}

export function PrivateRoute({ allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-navy-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm font-body">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_PATHS[user.role] || '/login'} replace />
  }

  return <Outlet />
}

export function PublicRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-navy-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    const path = ROLE_PATHS[user.role] || '/login'
    return <Navigate to={path} replace />
  }

  return <Outlet />
}
