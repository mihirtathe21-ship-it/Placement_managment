import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, User, GraduationCap,
  CheckCircle2, XCircle, Clock, AlertCircle, Star
} from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'
import StudentProfileModal from '../../components/ui/StudentProfileModal'

const STATUSES = ['applied', 'shortlisted', 'interview', 'selected', 'rejected']

const STATUS_COLORS = {
  applied:     'text-blue-700 bg-blue-50 border border-blue-200',
  shortlisted: 'text-amber-700 bg-amber-50 border border-amber-200',
  interview:   'text-violet-700 bg-violet-50 border border-violet-200',
  selected:    'text-emerald-700 bg-emerald-50 border border-emerald-200',
  rejected:    'text-red-600 bg-red-50 border border-red-200',
  withdrawn:   'text-slate-500 bg-slate-100 border border-slate-200',
}

const STATUS_ACTIVE = {
  applied:     'bg-blue-600 border-blue-600 text-white',
  shortlisted: 'bg-amber-500 border-amber-500 text-white',
  interview:   'bg-violet-600 border-violet-600 text-white',
  selected:    'bg-emerald-600 border-emerald-600 text-white',
  rejected:    'bg-red-500 border-red-500 text-white',
}

export default function ApplicantsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [applications, setApplications]   = useState([])
  const [job, setJob]                     = useState(null)
  const [loading, setLoading]             = useState(true)
  const [filterStatus, setFilterStatus]   = useState('')
  const [updating, setUpdating]           = useState(null)
  const [selectedApp, setSelectedApp]     = useState(null)   // for status update modal
  const [newStatus, setNewStatus]         = useState('')
  const [noteText, setNoteText]           = useState('')
  const [packageText, setPackageText]     = useState('')

  // ── NEW: profile modal state ──────────────────────────────────────────────
  const [profileStudent, setProfileStudent] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [jobRes, appsRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get(`/jobs/${id}/applicants`, {
          params: filterStatus ? { status: filterStatus } : {},
        }),
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
    <div className="min-h-screen bg-gray-50 text-slate-800">

      {/* ── Student Profile Modal ── */}
      {profileStudent && (
        <StudentProfileModal
          student={profileStudent}
          onClose={() => setProfileStudent(null)}
        />
      )}

      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1a2744]">
              {job ? `${job.company} — ${job.title}` : 'Applicants'}
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              {applications.length} applicants ·{' '}
              <span className="text-blue-500 font-medium">Click a name to view full profile</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterStatus('')}
            className={`text-xs px-4 py-2 rounded-xl border transition-all font-medium ${
              !filterStatus
                ? 'bg-[#1a2744] border-[#1a2744] text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            All ({applications.length})
          </button>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
              className={`text-xs px-4 py-2 rounded-xl border transition-all font-medium ${
                filterStatus === s
                  ? STATUS_ACTIVE[s]
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}{counts[s] ? ` (${counts[s]})` : ''}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse h-16" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-24">
            <User className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400">No applicants found</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs text-slate-400 font-semibold px-5 py-3 uppercase tracking-wide">Student</th>
                  <th className="text-left text-xs text-slate-400 font-semibold px-4 py-3 hidden sm:table-cell uppercase tracking-wide">Branch</th>
                  <th className="text-left text-xs text-slate-400 font-semibold px-4 py-3 hidden md:table-cell uppercase tracking-wide">CGPA</th>
                  <th className="text-left text-xs text-slate-400 font-semibold px-4 py-3 uppercase tracking-wide">Status</th>
                  {/* ── NEW column ── */}
                  <th className="text-left text-xs text-slate-400 font-semibold px-4 py-3 uppercase tracking-wide">Profile</th>
                  <th className="text-left text-xs text-slate-400 font-semibold px-4 py-3 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map(app => (
                  <tr key={app._id} className="hover:bg-slate-50 transition-colors">

                    {/* Name — clickable to open profile */}
                    <td
                      className="px-5 py-4 cursor-pointer"
                      onClick={() => setProfileStudent(app.student)}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                          {app.student?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1a2744] hover:text-blue-600 transition-colors leading-tight">
                            {app.student?.name}
                          </p>
                          <p className="text-xs text-slate-400">{app.student?.email}</p>
                          {app.student?.rollNumber && (
                            <p className="text-xs text-slate-300 font-mono">{app.student.rollNumber}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="text-xs text-slate-500">{app.student?.branch || '—'}</span>
                    </td>

                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className={`text-sm font-bold ${
                        app.student?.cgpa >= 8   ? 'text-emerald-600' :
                        app.student?.cgpa >= 6   ? 'text-amber-500'   : 'text-red-500'
                      }`}>
                        {app.student?.cgpa ?? '—'}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${STATUS_COLORS[app.status]}`}>
                        {app.status}
                      </span>
                      {app.currentRound && (
                        <p className="text-xs text-slate-400 mt-1">{app.currentRound}</p>
                      )}
                    </td>

                    {/* ── NEW: View Profile button ── */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setProfileStudent(app.student)}
                        className="flex items-center gap-1 text-[11px] text-[#1a2744] font-semibold border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 hover:text-blue-600 px-2.5 py-1.5 rounded-lg transition-all"
                      >
                        <GraduationCap className="w-3 h-3" />
                        View
                      </button>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() => { setSelectedApp(app); setNewStatus(app.status) }}
                        className="text-xs text-[#1a2744] hover:text-[#2d4a8a] font-semibold transition-colors underline underline-offset-2"
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

      {/* ── Status Update Modal ── */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-[#1a2744] text-lg mb-1">Update Application</h3>
            <p className="text-slate-400 text-sm mb-5">{selectedApp.student?.name}</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 font-semibold mb-2 block uppercase tracking-wide">
                  New Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewStatus(s)}
                      className={`text-xs py-2 rounded-lg border transition-all font-medium ${
                        newStatus === s
                          ? STATUS_ACTIVE[s]
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {newStatus === 'selected' && (
                <div>
                  <label className="text-xs text-slate-500 font-semibold mb-1.5 block uppercase tracking-wide">
                    Offered Package
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12 LPA"
                    value={packageText}
                    onChange={e => setPackageText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-slate-500 font-semibold mb-1.5 block uppercase tracking-wide">
                  Note (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Add a note for this update..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setSelectedApp(null)
                  setNewStatus('')
                  setNoteText('')
                  setPackageText('')
                }}
                className="flex-1 py-2.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!newStatus || updating}
                className="flex-1 py-2.5 text-sm bg-[#1a2744] hover:bg-[#243560] disabled:opacity-40 text-white font-semibold rounded-xl transition-all"
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
