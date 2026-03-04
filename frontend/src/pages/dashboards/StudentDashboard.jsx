import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, FileText, CheckCircle2, AlertCircle,
  ChevronRight, Star, ArrowUpRight, Clock, XCircle
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import toast from 'react-hot-toast'

const STATUS = {
  applied:     { text: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
  shortlisted: { text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  interview:   { text: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20' },
  selected:    { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  rejected:    { text: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
  withdrawn:   { text: 'text-gray-400',    bg: 'bg-gray-500/10 border-gray-500/20' },
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/jobs', { params: { status: 'active', limit: 5 } }),
      api.get('/applications/my'),
    ]).then(([j, a]) => {
      setJobs(j.data.jobs)
      setApps(a.data.applications)
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const counts = apps.reduce((a, x) => { a[x.status] = (a[x.status] || 0) + 1; return a }, {})
  const cgpaColor = !user?.cgpa ? 'text-white/40' : user.cgpa >= 8 ? 'text-emerald-400' : user.cgpa >= 6 ? 'text-amber-400' : 'text-red-400'

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Good day, <span className="text-blue-400">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {user?.branch} &middot; {user?.passingYear} Batch &middot; {user?.rollNumber}
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-center bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-3">
            <span className={`text-2xl font-bold ${cgpaColor}`}>{user?.cgpa ?? '—'}</span>
            <span className="text-white/30 text-[11px] mt-0.5">CGPA</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Applied',     val: apps.length,           icon: FileText,     c: 'text-blue-400',    b: 'bg-blue-500/10' },
            { label: 'Shortlisted', val: counts.shortlisted||0, icon: AlertCircle,  c: 'text-amber-400',   b: 'bg-amber-500/10' },
            { label: 'Selected',    val: counts.selected||0,    icon: CheckCircle2, c: 'text-emerald-400', b: 'bg-emerald-500/10' },
            { label: 'Active Drives',val: jobs.length,          icon: Briefcase,    c: 'text-blue-400',    b: 'bg-blue-500/10' },
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Drives */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white text-sm">Active Drives</h2>
              <Link to="/jobs" className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1">
                All jobs <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-white/[0.03] rounded-xl animate-pulse" />)}
              </div>
            ) : jobs.length === 0 ? (
              <p className="text-white/25 text-sm text-center py-8">No active drives</p>
            ) : (
              <div className="space-y-2">
                {jobs.map(job => (
                  <Link key={job._id} to="/jobs"
                    className="flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] rounded-xl p-3 transition-all group">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-300 shrink-0">
                      {job.company?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-white truncate">{job.title}</p>
                      <p className="text-[11px] text-white/40 truncate">{job.company} &middot; {job.package || job.stipend || 'TBD'}</p>
                    </div>
                    {job.applicationStatus ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS[job.applicationStatus]?.bg} ${STATUS[job.applicationStatus]?.text}`}>
                        {job.applicationStatus}
                      </span>
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-white/15 group-hover:text-white/40 transition-colors" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* My Applications */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white text-sm">My Applications</h2>
              <Link to="/applications" className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-white/[0.03] rounded-xl animate-pulse" />)}
              </div>
            ) : apps.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-white/25 text-sm">No applications yet</p>
                <Link to="/jobs" className="text-[11px] text-blue-400 hover:text-blue-300 mt-1.5 inline-block">
                  Browse jobs →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {apps.slice(0, 5).map(app => {
                  const s = STATUS[app.status]
                  return (
                    <div key={app._id} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
                      <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-sm font-bold text-white/30 shrink-0">
                        {app.job?.company?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-white truncate">{app.job?.title}</p>
                        <p className="text-[11px] text-white/40 truncate">{app.job?.company}</p>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium ${s?.bg} ${s?.text}`}>
                        {app.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Profile snapshot */}
        <div className="bg-gradient-to-br from-blue-900/20 to-transparent border border-blue-500/10 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Profile</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Branch',       val: user?.branch || '—' },
              { label: 'Passing Year', val: user?.passingYear || '—' },
              { label: 'CGPA',         val: user?.cgpa ?? '—' },
              { label: 'Roll Number',  val: user?.rollNumber || '—' },
            ].map(item => (
              <div key={item.label} className="bg-white/[0.04] rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-white/30 mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-white">{item.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}