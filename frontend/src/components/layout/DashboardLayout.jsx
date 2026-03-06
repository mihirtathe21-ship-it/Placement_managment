import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, FileText, BarChart2, Bell,
  Users, LogOut, Menu, X, ChevronRight, GraduationCap,
  Building2, Shield, Upload, Search
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV = {
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/student-dashboard' },
    { label: 'Browse Jobs', icon: Briefcase, path: '/jobs' },
    { label: 'My Applications', icon: FileText, path: '/applications' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
  ],
  tpo: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/tpo-dashboard' },
    { label: 'Drives', icon: Briefcase, path: '/jobs' },
    { label: 'Find Students', icon: Search, path: '/tpo-dashboard/students' },
    { label: 'Upload Data', icon: Upload, path: '/tpo-dashboard/upload' },
    { label: 'Analytics', icon: BarChart2, path: '/analytics' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
  ],
  recruiter: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/recruiter-dashboard' },
    { label: 'Post Drive', icon: Briefcase, path: '/jobs/new' },
    { label: 'My Drives', icon: FileText, path: '/recruiter-dashboard/drives' },
    { label: 'Candidates', icon: Users, path: '/recruiter-dashboard/candidates' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin-dashboard' },
    { label: 'Users', icon: Users, path: '/admin-dashboard/users' },
    { label: 'Drives', icon: Briefcase, path: '/jobs' },
    { label: 'Analytics', icon: BarChart2, path: '/analytics' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
  ],
}

const META = {
  student: { label: 'Student', color: 'from-blue-500 to-blue-700', Icon: GraduationCap },
  tpo: { label: 'TPO', color: 'from-emerald-500 to-emerald-700', Icon: Shield },
  recruiter: { label: 'Recruiter', color: 'from-violet-500 to-violet-700', Icon: Building2 },
  admin: { label: 'Admin', color: 'from-rose-500 to-rose-700', Icon: Shield },
}

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const nav = NAV[user?.role] || []
  const meta = META[user?.role] || META.student

  const handleLogout = () => { logout(); navigate('/login') }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">

      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center shadow`}>
            <meta.Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-gray-900 font-bold text-sm">PlaceNext</p>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest">{meta.label}</p>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center text-[11px] font-bold text-white`}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-gray-900 text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-gray-400 text-[10px] truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        {nav.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition ${
                active
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-blue-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-500 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-900">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-56 flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">

        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-20">
          <button onClick={() => setOpen(true)}>
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-bold text-gray-900">PlaceNext</span>
        </div>

        <main className="flex-1">
          {children}
        </main>

      </div>
    </div>
  )
}