import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, User, Mail, Phone, GraduationCap,
  CheckCircle2, XCircle, Clock, AlertCircle, Star, Download
} from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'

const STATUSES = ['applied', 'shortlisted', 'interview', 'selected', 'rejected']
const STATUS_COLORS = {
  applied:     'text-blue-400 bg-blue-500/10',
  shortlisted: 'text-yellow-400 bg-yellow-500/10',
  interview:   'text-purple-400 bg-purple-500/10',
  selected:    'text-emerald-400 bg-emerald-500/10',
  rejected:    'text-red-400 bg-red-500/10',
  withdrawn:   'text-gray-400 bg-gray-500/10',
}

export default function ApplicantsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [updating, setUpdating] = useState(null)
  const [selectedApp, setSelectedApp] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [noteText, setNoteText] = useState('')
  const [packageText, setPackageText] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [jobRes, appsRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get(`/jobs/${id}/applicants`, { params: filterStatus ? { status: filterStatus } : {} }),
      ])
      setJob(jobRes.data.job)
      setApplications(appsRes.data.applications)
    } catch {
      toast.error('Failed to load applicants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id, filterStatus])

  const handleStatusUpdate = async () => {
    if (!selectedApp || !newStatus) return
    setUpdating(selectedApp._id)
    try {
      await api.patch(`/applications/${selectedApp._id}/status`, {
        status: newStatus,
        note: noteText,
        offeredPackage: packageText,
      })
      toast.success(`Status updated to ${newStatus}`)
      setSelectedApp(null)
      setNewStatus('')
      setNoteText('')
      setPackageText('')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setUpdating(null)
    }
  }

  const counts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0d1425]/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-white">
              {job ? `${job.company} — ${job.title}` : 'Applicants'}
            </h1>
            <p className="text-white/40 text-xs mt-0.5">{applications.length} applicants</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterStatus('')}
            className={`text-xs px-4 py-2 rounded-xl border transition-all ${!filterStatus ? 'bg-white/10 border-white/20 text-white' : 'bg-white/3 border-white/5 text-white/40 hover:border-white/10'}`}
          >
            All ({applications.length})
          </button>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
              className={`text-xs px-4 py-2 rounded-xl border transition-all ${filterStatus === s ? `${STATUS_COLORS[s]} border-current/20` : 'bg-white/3 border-white/5 text-white/40 hover:border-white/10'}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} {counts[s] ? `(${counts[s]})` : ''}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white/3 border border-white/5 rounded-xl p-4 animate-pulse h-16" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-24">
            <User className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40">No applicants found</p>
          </div>
        ) : (
          <div className="bg-white/3 border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs text-white/30 font-medium px-5 py-3">Student</th>
                  <th className="text-left text-xs text-white/30 font-medium px-4 py-3 hidden sm:table-cell">Branch</th>
                  <th className="text-left text-xs text-white/30 font-medium px-4 py-3 hidden md:table-cell">CGPA</th>
                  <th className="text-left text-xs text-white/30 font-medium px-4 py-3">Status</th>
                  <th className="text-left text-xs text-white/30 font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {applications.map(app => (
                  <tr key={app._id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">{app.student?.name}</p>
                        <p className="text-xs text-white/40">{app.student?.email}</p>
                        {app.student?.rollNumber && (
                          <p className="text-xs text-white/30">{app.student.rollNumber}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="text-xs text-white/50">{app.student?.branch || '—'}</span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className={`text-sm font-semibold ${
                        app.student?.cgpa >= 8 ? 'text-emerald-400' :
                        app.student?.cgpa >= 6 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {app.student?.cgpa ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${STATUS_COLORS[app.status]}`}>
                        {app.status}
                      </span>
                      {app.currentRound && (
                        <p className="text-xs text-white/30 mt-1">{app.currentRound}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => { setSelectedApp(app); setNewStatus(app.status) }}
                        className="text-xs text-navy-400 hover:text-navy-300 font-medium transition-colors"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1425] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-display font-bold text-white mb-1">Update Application</h3>
            <p className="text-white/40 text-sm mb-5">{selectedApp.student?.name}</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-2 block">New Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewStatus(s)}
                      className={`text-xs py-2 rounded-lg border transition-all ${
                        newStatus === s
                          ? `${STATUS_COLORS[s]} border-current/30 font-semibold`
                          : 'bg-white/5 border-white/10 text-white/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {newStatus === 'selected' && (
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Offered Package</label>
                  <input
                    type="text"
                    placeholder="e.g. 12 LPA"
                    value={packageText}
                    onChange={e => setPackageText(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Note (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Add a note for this update..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setSelectedApp(null); setNewStatus(''); setNoteText(''); setPackageText('') }}
                className="flex-1 py-2.5 text-sm bg-white/5 hover:bg-white/10 text-white/60 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!newStatus || updating}
                className="flex-1 py-2.5 text-sm bg-navy-500 hover:bg-navy-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}