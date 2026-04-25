import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, User, GraduationCap,
  CheckCircle2, XCircle, Clock, AlertCircle, Star,
  Filter, Download, Search, Eye, Mail, Briefcase,
  Calendar, Award, TrendingUp, Users, MessageSquare,
  Zap, Shield, Bookmark, Send, Phone, MapPin,
  Building2, DollarSign, Sparkles, Heart, ThumbsUp
} from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'
import StudentProfileModal from '../../components/ui/StudentProfileModal'

const STATUSES = ['applied', 'shortlisted', 'interview', 'selected', 'rejected']

const STATUS_COLORS = {
  applied:     'text-blue-700 bg-blue-50 border-blue-200',
  shortlisted: 'text-amber-700 bg-amber-50 border-amber-200',
  interview:   'text-violet-700 bg-violet-50 border-violet-200',
  selected:    'text-emerald-700 bg-emerald-50 border-emerald-200',
  rejected:    'text-red-600 bg-red-50 border-red-200',
}

const STATUS_ACTIVE = {
  applied:     'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md',
  shortlisted: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md',
  interview:   'bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-md',
  selected:    'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md',
  rejected:    'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md',
}

const STATUS_ICONS = {
  applied:     Clock,
  shortlisted: Star,
  interview:   MessageSquare,
  selected:    CheckCircle2,
  rejected:    XCircle,
}

export default function ApplicantsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [applications, setApplications]   = useState([])
  const [job, setJob]                     = useState(null)
  const [loading, setLoading]             = useState(true)
  const [filterStatus, setFilterStatus]   = useState('')
  const [updating, setUpdating]           = useState(null)
  const [selectedApp, setSelectedApp]     = useState(null)
  const [newStatus, setNewStatus]         = useState('')
  const [noteText, setNoteText]           = useState('')
  const [packageText, setPackageText]     = useState('')
  const [profileStudent, setProfileStudent] = useState(null)
  const [searchTerm, setSearchTerm]       = useState('')
  const [animateStats, setAnimateStats]   = useState(false)

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
      setTimeout(() => setAnimateStats(true), 100)
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

  const filteredApplications = applications.filter(app => 
    app.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.student?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCgpaColor = (cgpa) => {
    if (!cgpa) return 'text-gray-400'
    if (cgpa >= 8) return 'text-emerald-600'
    if (cgpa >= 6) return 'text-amber-600'
    return 'text-red-600'
  }

  const stats = [
    { label: 'Total Applicants', value: applications.length, icon: Users, color: 'blue' },
    { label: 'Shortlisted', value: counts.shortlisted || 0, icon: Star, color: 'amber' },
    { label: 'Selected', value: counts.selected || 0, icon: CheckCircle2, color: 'emerald' },
    { label: 'Rejected', value: counts.rejected || 0, icon: XCircle, color: 'red' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      
      {/* Student Profile Modal */}
      {profileStudent && (
        <StudentProfileModal
          student={profileStudent}
          onClose={() => setProfileStudent(null)}
        />
      )}

      {/* Header with Gradient */}
      <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="group text-white/70 hover:text-white transition-all hover:translate-x-[-2px] flex items-center gap-1"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Back to Job</span>
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">
                {job ? `${job.company} — ${job.title}` : 'Applicants Management'}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-blue-200 text-sm flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {applications.length} Total Applicants
                </p>
                <span className="text-gray-600">•</span>
                <p className="text-blue-200 text-sm flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {job?.openings || 0} Openings
                </p>
              </div>
            </div>
            <button 
              onClick={() => toast.success('Exporting applicants data...')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500 opacity-5 rounded-bl-full`}></div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 bg-${stat.color}-100 rounded-xl`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">
                    {animateStats ? stat.value : 0}
                  </span>
                </div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                {applications.length > 0 && (
                  <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-${stat.color}-500 rounded-full transition-all duration-1000`}
                      style={{ width: `${(stat.value / applications.length) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2 mt-5">
            <button
              onClick={() => setFilterStatus('')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                !filterStatus
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="flex items-center gap-2">
                All Applicants
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/20">
                  {applications.length}
                </span>
              </span>
            </button>
            {STATUSES.map((s) => {
              const StatusIcon = STATUS_ICONS[s]
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    filterStatus === s
                      ? STATUS_ACTIVE[s]
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {StatusIcon && <StatusIcon className="w-3.5 h-3.5" />}
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                  {counts[s] > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-200">
                      {counts[s]}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Applicants List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No applicants found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((app) => {
              const StatusIcon = STATUS_ICONS[app.status]
              return (
                <div 
                  key={app._id} 
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-x-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                  <div className="relative p-5">
                    <div className="flex flex-wrap gap-4 items-start justify-between">
                      
                      {/* Student Info */}
                      <div className="flex-1 min-w-[200px] cursor-pointer" onClick={() => setProfileStudent(app.student)}>
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                              {app.student?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            {app.status === 'selected' && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                            )}
                          </div>
                          <div>
                            <p className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {app.student?.name}
                            </p>
                            <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {app.student?.email}
                              </span>
                              {app.student?.rollNumber && (
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-3 h-3" />
                                  Roll: {app.student.rollNumber}
                                </span>
                              )}
                              {app.student?.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {app.student.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Branch & CGPA */}
                      <div className="flex items-center gap-4">
                        {app.student?.branch && (
                          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                            <GraduationCap className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-xs font-medium text-gray-600">{app.student.branch}</span>
                          </div>
                        )}
                        {app.student?.cgpa && (
                          <div className="text-center">
                            <div className={`text-xl font-bold ${getCgpaColor(app.student.cgpa)}`}>
                              {app.student.cgpa}
                            </div>
                            <div className="text-xs text-gray-400">CGPA</div>
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${STATUS_COLORS[app.status]}`}>
                          <span className="flex items-center gap-1.5">
                            {StatusIcon && <StatusIcon className="w-3 h-3" />}
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </div>
                        {app.currentRound && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Round: {app.currentRound}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setProfileStudent(app.student)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Profile
                        </button>
                        <button
                          onClick={() => { setSelectedApp(app); setNewStatus(app.status) }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-xs font-semibold transition-all hover:scale-105 shadow-md"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Update
                        </button>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {(app.note || app.offeredPackage || app.appliedDate) && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-4 text-xs">
                        {app.appliedDate && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Calendar className="w-3 h-3" />
                            Applied: {new Date(app.appliedDate).toLocaleDateString()}
                          </div>
                        )}
                        {app.offeredPackage && (
                          <div className="flex items-center gap-1">
                            <Award className="w-3 h-3 text-emerald-500" />
                            <span className="text-gray-500">Offered:</span>
                            <span className="font-semibold text-emerald-600">{app.offeredPackage}</span>
                          </div>
                        )}
                        {app.note && (
                          <div className="flex items-start gap-1 text-gray-500">
                            <MessageSquare className="w-3 h-3 mt-0.5" />
                            <span>{app.note}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform animate-scaleIn">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-lg">Update Application Status</h3>
                  <p className="text-gray-300 text-sm mt-1">{selectedApp.student?.name}</p>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase tracking-wide">
                  Select New Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {STATUSES.map((s) => {
                    const StatusIcon = STATUS_ICONS[s]
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewStatus(s)}
                        className={`text-xs py-2.5 rounded-lg border transition-all duration-200 font-medium ${
                          newStatus === s
                            ? STATUS_ACTIVE[s]
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          {StatusIcon && <StatusIcon className="w-3 h-3" />}
                          {s}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {newStatus === 'selected' && (
                <div className="animate-fadeIn">
                  <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wide">
                    Offered Package 💰
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 12 LPA"
                    value={packageText}
                    onChange={e => setPackageText(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wide">
                  Add Note (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Add a note for this update..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 p-5 pt-0">
              <button
                onClick={() => {
                  setSelectedApp(null)
                  setNewStatus('')
                  setNoteText('')
                  setPackageText('')
                }}
                className="flex-1 py-2.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!newStatus || updating}
                className="flex-1 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-md"
              >
                {updating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </span>
                ) : (
                  'Update Status'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}