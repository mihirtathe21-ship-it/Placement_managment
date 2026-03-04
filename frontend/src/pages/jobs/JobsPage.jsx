import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, MapPin, Star, Search, Plus,
  ChevronRight, Users, Calendar, CheckCircle2, XCircle
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

const APP_STYLE = {
  applied:     'bg-blue-500/15 text-blue-300',
  shortlisted: 'bg-amber-500/15 text-amber-300',
  interview:   'bg-violet-500/15 text-violet-300',
  selected:    'bg-emerald-500/15 text-emerald-300',
  rejected:    'bg-red-500/15 text-red-300',
  withdrawn:   'bg-gray-500/15 text-gray-400',
}

// Quick eligibility check for card badge
function isEligible(user, job) {
  if (!job.eligibility) return true
  const el = job.eligibility
  if (el.minCGPA > 0 && user.cgpa < el.minCGPA) return false
  if (el.branches?.length > 0 && !el.branches.includes(user.branch)) return false
  if (el.passingYear?.length > 0 && !el.passingYear.includes(Number(user.passingYear))) return false
  return true
}

export default function JobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const isManagement = ['admin', 'tpo', 'recruiter'].includes(user?.role)

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12 }
      if (search)       params.search = search
      if (filterStatus) params.status = filterStatus
      if (filterType)   params.type   = filterType
      const { data } = await api.get('/jobs', { params })
      setJobs(data.jobs)
      setTotalPages(data.pages)
      setTotal(data.total)
    } catch {
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [page, filterStatus, filterType])
  useEffect(() => {
    const t = setTimeout(fetchJobs, 400)
    return () => clearTimeout(t)
  }, [search])

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isManagement ? 'Placement Drives' : 'Job Opportunities'}
            </h1>
            <p className="text-white/40 text-sm mt-0.5">{total} drives available</p>
          </div>
          {isManagement && (
            <Link to="/jobs/new"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
              <Plus className="w-4 h-4" />Post Drive
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input type="text" placeholder="Search company or role..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500/40" />
          </div>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none">
            <option value="" className="bg-gray-900">All Status</option>
            <option value="active"   className="bg-gray-900">Active</option>
            <option value="upcoming" className="bg-gray-900">Upcoming</option>
            <option value="closed"   className="bg-gray-900">Closed</option>
          </select>
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }}
            className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none">
            <option value=""           className="bg-gray-900">All Types</option>
            <option value="full-time"  className="bg-gray-900">Full-time</option>
            <option value="internship" className="bg-gray-900">Internship</option>
            <option value="contract"   className="bg-gray-900">Contract</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-52 bg-white/[0.03] border border-white/[0.05] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-24">
            <Briefcase className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30">No drives found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map(job => {
              const eligible = isManagement ? true : isEligible(user, job)
              return (
                <Link key={job._id} to={`/jobs/${job._id}`}
                  className={`group flex flex-col bg-white/[0.03] hover:bg-white/[0.05] border rounded-2xl p-5 transition-all duration-200 ${
                    !eligible && !isManagement ? 'border-red-500/10 opacity-70' : 'border-white/[0.06] hover:border-white/[0.10]'
                  }`}>

                  {/* Top */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-700/10 border border-blue-500/15 flex items-center justify-center text-sm font-bold text-blue-300 shrink-0">
                        {job.company?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm leading-tight">{job.title}</p>
                        <p className="text-white/45 text-xs mt-0.5">{job.company}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${STATUS_STYLE[job.status]}`}>
                      {job.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                    <span className="text-[11px] text-white/35">{job.type}</span>
                    {job.location && <span className="flex items-center gap-1 text-[11px] text-white/35"><MapPin className="w-3 h-3" />{job.location}</span>}
                    {(job.package || job.stipend) && <span className="flex items-center gap-1 text-[11px] text-emerald-400"><Star className="w-3 h-3" />{job.package || job.stipend}</span>}
                  </div>

                  {/* Eligibility criteria chips */}
                  {job.eligibility?.minCGPA > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="text-[10px] bg-white/[0.04] text-white/40 px-2 py-0.5 rounded-full">
                        CGPA ≥ {job.eligibility.minCGPA}
                      </span>
                      {job.eligibility.branches?.slice(0, 2).map(b => (
                        <span key={b} className="text-[10px] bg-white/[0.04] text-white/40 px-2 py-0.5 rounded-full">{b.split(' ')[0]}</span>
                      ))}
                    </div>
                  )}

                  {/* Last date */}
                  {job.lastDateToApply && (
                    <div className="flex items-center gap-1 text-[11px] text-white/30 mb-3">
                      <Calendar className="w-3 h-3" />
                      Apply by {new Date(job.lastDateToApply).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-auto pt-3 border-t border-white/[0.05] flex items-center justify-between">
                    {/* Student: eligibility badge or app status */}
                    {!isManagement && (
                      job.applicationStatus ? (
                        <span className={`text-[10px] px-2.5 py-1 rounded-lg font-medium ${APP_STYLE[job.applicationStatus]}`}>
                          {job.applicationStatus}
                        </span>
                      ) : (
                        <span className={`flex items-center gap-1 text-[11px] font-medium ${eligible ? 'text-emerald-400' : 'text-red-400'}`}>
                          {eligible
                            ? <><CheckCircle2 className="w-3.5 h-3.5" />Eligible</>
                            : <><XCircle className="w-3.5 h-3.5" />Not Eligible</>
                          }
                        </span>
                      )
                    )}

                    {/* Management: applicant count */}
                    {isManagement && (
                      <span className="flex items-center gap-1 text-[11px] text-white/30">
                        <Users className="w-3 h-3" />Applicants
                      </span>
                    )}

                    <span className="flex items-center gap-0.5 text-[11px] text-white/25 group-hover:text-white/50 transition-colors">
                      View details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 text-sm bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 text-white rounded-xl transition-all">
              Previous
            </button>
            <span className="text-white/35 text-sm">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 text-sm bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 text-white rounded-xl transition-all">
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}