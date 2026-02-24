import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, Briefcase, FileText, Settings,
  LogOut, Menu, X, ChevronRight, Bell, Briefcase as Logo
} from 'lucide-react'

const NAV_LINKS = {
  admin: [
    { path: '/admin-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin-dashboard/users', icon: Users, label: 'Users' },
    { path: '/admin-dashboard/reports', icon: FileText, label: 'Reports' },
    { path: '/admin-dashboard/settings', icon: Settings, label: 'Settings' },
  ],
  tpo: [
    { path: '/tpo-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tpo-dashboard/students', icon: Users, label: 'Students' },
    { path: '/tpo-dashboard/drives', icon: Briefcase, label: 'Placement Drives' },
    { path: '/tpo-dashboard/reports', icon: FileText, label: 'Reports' },
  ],
  student: [
    { path: '/student-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/student-dashboard/jobs', icon: Briefcase, label: 'Job Listings' },
    { path: '/student-dashboard/applications', icon: FileText, label: 'My Applications' },
    { path: '/student-dashboard/profile', icon: Users, label: 'Profile' },
  ],
  recruiter: [
    { path: '/recruiter-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/recruiter-dashboard/post', icon: Briefcase, label: 'Post Jobs' },
    { path: '/recruiter-dashboard/candidates', icon: Users, label: 'Candidates' },
    { path: '/recruiter-dashboard/reports', icon: FileText, label: 'Reports' },
  ],
}

const ROLE_COLORS = {
  admin: 'from-red-500/20 to-orange-500/20 border-red-500/20 text-red-300',
  tpo: 'from-purple-500/20 to-blue-500/20 border-purple-500/20 text-purple-300',
  student: 'from-navy-500/20 to-cyan-500/20 border-navy-500/20 text-navy-300',
  recruiter: 'from-green-500/20 to-teal-500/20 border-green-500/20 text-green-300',
}

export default function DashboardLayout({ children, title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const links = NAV_LINKS[user?.role] || []
  const roleColor = ROLE_COLORS[user?.role] || ''

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen mesh-bg flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 glass-card rounded-none border-r border-white/5
        transform transition-transform duration-300 flex flex-col
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-navy-400 to-navy-600 rounded-xl flex items-center justify-center">
              <Logo className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-white text-lg leading-none">PlaceNext</span>
              <p className="text-white/30 text-xs mt-0.5">Portal</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-white/3 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-400 to-navy-600 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-white/40 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <div className={`mt-3 inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wide bg-gradient-to-r border ${roleColor}`}>
            {user?.role}
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {links.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path.split('/').length === 2}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-navy-500/25 text-white border border-navy-400/20'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 glass-card rounded-none border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 text-white/30 text-sm">
              <span>PlaceNext</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">{title || 'Dashboard'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-navy-400 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-400 to-navy-600 flex items-center justify-center font-bold text-xs text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
