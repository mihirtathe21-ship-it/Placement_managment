import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Briefcase, Users, Plus, ChevronRight, TrendingUp,
  CheckCircle2, Search, Trash2, BarChart2
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import toast from 'react-hot-toast'

const STATUS_STYLE = {
  active:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  upcoming:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  closed:    'bg-gray-500/10 text-gray-400 border-gray-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

function Home({ jobs, stats, loading }) {
  const { user } = useAuth()
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-white/40 text-sm mt-1">{user?.companyName} · Recruiter</p>
        </div>
        <Link to="/jobs/new"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shrink-0">
          <Plus className="w-4 h-4" />Post Drive
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'My Drives',    val: stats?.total ?? '—',       icon: Briefcase,    c: 'text-violet-400', b: 'bg-violet-500/10' },
          { label: 'Active',       val: stats?.active ?? '—',      icon: TrendingUp,   c: 'text-emerald-400',b: 'bg-emerald-500/10' },
          { label: 'Applicants',   val: stats?.applications ?? '—',icon: Users,        c: 'text-blue-400',   b: 'bg-blue-500/10' },
          { label: 'Hired',        val: stats?.hired ?? '—',       icon: CheckCircle2, c: 'text-amber-400',  b: 'bg-amber-500/10' },
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

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white text-sm">My Drives</h2>
          <Link to="/recruiter-dashboard/drives" className="text-[11px] text-violet-400 hover:text-violet-300 flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-10">
            <Briefcase className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-white/25 text-sm">No drives yet</p>
            <Link to="/jobs/new" className="text-[11px] text-violet-400 mt-1.5 inline-block">Post your first →</Link>
          </div>
        ) : jobs.slice(0, 4).map(job => (
          <div key={job._id} className="flex items-center gap-3 px-3 py-3 hover:bg-white/[0.03] border border-transparent hover:border-white/[0.05] rounded-xl transition-all">
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center text-sm font-bold text-violet-400">{job.company?.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate">{job.title}</p>
              <p className="text-[11px] text-white/40">{job.type} · {job.location}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_STYLE[job.status]}`}>{job.status}</span>
            <Link to={`/jobs/${job._id}/applicants`}
              className="text-[11px] text-violet-400 hover:text-violet-300 flex items-center gap-1 shrink-0">
              <Users className="w-3.5 h-3.5" />View
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

function MyDrives({ jobs, loading, onDelete }) {
  const [search, setSearch] = useState('')
  const filtered = jobs.filter(j =>
    !search || j.title?.toLowerCase().includes(search.toLowerCase()) || j.company?.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-white">My Drives</h2><p className="text-white/40 text-sm">{jobs.length} posted</p></div>
        <Link to="/jobs/new" className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all">
          <Plus className="w-3.5 h-3.5" />New
        </Link>
      </div>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
        <input type="text" placeholder="Search drives..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none" />
      </div>
      <div className="space-y-3">
        {loading ? [...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white/[0.03] border border-white/[0.05] rounded-2xl animate-pulse" />) :
          filtered.map(job => (
            <div key={job._id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-sm font-bold text-violet-400 shrink-0">{job.company?.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-white text-sm">{job.title}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_STYLE[job.status]}`}>{job.status}</span>
                </div>
                <p className="text-xs text-white/40 mt-0.5">{job.company} · {job.type} · {job.location}</p>
                {job.package && <p className="text-xs text-emerald-400 mt-0.5">{job.package}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link to={`/jobs/${job._id}/applicants`} className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />Applicants
                </Link>
                <button onClick={() => onDelete(job._id)} className="text-white/20 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const location = useLocation()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/jobs').then(async ({ data }) => {
      const mine = data.jobs.filter(j =>
        j.postedBy?._id === user?._id || j.postedBy === user?._id
      )
      setJobs(mine)
      // Quick stats from first few drives
      let apps = 0, hired = 0
      await Promise.all(mine.slice(0, 5).map(async j => {
        try {
          const r = await api.get(`/jobs/${j._id}/applicants`)
          apps += r.data.total
          hired += r.data.applications.filter(a => a.status === 'selected').length
        } catch {}
      }))
      setStats({ total: mine.length, active: mine.filter(j => j.status === 'active').length, applications: apps, hired })
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this drive?')) return
    try { await api.delete(`/jobs/${id}`); setJobs(p => p.filter(j => j._id !== id)); toast.success('Deleted') }
    catch { toast.error('Delete failed') }
  }

  const content = () => {
    if (location.pathname === '/recruiter-dashboard/drives') return <MyDrives jobs={jobs} loading={loading} onDelete={handleDelete} />
    return <Home jobs={jobs} stats={stats} loading={loading} />
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">{content()}</div>
    </DashboardLayout>
  )
}