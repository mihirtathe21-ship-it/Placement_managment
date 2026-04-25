import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, Clock, CheckCircle2, XCircle, AlertCircle,
  ArrowUpRight, RotateCcw, Calendar, Building2, Search
} from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  applied:     { label: 'Applied', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Clock },
  shortlisted: { label: 'Shortlisted', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: AlertCircle },
  interview:   { label: 'Interview', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200', icon: Calendar },
  selected:    { label: 'Selected', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  rejected:    { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: XCircle },
  withdrawn:   { label: 'Withdrawn', color: 'text-slate-500', bg: 'bg-slate-100 border-slate-200', icon: RotateCcw },
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [withdrawing, setWithdrawing] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterStatus) params.status = filterStatus
      const { data } = await api.get('/applications/my', { params })
      setApplications(data.applications)
    } catch {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchApplications() }, [filterStatus])

  const handleWithdraw = async (appId) => {
    if (!confirm('Withdraw this application?')) return
    setWithdrawing(appId)
    try {
      await api.patch(`/applications/${appId}/withdraw`)
      toast.success('Application withdrawn')
      fetchApplications()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw')
    } finally {
      setWithdrawing(null)
    }
  }

  const counts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
  }, {})

  const filteredApplications = applications.filter(app =>
    app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.job?.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <h1 className="text-xl font-semibold text-gray-900">My Applications</h1>
          <p className="text-gray-500 text-sm mt-1">{applications.length} total applications</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by job title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilterStatus('')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              !filterStatus
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({applications.length})
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(filterStatus === key ? '' : key)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                filterStatus === key
                  ? `${cfg.bg} ${cfg.color}`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cfg.label} ({counts[key] || 0})
            </button>
          ))}
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 animate-pulse">
                <div className="flex justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No applications found</p>
            {!searchTerm && (
              <Link to="/jobs" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
                Browse jobs →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map(app => {
              const cfg = STATUS_CONFIG[app.status]
              const Icon = cfg?.icon || Clock
              return (
                <div
                  key={app._id}
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-semibold shrink-0">
                          {app.job?.company?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {app.job?.title || 'Unknown Role'}
                          </h3>
                          <p className="text-gray-500 text-sm">{app.job?.company}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                            {app.job?.type && <span>{app.job.type}</span>}
                            {app.job?.package && <span className="text-emerald-600">{app.job.package}</span>}
                            {app.job?.location && <span>{app.job.location}</span>}
                          </div>
                          {app.currentRound && (
                            <p className="text-xs text-violet-600 mt-2">Round: {app.currentRound}</p>
                          )}
                          {app.offeredPackage && app.status === 'selected' && (
                            <p className="text-sm font-medium text-emerald-600 mt-2">Offer: {app.offeredPackage}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Applied {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex flex-col items-end gap-2">
                      <span className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg border ${cfg?.bg || ''}`}>
                        <Icon className={`w-3 h-3 ${cfg?.color || ''}`} />
                        <span className={cfg?.color}>{cfg?.label || app.status}</span>
                      </span>
                      {['applied', 'shortlisted'].includes(app.status) && (
                        <button
                          onClick={() => handleWithdraw(app._id)}
                          disabled={withdrawing === app._id}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                          {withdrawing === app._id ? 'Withdrawing...' : 'Withdraw'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Timeline */}
                  {app.statusHistory?.length > 1 && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 overflow-x-auto">
                        {app.statusHistory.map((h, i) => (
                          <div key={i} className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded ${STATUS_CONFIG[h.status]?.bg || 'bg-gray-100'}`}>
                              <span className={STATUS_CONFIG[h.status]?.color || 'text-gray-500'}>
                                {h.status}
                              </span>
                            </span>
                            {i < app.statusHistory.length - 1 && (
                              <ArrowUpRight className="w-3 h-3 text-gray-300" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}