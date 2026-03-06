import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Users, Briefcase, BarChart2, Search,
  ChevronRight, GraduationCap, Building2,
  UserCheck, UserX, Award
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../api'
import toast from 'react-hot-toast'

const ROLE_STYLE = {
  admin:     'bg-rose-100 text-rose-700 border border-rose-200',
  tpo:       'bg-emerald-100 text-emerald-700 border border-emerald-200',
  student:   'bg-blue-100 text-blue-700 border border-blue-200',
  recruiter: 'bg-violet-100 text-violet-700 border border-violet-200',
}

const ROLE_AVATAR = {
  admin:     'bg-rose-100 text-rose-700',
  tpo:       'bg-emerald-100 text-emerald-700',
  student:   'bg-blue-100 text-blue-700',
  recruiter: 'bg-violet-100 text-violet-700',
}

function Home({ summary, users, loading }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a2744]">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Full platform control and oversight</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Students',       val: summary?.totalStudents ?? '—',              icon: GraduationCap, iconColor: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100' },
          { label: 'Recruiters',     val: summary?.totalRecruiters ?? '—',            icon: Building2,     iconColor: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-100' },
          { label: 'Total Drives',   val: summary?.totalJobs ?? '—',                  icon: Briefcase,     iconColor: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Placement Rate', val: summary ? `${summary.placementRate}%` : '—', icon: Award,        iconColor: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100' },
        ].map(s => (
          <div key={s.label} className={`bg-white border ${s.border} rounded-2xl p-5 shadow-sm`}>
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.iconColor}`} />
            </div>
            <p className="text-2xl font-bold text-[#1a2744]">{loading ? '—' : s.val}</p>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Manage Users', icon: Users,     to: '/admin-dashboard/users', border: 'border-blue-200',    bg: 'bg-blue-50',    hover: 'hover:bg-blue-100',    text: 'text-blue-700',    chevron: 'text-blue-300' },
          { label: 'View Drives',  icon: Briefcase, to: '/jobs',                  border: 'border-emerald-200', bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100', text: 'text-emerald-700', chevron: 'text-emerald-300' },
          { label: 'Analytics',   icon: BarChart2,  to: '/analytics',             border: 'border-amber-200',   bg: 'bg-amber-50',   hover: 'hover:bg-amber-100',   text: 'text-amber-700',   chevron: 'text-amber-300' },
        ].map(a => (
          <Link key={a.label} to={a.to}
            className={`flex items-center gap-3 px-4 py-4 border ${a.border} ${a.bg} ${a.hover} rounded-2xl transition-all shadow-sm`}>
            <a.icon className={`w-5 h-5 ${a.text}`} />
            <span className={`text-sm font-semibold ${a.text}`}>{a.label}</span>
            <ChevronRight className={`w-4 h-4 ${a.chevron} ml-auto`} />
          </Link>
        ))}
      </div>

      {/* Recent Users */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#1a2744] text-sm">Recent Users</h2>
          <Link to="/admin-dashboard/users"
            className="text-[11px] text-[#1a2744] hover:text-blue-600 flex items-center gap-1 font-semibold transition-colors">
            Manage all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {loading
            ? [...Array(4)].map((_, i) => <div key={i} className="h-11 bg-slate-100 rounded-xl animate-pulse" />)
            : users.slice(0, 6).map(u => (
              <div key={u._id}
                className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold ${ROLE_AVATAR[u.role]}`}>
                  {u.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#1a2744] font-semibold truncate">{u.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${ROLE_STYLE[u.role]}`}>{u.role}</span>
                <div className={`w-2 h-2 rounded-full shrink-0 ${u.isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [toggling, setToggling] = useState(null)

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users', { params: role ? { role } : {} })
      setUsers(data.users)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [role])

  const toggle = async (id, current) => {
    setToggling(id)
    try {
      await api.patch(`/users/${id}/status`, { isActive: !current })
      setUsers(p => p.map(u => u._id === id ? { ...u, isActive: !current } : u))
      toast.success(`User ${!current ? 'activated' : 'deactivated'}`)
    } catch { toast.error('Failed') }
    finally { setToggling(null) }
  }

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#1a2744]">User Management</h2>
        <p className="text-slate-400 text-sm mt-0.5">{users.length} total users</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text" placeholder="Search users..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1a2744] placeholder-slate-400 focus:outline-none focus:border-[#1a2744] focus:bg-white transition-colors"
          />
        </div>
        <select
          value={role} onChange={e => setRole(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#1a2744] focus:outline-none focus:border-[#1a2744] transition-colors font-medium"
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="tpo">TPO</option>
          <option value="recruiter">Recruiters</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['User', 'Role', 'Phone', 'Status', 'Action'].map(h => (
                <th key={h}
                  className={`text-left text-[11px] text-slate-400 px-4 py-3 font-semibold uppercase tracking-wide ${h === 'Phone' ? 'hidden md:table-cell' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading
              ? [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-4 py-3">
                    <div className="h-8 bg-slate-100 rounded-lg animate-pulse" />
                  </td>
                </tr>
              ))
              : filtered.map(u => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold ${ROLE_AVATAR[u.role]}`}>
                        {u.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1a2744]">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${ROLE_STYLE[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-slate-500 font-medium">{u.phone || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      <span className={`text-xs font-semibold ${u.isActive ? 'text-emerald-600' : 'text-red-500'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle(u._id, u.isActive)}
                      disabled={toggling === u._id}
                      className={`flex items-center gap-1.5 text-xs font-semibold transition-colors disabled:opacity-40 px-3 py-1.5 rounded-lg border ${
                        u.isActive
                          ? 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'
                          : 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                      }`}>
                      {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      {toggling === u._id ? '...' : u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">No users found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const location = useLocation()
  const [summary, setSummary] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/summary'),
      api.get('/users', { params: { limit: 6 } }),
    ])
      .then(([s, u]) => { setSummary(s.data); setUsers(u.data.users) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const content = () => {
    if (location.pathname === '/admin-dashboard/users') return <UserManagement />
    return <Home summary={summary} users={users} loading={loading} />
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {content()}
      </div>
    </DashboardLayout>
  )
}
