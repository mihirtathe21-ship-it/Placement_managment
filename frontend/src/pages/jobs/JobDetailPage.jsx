import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Briefcase, MapPin, Star, Calendar, Users, ChevronLeft,
  CheckCircle2, XCircle, AlertCircle, Clock, Building2,
  GraduationCap, Zap, Hash, BookOpen, FileText, Send
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import toast from 'react-hot-toast'

const STATUS_STYLE = {
  applied:     { text: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
  shortlisted: { text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  interview:   { text: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20' },
  selected:    { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  rejected:    { text: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
  withdrawn:   { text: 'text-gray-400',    bg: 'bg-gray-500/10 border-gray-500/20' },
}

// Check if student meets ALL eligibility criteria
function checkEligibility(user, job) {
  const reasons = []
  const el = job.eligibility || {}

  // CGPA check
  if (el.minCGPA > 0) {
    if (!user.cgpa) {
      reasons.push({ field: 'CGPA', required: `≥ ${el.minCGPA}`, yours: 'Not set', pass: false })
    } else {
      reasons.push({
        field: 'CGPA',
        required: `≥ ${el.minCGPA}`,
        yours: user.cgpa,
        pass: user.cgpa >= el.minCGPA,
      })
    }
  }

  // Branch check
  if (el.branches?.length > 0) {
    reasons.push({
      field: 'Branch',
      required: el.branches.join(', '),
      yours: user.branch || 'Not set',
      pass: el.branches.includes(user.branch),
    })
  }

  // Passing year check
  if (el.passingYear?.length > 0) {
    reasons.push({
      field: 'Passing Year',
      required: el.passingYear.join(' or '),
      yours: user.passingYear || 'Not set',
      pass: el.passingYear.includes(Number(user.passingYear)),
    })
  }

  const eligible = reasons.every(r => r.pass)
  return { eligible, reasons }
}

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [applicationStatus, setApplicationStatus] = useState(null)
  const [applicantCount, setApplicantCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isStudent = user?.role === 'student'
  const isManagement = ['tpo', 'recruiter', 'admin'].includes(user?.role)

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then(({ data }) => {
        setJob(data.job)
        setApplicationStatus(data.applicationStatus)
        setApplicantCount(data.applicantCount)
      })
      .catch(() => toast.error('Failed to load job'))
      .finally(() => setLoading(false))
  }, [id])

  const handleApply = async () => {
    setSubmitting(true)
    try {
      await api.post('/applications', { jobId: id, coverLetter })
      setApplicationStatus('applied')
      setApplicantCount(c => c + 1)
      setShowForm(false)
      toast.success('Application submitted successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white/[0.03] rounded-2xl animate-pulse" />)}
      </div>
    </DashboardLayout>
  )

  if (!job) return (
    <DashboardLayout>
      <div className="p-8 text-center text-white/40">Job not found.</div>
    </DashboardLayout>
  )

  const { eligible, reasons } = isStudent ? checkEligibility(user, job) : { eligible: true, reasons: [] }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm">
          <ChevronLeft className="w-4 h-4" /> Back to Jobs
        </button>

        {/* Header Card */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-700/10 border border-blue-500/20 flex items-center justify-center text-xl font-bold text-blue-300">
                {job.company?.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{job.title}</h1>
                <p className="text-white/50 text-sm mt-0.5">{job.company}</p>
                <div className="flex flex-wrap gap-3 mt-2">
                  {job.location && (
                    <span className="flex items-center gap-1 text-xs text-white/40"><MapPin className="w-3 h-3" />{job.location}</span>
                  )}
                  {job.type && (
                    <span className="flex items-center gap-1 text-xs text-white/40"><Briefcase className="w-3 h-3" />{job.type}</span>
                  )}
                  {(job.package || job.stipend) && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400"><Star className="w-3 h-3" />{job.package || job.stipend}</span>
                  )}
                  {job.openings && (
                    <span className="flex items-center gap-1 text-xs text-white/40"><Users className="w-3 h-3" />{job.openings} opening{job.openings > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${
                job.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                job.status === 'upcoming' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                'bg-gray-500/10 text-gray-400 border-gray-500/20'
              }`}>{job.status}</span>
              {isManagement && (
                <Link to={`/jobs/${id}/applicants`}
                  className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-medium">
                  <Users className="w-3.5 h-3.5" />
                  {applicantCount} Applicants
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — main info */}
          <div className="lg:col-span-2 space-y-5">

            {/* Description */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
              <h2 className="font-semibold text-white text-sm mb-3">About the Role</h2>
              <p className="text-white/55 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>

            {/* Skills */}
            {job.skills?.length > 0 && (
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
                <h2 className="font-semibold text-white text-sm mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map(s => (
                    <span key={s} className="text-xs bg-white/[0.05] text-white/60 px-3 py-1.5 rounded-lg">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Interview Rounds */}
            {job.rounds?.length > 0 && (
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
                <h2 className="font-semibold text-white text-sm mb-3">Interview Rounds</h2>
                <div className="space-y-2">
                  {job.rounds.map((r, i) => (
                    <div key={r} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <span className="text-sm text-white/60">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STUDENT: Eligibility Check ── */}
            {isStudent && reasons.length > 0 && (
              <div className={`border rounded-2xl p-5 ${eligible ? 'bg-emerald-500/[0.04] border-emerald-500/20' : 'bg-red-500/[0.04] border-red-500/20'}`}>
                <div className="flex items-center gap-2 mb-4">
                  {eligible
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    : <XCircle className="w-5 h-5 text-red-400" />
                  }
                  <h2 className="font-semibold text-white text-sm">
                    {eligible ? 'You are eligible to apply!' : 'You do not meet the eligibility criteria'}
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {reasons.map(r => (
                    <div key={r.field} className="flex items-center justify-between gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        {r.pass
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          : <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                        }
                        <span className="text-white/60">{r.field}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-right">
                        <span className="text-white/30">Required: <span className="text-white/60">{r.required}</span></span>
                        <span className={r.pass ? 'text-emerald-400' : 'text-red-400'}>
                          Yours: {r.yours}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {!eligible && (
                  <p className="text-xs text-red-400/70 mt-4 bg-red-500/[0.06] rounded-xl px-3 py-2">
                    Contact your TPO if you believe this is incorrect or to request an exception.
                  </p>
                )}
              </div>
            )}

            {/* ── STUDENT: Application Form or Status ── */}
            {isStudent && (
              <div>
                {applicationStatus ? (
                  // Already applied — show status
                  <div className={`flex items-center gap-3 p-4 rounded-2xl border ${STATUS_STYLE[applicationStatus]?.bg}`}>
                    <CheckCircle2 className={`w-5 h-5 ${STATUS_STYLE[applicationStatus]?.text}`} />
                    <div>
                      <p className="text-white font-semibold text-sm">Application {applicationStatus}</p>
                      <p className="text-white/40 text-xs mt-0.5">Your application has been submitted. Track it in My Applications.</p>
                    </div>
                    <Link to="/applications" className="ml-auto text-xs text-blue-400 hover:text-blue-300 shrink-0">
                      Track →
                    </Link>
                  </div>
                ) : job.status !== 'active' ? (
                  // Job not active
                  <div className="flex items-center gap-3 p-4 rounded-2xl border border-gray-500/20 bg-gray-500/[0.04]">
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                    <p className="text-white/50 text-sm">This drive is not accepting applications right now.</p>
                  </div>
                ) : !eligible ? (
                  // Not eligible
                  <div className="flex items-center gap-3 p-4 rounded-2xl border border-red-500/20 bg-red-500/[0.04]">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <p className="text-red-400/80 text-sm">You are not eligible to apply for this drive.</p>
                  </div>
                ) : !showForm ? (
                  // Eligible — show Apply button
                  <button onClick={() => setShowForm(true)}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Apply Now
                  </button>
                ) : (
                  // Application form
                  <div className="bg-white/[0.03] border border-blue-500/20 rounded-2xl p-5 space-y-4">
                    <h3 className="font-semibold text-white text-sm">Submit Application</h3>

                    {/* Student info preview */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: 'Name',        val: user?.name },
                        { label: 'Roll No.',    val: user?.rollNumber || '—' },
                        { label: 'Branch',      val: user?.branch || '—' },
                        { label: 'CGPA',        val: user?.cgpa ?? '—' },
                      ].map(item => (
                        <div key={item.label} className="bg-white/[0.04] rounded-xl px-3 py-2">
                          <p className="text-[10px] text-white/30">{item.label}</p>
                          <p className="text-xs font-semibold text-white mt-0.5">{item.val}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="text-xs text-white/40 mb-1.5 block">
                        Cover Letter / Message to Recruiter <span className="text-white/20">(optional)</span>
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Briefly introduce yourself and why you're interested in this role..."
                        value={coverLetter}
                        onChange={e => setCoverLetter(e.target.value)}
                        className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 resize-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setShowForm(false)}
                        className="flex-1 py-2.5 text-sm bg-white/[0.05] text-white/50 rounded-xl hover:bg-white/[0.08] transition-all">
                        Cancel
                      </button>
                      <button onClick={handleApply} disabled={submitting}
                        className="flex-1 py-2.5 text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                        {submitting
                          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <><Send className="w-3.5 h-3.5" />Submit Application</>
                        }
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Management: link to applicants */}
            {isManagement && (
              <Link to={`/jobs/${id}/applicants`}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-2xl transition-all">
                <Users className="w-4 h-4" />
                View All Applicants ({applicantCount})
              </Link>
            )}
          </div>

          {/* Right — sidebar info */}
          <div className="space-y-4">

            {/* Dates */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Important Dates</h3>
              {job.lastDateToApply && (
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <p className="text-[11px] text-white/35">Apply by</p>
                    <p className="text-sm font-semibold text-white">
                      {new Date(job.lastDateToApply).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}
              {job.driveDate && (
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-[11px] text-white/35">Drive Date</p>
                    <p className="text-sm font-semibold text-white">
                      {new Date(job.driveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Eligibility summary */}
            {(job.eligibility?.minCGPA > 0 || job.eligibility?.branches?.length > 0 || job.eligibility?.passingYear?.length > 0) && (
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Eligibility</h3>
                {job.eligibility.minCGPA > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-[11px] text-white/35">Min CGPA</p>
                      <p className="text-sm font-semibold text-white">{job.eligibility.minCGPA}</p>
                    </div>
                  </div>
                )}
                {job.eligibility.branches?.length > 0 && (
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-white/35">Branches</p>
                      <p className="text-xs text-white/70 leading-relaxed">{job.eligibility.branches.join(', ')}</p>
                    </div>
                  </div>
                )}
                {job.eligibility.passingYear?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-[11px] text-white/35">Batch</p>
                      <p className="text-sm font-semibold text-white">{job.eligibility.passingYear.join(', ')}</p>
                    </div>
                  </div>
                )}
                {job.eligibility.backlogs !== undefined && (
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-white/30 shrink-0" />
                    <div>
                      <p className="text-[11px] text-white/35">Max Backlogs</p>
                      <p className="text-sm font-semibold text-white">{job.eligibility.backlogs}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Posted by */}
            {job.postedBy && (
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Posted By</h3>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-xs font-bold text-violet-400">
                    {job.postedBy.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{job.postedBy.name}</p>
                    <p className="text-[11px] text-white/35">{job.postedBy.companyName || job.postedBy.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}