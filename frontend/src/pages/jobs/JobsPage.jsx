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
  active:    'bg-emerald-100 text-emerald-600 border-emerald-200',
  upcoming:  'bg-blue-100 text-blue-600 border-blue-200',
  closed:    'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-red-100 text-red-600 border-red-200',
}

const APP_STYLE = {
  applied:     'bg-blue-100 text-blue-600',
  shortlisted: 'bg-amber-100 text-amber-600',
  interview:   'bg-violet-100 text-violet-600',
  selected:    'bg-emerald-100 text-emerald-600',
  rejected:    'bg-red-100 text-red-600',
  withdrawn:   'bg-gray-100 text-gray-600',
}

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
      if (search) params.search = search
      if (filterStatus) params.status = filterStatus
      if (filterType) params.type = filterType
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
            <h1 className="text-2xl font-bold text-gray-900">
              {isManagement ? 'Placement Drives' : 'Job Opportunities'}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">{total} drives available</p>
          </div>

          {isManagement && (
            <Link
              to="/jobs/new"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              <Plus className="w-4 h-4" />
              Post Drive
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">

          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              type="text"
              placeholder="Search company or role..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none"
          >
            <option>All Status</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={filterType}
            onChange={e => { setFilterType(e.target.value); setPage(1) }}
            className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>

        </div>

        {/* Grid */}
        {loading ? (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-52 bg-gray-100 border border-gray-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>

        ) : jobs.length === 0 ? (

          <div className="text-center py-24">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400">No drives found</p>
          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {jobs.map(job => {

              const eligible = isManagement ? true : isEligible(user, job)

              return (

                <Link
                  key={job._id}
                  to={`/jobs/${job._id}`}
                  className={`group flex flex-col bg-white hover:bg-gray-50 border rounded-2xl p-5 transition-all duration-200 ${
                    !eligible && !isManagement
                      ? 'border-red-200 opacity-70'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >

                  {/* Top */}
                  <div className="flex items-start justify-between mb-3">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-sm font-bold text-blue-600 shrink-0">
                        {job.company?.charAt(0)}
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900 text-sm leading-tight">
                          {job.title}
                        </p>

                        <p className="text-gray-500 text-xs mt-0.5">
                          {job.company}
                        </p>
                      </div>

                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${STATUS_STYLE[job.status]}`}>
                      {job.status}
                    </span>

                  </div>

                  {/* Details */}

                  <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">

                    <span className="text-[11px] text-gray-500">
                      {job.type}
                    </span>

                    {job.location && (
                      <span className="flex items-center gap-1 text-[11px] text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                    )}

                    {(job.package || job.stipend) && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                        <Star className="w-3 h-3" />
                        {job.package || job.stipend}
                      </span>
                    )}

                  </div>

                  {/* Eligibility */}

                  {job.eligibility?.minCGPA > 0 && (

                    <div className="flex flex-wrap gap-1.5 mb-3">

                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        CGPA ≥ {job.eligibility.minCGPA}
                      </span>

                      {job.eligibility.branches?.slice(0, 2).map(b => (

                        <span
                          key={b}
                          className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                        >
                          {b.split(' ')[0]}
                        </span>

                      ))}

                    </div>

                  )}

                  {/* Last date */}

                  {job.lastDateToApply && (

                    <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-3">
                      <Calendar className="w-3 h-3" />
                      Apply by {new Date(job.lastDateToApply).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>

                  )}

                  {/* Footer */}

                  <div className="mt-auto pt-3 border-t border-gray-200 flex items-center justify-between">

                    {!isManagement && (

                      job.applicationStatus ? (

                        <span className={`text-[10px] px-2.5 py-1 rounded-lg font-medium ${APP_STYLE[job.applicationStatus]}`}>
                          {job.applicationStatus}
                        </span>

                      ) : (

                        <span className={`flex items-center gap-1 text-[11px] font-medium ${
                          eligible ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {eligible ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Eligible
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              Not Eligible
                            </>
                          )}
                        </span>

                      )

                    )}

                    {isManagement && (

                      <span className="flex items-center gap-1 text-[11px] text-gray-500">
                        <Users className="w-3 h-3" />
                        Applicants
                      </span>

                    )}

                    <span className="flex items-center gap-0.5 text-[11px] text-gray-400 group-hover:text-gray-700 transition-colors">
                      View details
                      <ChevronRight className="w-3.5 h-3.5" />
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

            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-30 text-gray-800 rounded-xl transition-all"
            >
              Previous
            </button>

            <span className="text-gray-500 text-sm">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-30 text-gray-800 rounded-xl transition-all"
            >
              Next
            </button>

          </div>

        )}

      </div>
    </DashboardLayout>
  )
}