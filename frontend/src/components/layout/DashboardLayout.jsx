import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, FileText, BarChart2, Bell,
  Users, LogOut, Menu, ChevronRight, GraduationCap,
  Building2, Shield, Upload, Search, Sparkles,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV = {
  student: [
    { label: 'Dashboard',       icon: LayoutDashboard, path: '/student-dashboard' },
    { label: 'Browse Jobs',     icon: Briefcase,        path: '/jobs' },
    { label: 'My Applications', icon: FileText,         path: '/applications' },
    { label: 'Prepare',         icon: Sparkles,         path: '/prepare',   highlight: true },
    { label: 'Notifications',   icon: Bell,             path: '/notifications' },
  ],
  tpo: [
    { label: 'Dashboard',     icon: LayoutDashboard, path: '/tpo-dashboard' },
    { label: 'Drives',        icon: Briefcase,        path: '/jobs' },
    { label: 'Find Students', icon: Search,           path: '/tpo-dashboard/students' },
    { label: 'Upload Data',   icon: Upload,           path: '/tpo-dashboard/upload' },
    { label: 'Analytics',     icon: BarChart2,        path: '/analytics' },
    { label: 'Notifications', icon: Bell,             path: '/notifications' },
  ],
  recruiter: [
    { label: 'Dashboard',     icon: LayoutDashboard, path: '/recruiter-dashboard' },
    { label: 'Post Drive',    icon: Briefcase,        path: '/jobs/new' },
    { label: 'My Drives',     icon: FileText,         path: '/recruiter-dashboard/drives' },
    { label: 'Candidates',    icon: Users,            path: '/recruiter-dashboard/candidates' },
    { label: 'Notifications', icon: Bell,             path: '/notifications' },
  ],
  admin: [
    { label: 'Dashboard',     icon: LayoutDashboard, path: '/admin-dashboard' },
    { label: 'Users',         icon: Users,            path: '/admin-dashboard/users' },
    { label: 'Drives',        icon: Briefcase,        path: '/jobs' },
    { label: 'Analytics',     icon: BarChart2,        path: '/analytics' },
    { label: 'Notifications', icon: Bell,             path: '/notifications' },
  ],
}

const META = {
  student:   { label: 'Student',   Icon: GraduationCap },
  tpo:       { label: 'TPO',       Icon: Shield        },
  recruiter: { label: 'Recruiter', Icon: Building2     },
  admin:     { label: 'Admin',     Icon: Shield        },
}

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const nav  = NAV[user?.role]  || []
  const meta = META[user?.role] || META.student

  const handleLogout = () => { logout(); navigate('/login') }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">

      {/* Brand — yellow top bar */}
      <div className="px-5 pt-6 pb-5 bg-[#FDE29A] border-b border-yellow-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
            <meta.Icon className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-900 font-bold text-sm">PlaceNext</p>
            <p className="text-yellow-800 text-[10px] uppercase tracking-widest">{meta.label}</p>
          </div>
        </div>
      </div>

      {/* User chip */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-[11px] font-bold text-white">
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
        {nav.map(({ label, icon: Icon, path, highlight }) => {
          const active = location.pathname === path || location.pathname.startsWith(path + '/')
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all
                ${active
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : highlight
                  ? 'text-gray-700 hover:bg-[#fffdf4] font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {highlight && !active && (
                <span className="ml-auto text-[9px] bg-[#FDE29A] text-gray-900 px-1.5 py-0.5 rounded-full font-semibold">
                  NEW
                </span>
              )}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-blue-200" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 transition"
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

      {/* Mobile overlay */}
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
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#FDE29A] border-b border-yellow-200 sticky top-0 z-20">
          <button onClick={() => setOpen(true)}>
            <Menu className="w-5 h-5 text-gray-900" />
          </button>
          <span className="font-bold text-gray-900">RCPIT</span>
        </div>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}