import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, MapPin, Star, Search, Plus,
  ChevronRight, Users, Calendar, CheckCircle2, XCircle,
  TrendingUp, Award, Clock, Filter, LayoutGrid, List,
  Eye, Bookmark, BookmarkCheck, Sparkles, Zap, Shield,
  Building2, GraduationCap, DollarSign, Globe, Heart
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import toast from 'react-hot-toast'

const STATUS_STYLE = {
  active:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  upcoming:  'bg-blue-100 text-blue-700 border-blue-200',
  closed:    'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-red-100 text-red-600 border-red-200',
}

const APP_STYLE = {
  applied:     'bg-blue-100 text-blue-700',
  shortlisted: 'bg-amber-100 text-amber-700',
  interview:   'bg-violet-100 text-violet-700',
  selected:    'bg-emerald-100 text-emerald-700',
  rejected:    'bg-red-100 text-red-700',
  withdrawn:   'bg-gray-100 text-gray-600',
}

const STATUS_ICONS = {
  active:    Zap,
  upcoming:  Clock,
  closed:    XCircle,
  cancelled: XCircle,
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
  const [viewMode, setViewMode] = useState('grid')
  const [savedJobs, setSavedJobs] = useState([])

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

  const getDaysLeft = (lastDate) => {
    const deadline = new Date(lastDate)
    const today = new Date()
    const diffTime = deadline - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const stats = {
    active: jobs.filter(j => j.status === 'active').length,
    upcoming: jobs.filter(j => j.status === 'upcoming').length,
    closed: jobs.filter(j => j.status === 'closed').length,
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {isManagement ? 'Placement Drives' : 'Explore Opportunities'}
                </h1>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  {total} {total === 1 ? 'drive available' : 'drives available'}
                </p>
              </div>

              {isManagement && (
                <Link
                  to="/jobs/new"
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 shadow-lg"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Post New Drive
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </Link>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-xs">Active Drives</p>
                    <p className="text-2xl font-bold">{stats.active}</p>
                  </div>
                  <Zap className="w-8 h-8 text-white/30" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs">Upcoming</p>
                    <p className="text-2xl font-bold">{stats.upcoming}</p>
                  </div>
                  <Clock className="w-8 h-8 text-white/30" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-100 text-xs">Closed</p>
                    <p className="text-2xl font-bold">{stats.closed}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-white/30" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by company, role, or location..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-400 cursor-pointer"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={filterType}
                  onChange={e => { setFilterType(e.target.value); setPage(1) }}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-400 cursor-pointer"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                </select>

                <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(filterStatus || filterType) && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">Active Filters:</span>
                {filterStatus && (
                  <button
                    onClick={() => setFilterStatus('')}
                    className="text-xs flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg"
                  >
                    Status: {filterStatus}
                    <XCircle className="w-3 h-3" />
                  </button>
                )}
                {filterType && (
                  <button
                    onClick={() => setFilterType('')}
                    className="text-xs flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-600 rounded-lg"
                  >
                    Type: {filterType}
                    <XCircle className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => { setFilterStatus(''); setFilterType('') }}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Jobs Grid/List */}
          {loading ? (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 animate-pulse shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl shadow-lg">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">No drives found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-5`}>
              {jobs.map(job => {
                const eligible = isManagement ? true : isEligible(user, job)
                const daysLeft = job.lastDateToApply ? getDaysLeft(job.lastDateToApply) : null
                const StatusIcon = STATUS_ICONS[job.status]

                return (
                  <Link
                    key={job._id}
                    to={`/jobs/${job._id}`}
                    className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                      viewMode === 'list' ? 'flex' : ''
                    } ${!eligible && !isManagement ? 'opacity-75' : ''}`}
                  >
                    {/* Animated border on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl"></div>
                    
                    <div className={`relative bg-white rounded-2xl p-5 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      {/* Status Badge */}
                      <div className="absolute top-5 right-5">
                        <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border font-medium ${STATUS_STYLE[job.status]}`}>
                          {StatusIcon && <StatusIcon className="w-3 h-3" />}
                          {job.status}
                        </span>
                      </div>

                      {/* Company Icon */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {job.company?.charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Building2 className="w-3 h-3 text-gray-400" />
                            <p className="text-gray-500 text-xs">{job.company}</p>
                          </div>
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="flex flex-wrap gap-3 mb-3">
                        {job.type && (
                          <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                            <Briefcase className="w-3 h-3" />
                            {job.type}
                          </span>
                        )}
                        {job.location && (
                          <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                        )}
                        {(job.package || job.stipend) && (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                            <DollarSign className="w-3 h-3" />
                            {job.package || job.stipend}
                          </span>
                        )}
                      </div>

                      {/* Eligibility Tags */}
                      {job.eligibility?.minCGPA > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            CGPA ≥ {job.eligibility.minCGPA}
                          </span>
                          {job.eligibility.branches?.slice(0, 2).map(b => (
                            <span key={b} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              {b.split(' ')[0]}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Deadline */}
                      {job.lastDateToApply && (
                        <div className="flex items-center gap-1 text-xs mb-3">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className={daysLeft <= 3 ? 'text-red-500 font-semibold' : 'text-gray-500'}>
                            {daysLeft > 0 
                              ? `${daysLeft} day${daysLeft > 1 ? 's' : ''} left to apply`
                              : 'Deadline passed'}
                          </span>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {!isManagement ? (
                            job.applicationStatus ? (
                              <span className={`text-[10px] px-2.5 py-1 rounded-lg font-medium ${APP_STYLE[job.applicationStatus]}`}>
                                {job.applicationStatus}
                              </span>
                            ) : (
                              <span className={`flex items-center gap-1 text-xs font-medium ${eligible ? 'text-emerald-600' : 'text-red-600'}`}>
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
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Users className="w-3.5 h-3.5" />
                              {job.applicantCount || 0} Applicants
                            </span>
                          )}
                        </div>

                        <span className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-blue-600 transition-colors">
                          View Details
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
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
                className="px-5 py-2 text-sm bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 text-gray-700 rounded-xl transition-all font-medium"
              >
                Previous
              </button>
              
              <div className="flex gap-2">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        page === pageNum
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-5 py-2 text-sm bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 text-gray-700 rounded-xl transition-all font-medium"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}