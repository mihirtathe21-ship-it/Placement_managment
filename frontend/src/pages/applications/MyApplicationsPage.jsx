import { useState, useEffect } from 'react'
import {
  Briefcase, Clock, CheckCircle2, XCircle, AlertCircle,
  ArrowUpRight, RotateCcw, Filter, Calendar, Building2
} from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  applied:     { label: 'Applied',     color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',   icon: Clock },
  shortlisted: { label: 'Shortlisted', color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20', icon: AlertCircle },
  interview:   { label: 'Interview',   color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20', icon: Calendar },
  selected:    { label: 'Selected 🎉', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  rejected:    { label: 'Rejected',    color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',     icon: XCircle },
  withdrawn:   { label: 'Withdrawn',   color: 'text-gray-400',    bg: 'bg-gray-500/10 border-gray-500/20',   icon: RotateCcw },
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [withdrawing, setWithdrawing] = useState(null)

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

  // Summary counts
  const counts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0d1425]/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <h1 className="font-display text-xl font-bold text-white">My Applications</h1>
          <p className="text-white/40 text-xs mt-0.5">{applications.length} total applications</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Status Summary Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon
            return (
              <button
                key={key}
                onClick={() => setFilterStatus(filterStatus === key ? '' : key)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  filterStatus === key ? cfg.bg : 'bg-white/3 border-white/5 hover:border-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 mx-auto mb-1 ${filterStatus === key ? cfg.color : 'text-white/30'}`} />
                <div className={`text-lg font-bold ${filterStatus === key ? cfg.color : 'text-white/60'}`}>
                  {counts[key] || 0}
                </div>
                <div className="text-xs text-white/30 leading-tight">{cfg.label.replace(' 🎉', '')}</div>
              </button>
            )
          })}
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/3 border border-white/5 rounded-2xl p-5 animate-pulse">
                <div className="flex justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-white/10 rounded w-1/3" />
                    <div className="h-3 bg-white/5 rounded w-1/4" />
                  </div>
                  <div className="h-7 bg-white/10 rounded-lg w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-24">
            <Briefcase className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 font-medium">No applications yet</p>
            <p className="text-white/20 text-sm mt-1">Browse jobs and start applying</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map(app => {
              const cfg = STATUS_CONFIG[app.status]
              const Icon = cfg?.icon || Clock
              return (
                <div
                  key={app._id}
                  className={`bg-white/3 border rounded-2xl p-5 transition-all ${
                    app.status === 'selected' ? 'border-emerald-500/20 bg-emerald-500/3' : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-500/20 to-navy-700/20 border border-white/10 flex items-center justify-center text-sm font-bold text-navy-300 shrink-0">
                        {app.job?.company?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white text-sm">{app.job?.title || 'Unknown Role'}</h3>
                        <p className="text-white/50 text-xs mt-0.5">{app.job?.company}</p>
                        <div className="flex flex-wrap gap-3 mt-2">
                          {app.job?.type && (
                            <span className="text-xs text-white/30">{app.job.type}</span>
                          )}
                          {app.job?.package && (
                            <span className="text-xs text-emerald-400/70">{app.job.package}</span>
                          )}
                          {app.job?.location && (
                            <span className="text-xs text-white/30">{app.job.location}</span>
                          )}
                        </div>
                        {app.currentRound && (
                          <div className="mt-2 text-xs text-purple-400">
                            Current Round: {app.currentRound}
                          </div>
                        )}
                        {app.offeredPackage && app.status === 'selected' && (
                          <div className="mt-2 text-sm font-semibold text-emerald-400">
                            Offer: {app.offeredPackage}
                          </div>
                        )}
                        <p className="text-white/20 text-xs mt-2">
                          Applied {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium ${cfg?.bg || ''}`}>
                        <Icon className={`w-3 h-3 ${cfg?.color || ''}`} />
                        <span className={cfg?.color}>{cfg?.label || app.status}</span>
                      </span>
                      {['applied', 'shortlisted'].includes(app.status) && (
                        <button
                          onClick={() => handleWithdraw(app._id)}
                          disabled={withdrawing === app._id}
                          className="text-xs text-white/20 hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                          {withdrawing === app._id ? 'Withdrawing...' : 'Withdraw'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status history timeline (collapsed) */}
                  {app.statusHistory?.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {app.statusHistory.map((h, i) => (
                          <div key={i} className="flex items-center gap-2 shrink-0">
                            <div className={`text-xs px-2 py-0.5 rounded ${STATUS_CONFIG[h.status]?.bg || 'bg-white/5'}`}>
                              <span className={STATUS_CONFIG[h.status]?.color || 'text-white/40'}>{h.status}</span>
                            </div>
                            {i < app.statusHistory.length - 1 && (
                              <span className="text-white/20 text-xs">→</span>
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