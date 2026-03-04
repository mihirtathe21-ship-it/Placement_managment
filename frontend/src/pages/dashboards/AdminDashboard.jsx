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
  admin:     'bg-rose-500/10 text-rose-400',
  tpo:       'bg-emerald-500/10 text-emerald-400',
  student:   'bg-blue-500/10 text-blue-400',
  recruiter: 'bg-violet-500/10 text-violet-400',
}

function Home({ summary, users, loading }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Full platform control and oversight</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Students',       val: summary?.totalStudents ?? '—',     icon: GraduationCap, c: 'text-blue-400',    b: 'bg-blue-500/10' },
          { label: 'Recruiters',     val: summary?.totalRecruiters ?? '—',   icon: Building2,     c: 'text-violet-400',  b: 'bg-violet-500/10' },
          { label: 'Total Drives',   val: summary?.totalJobs ?? '—',         icon: Briefcase,     c: 'text-emerald-400', b: 'bg-emerald-500/10' },
          { label: 'Placement Rate', val: summary ? `${summary.placementRate}%` : '—', icon: Award, c: 'text-amber-400', b: 'bg-amber-500/10' },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
            <div className={`w-8 h-8 ${s.b} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.c}`} />
            </div>
            <p className="text-xl font-bold text-white">{loading ? '—' : s.val}</p>
            <p className="text-[11px] text-white/35 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Manage Users',   icon: Users,    to: '/admin-dashboard/users', color: 'border-blue-500/15 hover:bg-blue-500/5' },
          { label: 'View Drives',    icon: Briefcase,to: '/jobs',                  color: 'border-emerald-500/15 hover:bg-emerald-500/5' },
          { label: 'Analytics',      icon: BarChart2,to: '/analytics',             color: 'border-amber-500/15 hover:bg-amber-500/5' },
        ].map(a => (
          <Link key={a.label} to={a.to}
            className={`flex items-center gap-3 px-4 py-4 border rounded-2xl bg-white/[0.02] transition-all ${a.color}`}>
            <a.icon className="w-5 h-5 text-white/40" />
            <span className="text-sm font-medium text-white/60">{a.label}</span>
            <ChevronRight className="w-4 h-4 text-white/15 ml-auto" />
          </Link>
        ))}
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white text-sm">Recent Users</h2>
          <Link to="/admin-dashboard/users" className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1">
            Manage all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {loading ? [...Array(4)].map((_, i) => <div key={i} className="h-11 bg-white/[0.03] rounded-xl animate-pulse" />) :
            users.slice(0, 6).map(u => (
              <div key={u._id} className="flex items-center gap-3 px-3 py-2 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold ${ROLE_STYLE[u.role]}`}>
                  {u.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-white font-medium truncate">{u.name}</p>
                  <p className="text-[10px] text-white/30 truncate">{u.email}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ROLE_STYLE[u.role]}`}>{u.role}</span>
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${u.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
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

  const fetch = async () => {
    try {
      const { data } = await api.get('/users', { params: role ? { role } : {} })
      setUsers(data.users)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [role])

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
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold text-white">User Management</h2><p className="text-white/40 text-sm">{users.length} users</p></div>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none" />
        </div>
        <select value={role} onChange={e => setRole(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none">
          <option value="" className="bg-gray-900">All Roles</option>
          <option value="student" className="bg-gray-900">Students</option>
          <option value="tpo" className="bg-gray-900">TPO</option>
          <option value="recruiter" className="bg-gray-900">Recruiters</option>
          <option value="admin" className="bg-gray-900">Admins</option>
        </select>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['User', 'Role', 'Phone', 'Status', 'Action'].map(h => (
                <th key={h} className={`text-left text-[11px] text-white/25 px-4 py-3 font-medium ${h === 'Phone' ? 'hidden md:table-cell' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {loading ? [...Array(5)].map((_, i) => (
              <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-8 bg-white/[0.04] rounded animate-pulse" /></td></tr>
            )) : filtered.map(u => (
              <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold ${ROLE_STYLE[u.role]}`}>{u.name?.charAt(0)}</div>
                    <div><p className="text-[13px] font-medium text-white">{u.name}</p><p className="text-[10px] text-white/35">{u.email}</p></div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${ROLE_STYLE[u.role]}`}>{u.role}</span></td>
                <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs text-white/35">{u.phone || '—'}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <span className={`text-xs ${u.isActive ? 'text-emerald-400' : 'text-red-400'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(u._id, u.isActive)} disabled={toggling === u._id}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${u.isActive ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}`}>
                    {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    {toggling === u._id ? '...' : u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && <p className="text-center text-white/25 text-sm py-10">No users found</p>}
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
    Promise.all([api.get('/analytics/summary'), api.get('/users', { params: { limit: 6 } })])
      .then(([s, u]) => { setSummary(s.data); setUsers(u.data.users) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  const content = () => {
    if (location.pathname === '/admin-dashboard/users') return <UserManagement />
    return <Home summary={summary} users={users} loading={loading} />
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">{content()}</div>
    </DashboardLayout>
  )
}