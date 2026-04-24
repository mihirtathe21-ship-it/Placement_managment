import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Briefcase, MapPin, Star, Calendar, Users, ChevronLeft,
  CheckCircle2, XCircle, AlertCircle, Clock, Building2,
  GraduationCap, Zap, Hash, BookOpen, FileText, Send,
  Upload, X, CheckCircle, IndianRupee, Globe, Phone,
  Mail, Share2, Bookmark, BookmarkCheck, ChevronRight,
  Shield, Award, TrendingUp, Eye, Download
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import toast from 'react-hot-toast'

// ─── Eligibility checker ──────────────────────────────────────────────────────
function checkEligibility(user, job) {
  const reasons = []
  const el = job.eligibility || {}
  if (el.minCGPA > 0) reasons.push({ field: 'CGPA', required: `≥ ${el.minCGPA}`, yours: user.cgpa || 'Not set', pass: (user.cgpa || 0) >= el.minCGPA })
  if (el.branches?.length > 0) reasons.push({ field: 'Branch', required: el.branches.join(', '), yours: user.branch || 'Not set', pass: el.branches.includes(user.branch) })
  if (el.passingYear?.length > 0) reasons.push({ field: 'Passing Year', required: el.passingYear.join(', '), yours: user.passingYear || 'Not set', pass: el.passingYear.includes(Number(user.passingYear)) })
  return { eligible: reasons.every(r => r.pass), reasons }
}

// ─── Apply Modal ──────────────────────────────────────────────────────────────
function ApplyModal({ job, user, onClose, onSuccess }) {
  const fileRef = useRef()
  const [step, setStep]             = useState(1) // 1=profile, 2=resume, 3=confirm
  const [resumeFile, setResumeFile] = useState(null)
  const [dragging, setDragging]     = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [useExisting, setUseExisting] = useState(true)

  const handleFile = (file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf','doc','docx'].includes(ext)) return toast.error('Only PDF, DOC, DOCX allowed')
    if (file.size > 5 * 1024 * 1024) return toast.error('File must be under 5MB')
    setResumeFile(file)
    setUseExisting(false)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('jobId', job._id)
      fd.append('coverLetter', coverLetter)
      if (resumeFile && !useExisting) fd.append('resume', resumeFile)
      await api.post('/applications', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onSuccess()
      toast.success('🎉 Application submitted successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply')
    } finally { setSubmitting(false) }
  }

  const steps = ['Contact Info', 'Resume', 'Review & Submit']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Apply for {job.title}</h2>
            <p className="text-gray-400 text-sm">{job.company}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  step > i+1 ? 'bg-green-500 text-white' : step === i+1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > i+1 ? <CheckCircle className="w-4 h-4" /> : i+1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step === i+1 ? 'text-blue-600' : 'text-gray-400'}`}>{s}</span>
                {i < steps.length-1 && <div className={`flex-1 h-0.5 rounded-full mx-1 ${step > i+1 ? 'bg-green-400' : 'bg-gray-100'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1 — Contact Info */}
        {step === 1 && (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-xs text-gray-400">{user?.branch} · {user?.passingYear}</p>
              </div>
            </div>

            {[
              { label: 'Mobile Number', value: user?.phone || '', icon: Phone, placeholder: 'Enter mobile number' },
              { label: 'Email Address', value: user?.email || '', icon: Mail,  placeholder: 'Enter email' },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{f.label}</label>
                <div className="relative">
                  <f.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input defaultValue={f.value} placeholder={f.placeholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition" />
                </div>
              </div>
            ))}

            <button onClick={() => setStep(2)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-blue-200">
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 — Resume */}
        {step === 2 && (
          <div className="p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">Add Your Resume</h3>

            {/* Use existing */}
            {user?.resumeUrl && (
              <div
                onClick={() => setUseExisting(true)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                  useExisting ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${useExisting ? 'border-blue-500' : 'border-gray-300'}`}>
                  {useExisting && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Use existing resume</p>
                    <p className="text-xs text-gray-400">Last updated {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <a href={user.resumeUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-500 font-semibold hover:text-blue-700"
                  onClick={e => e.stopPropagation()}>
                  <Eye className="w-3 h-3" /> View
                </a>
              </div>
            )}

            {/* Upload new */}
            <div
              onClick={() => setUseExisting(false)}
              className={`rounded-xl border-2 cursor-pointer transition overflow-hidden ${
                !useExisting ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
              }`}>
              <div className="flex items-center gap-3 p-4">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${!useExisting ? 'border-blue-500' : 'border-gray-300'}`}>
                  {!useExisting && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                </div>
                <p className="font-semibold text-gray-800 text-sm">Upload new resume</p>
              </div>

              {!useExisting && (
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
                  onClick={() => fileRef.current?.click()}
                  className={`mx-4 mb-4 border-2 border-dashed rounded-xl p-6 text-center transition ${
                    dragging ? 'border-blue-400 bg-blue-50' : resumeFile ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                  <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx"
                    onChange={e => handleFile(e.target.files[0])} />

                  {resumeFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-6 h-6 text-green-500" />
                      <div className="text-left">
                        <p className="font-semibold text-green-700 text-sm">{resumeFile.name}</p>
                        <p className="text-xs text-green-500">{(resumeFile.size / 1024).toFixed(0)} KB uploaded</p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); setResumeFile(null) }}
                        className="ml-auto p-1 text-gray-400 hover:text-red-500 transition">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className={`w-8 h-8 mx-auto mb-2 ${dragging ? 'text-blue-500' : 'text-gray-300'}`} />
                      <p className="text-sm font-medium text-gray-600 mb-1">Drag & drop or click to upload</p>
                      <p className="text-xs text-gray-400">PDF, DOC, DOCX · Max 5MB</p>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition">
                ← Back
              </button>
              <button onClick={() => setStep(3)}
                disabled={!useExisting && !resumeFile}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50">
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Review & Submit */}
        {step === 3 && (
          <div className="p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">Review Your Application</h3>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Applying for</span>
                <span className="font-semibold text-gray-800">{job.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Company</span>
                <span className="font-semibold text-gray-800">{job.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Resume</span>
                <span className="font-semibold text-green-600">
                  {useExisting ? 'Existing resume' : resumeFile?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">CGPA</span>
                <span className="font-semibold text-gray-800">{user?.cgpa || '—'}</span>
              </div>
            </div>

            {/* Cover letter */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Cover Letter <span className="text-gray-300 font-normal">(optional)</span>
              </label>
              <textarea rows={4} value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                placeholder="Tell the recruiter why you're a great fit for this role..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition resize-none" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition">
                ← Back
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-60">
                {submitting
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting…</>
                  : <><Send className="w-4 h-4" />Submit Application</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Job Detail Page ─────────────────────────────────────────────────────
export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [job, setJob]                       = useState(null)
  const [applicationStatus, setApplicationStatus] = useState(null)
  const [applicantCount, setApplicantCount] = useState(0)
  const [loading, setLoading]               = useState(true)
  const [showApply, setShowApply]           = useState(false)
  const [saved, setSaved]                   = useState(false)

  const isStudent    = user?.role === 'student'
  const isManagement = ['tpo','recruiter','admin'].includes(user?.role)

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

  if (loading) return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`h-${i === 0 ? 32 : 20} bg-gray-100 rounded-2xl animate-pulse`} />
        ))}
      </div>
    </DashboardLayout>
  )

  if (!job) return (
    <DashboardLayout>
      <div className="p-8 text-center text-gray-400">
        <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Job not found.</p>
      </div>
    </DashboardLayout>
  )

  const { eligible, reasons } = isStudent ? checkEligibility(user, job) : { eligible: true, reasons: [] }
  const deadline = job.lastDateToApply ? new Date(job.lastDateToApply) : null
  const daysLeft = deadline ? Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)) : null

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <button onClick={() => navigate(-1)} className="hover:text-gray-600 flex items-center gap-1 transition">
              <ChevronLeft className="w-4 h-4" /> Jobs
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-600 font-medium truncate">{job.title}</span>
          </div>

          {/* ── Hero Card ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Top color bar */}
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500" />

            <div className="p-6">
              <div className="flex flex-wrap gap-4 justify-between">

                {/* Left — job info */}
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-2xl flex-shrink-0 shadow-sm">
                    {job.company?.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">{job.title}</h1>
                    <p className="text-blue-600 font-semibold mt-0.5">{job.company}</p>

                    {/* Meta pills */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {[
                        job.location     && { icon: MapPin,         text: job.location,           color: 'text-gray-600 bg-gray-100' },
                        job.type         && { icon: Briefcase,       text: job.type,               color: 'text-blue-700 bg-blue-50' },
                        (job.package || job.stipend) && { icon: IndianRupee, text: job.package || job.stipend, color: 'text-green-700 bg-green-50' },
                        job.openings     && { icon: Users,           text: `${job.openings} openings`, color: 'text-violet-700 bg-violet-50' },
                      ].filter(Boolean).map((pill, i) => (
                        <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${pill.color}`}>
                          <pill.icon className="w-3.5 h-3.5" />{pill.text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right — actions */}
                <div className="flex flex-col items-end gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {job.status === 'open' ? '🟢 Actively Hiring' : '🔴 Closed'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button onClick={() => { setSaved(p => !p); toast.success(saved ? 'Job unsaved' : 'Job saved!') }}
                      className={`p-2.5 rounded-xl border transition ${saved ? 'bg-blue-50 border-blue-200 text-blue-500' : 'border-gray-200 text-gray-400 hover:border-blue-200 hover:text-blue-400'}`}>
                      {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }}
                      className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:border-blue-200 hover:text-blue-400 transition">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {isManagement && (
                    <Link to={`/jobs/${id}/applicants`}
                      className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:text-blue-700">
                      <Users className="w-4 h-4" />{applicantCount} Applicants
                    </Link>
                  )}
                </div>
              </div>

              {/* Apply / Status bar */}
              {isStudent && (
                <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap items-center gap-4">
                  {!applicationStatus ? (
                    <>
                      <button
                        onClick={() => eligible ? setShowApply(true) : toast.error('You are not eligible for this job')}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition shadow-lg ${
                          eligible
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}>
                        <Send className="w-4 h-4" />
                        {eligible ? 'Apply Now' : 'Not Eligible'}
                      </button>
                      {daysLeft !== null && (
                        <span className={`text-sm font-medium ${daysLeft <= 3 ? 'text-red-500' : 'text-gray-500'}`}>
                          {daysLeft > 0 ? `⏰ ${daysLeft} days left to apply` : '❌ Deadline passed'}
                        </span>
                      )}
                    </>
                  ) : (
                    <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl border font-semibold text-sm ${
                      applicationStatus === 'selected'  ? 'bg-green-50 border-green-200 text-green-700' :
                      applicationStatus === 'rejected'  ? 'bg-red-50 border-red-200 text-red-600' :
                      applicationStatus === 'interview' ? 'bg-violet-50 border-violet-200 text-violet-600' :
                      'bg-blue-50 border-blue-200 text-blue-600'
                    }`}>
                      <CheckCircle className="w-4 h-4" />
                      Application Status: <span className="capitalize ml-1">{applicationStatus}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Eligibility Banner (if not eligible) ── */}
          {isStudent && !eligible && reasons.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="font-semibold text-red-700">You don't meet the eligibility criteria</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {reasons.map(r => (
                  <div key={r.field} className={`p-3 rounded-xl border ${r.pass ? 'bg-green-50 border-green-200' : 'bg-white border-red-200'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-600 uppercase">{r.field}</span>
                      {r.pass ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{r.yours}</p>
                    <p className="text-xs text-gray-400">Required: {r.required}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Main 2-col layout ── */}
          <div className="grid lg:grid-cols-3 gap-4">

            {/* LEFT — main content */}
            <div className="lg:col-span-2 space-y-4">

              {/* About Role */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" /> Job Description
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>

              {/* Skills */}
              {job.skills?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" /> Required Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map(s => (
                      <span key={s} className="px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-sm text-blue-700 font-medium hover:bg-blue-100 transition">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligibility Criteria */}
              {(job.eligibility?.minCGPA || job.eligibility?.branches?.length > 0) && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" /> Eligibility Criteria
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {job.eligibility?.minCGPA > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <Award className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400 font-medium">Minimum CGPA</p>
                          <p className="font-bold text-gray-800">{job.eligibility.minCGPA}</p>
                        </div>
                      </div>
                    )}
                    {job.eligibility?.branches?.length > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <GraduationCap className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400 font-medium">Eligible Branches</p>
                          <p className="font-bold text-gray-800 text-sm">{job.eligibility.branches.join(', ')}</p>
                        </div>
                      </div>
                    )}
                    {job.eligibility?.passingYear?.length > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <Calendar className="w-5 h-5 text-violet-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400 font-medium">Passing Year</p>
                          <p className="font-bold text-gray-800">{job.eligibility.passingYear.join(', ')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Apply button (mobile friendly) */}
              {isStudent && !applicationStatus && (
                <button
                  onClick={() => eligible ? setShowApply(true) : toast.error('You are not eligible for this job')}
                  className={`w-full py-4 rounded-2xl font-bold text-base transition flex items-center justify-center gap-2 ${
                    eligible
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}>
                  <Send className="w-5 h-5" />
                  {eligible ? 'Apply Now' : 'Not Eligible to Apply'}
                </button>
              )}
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="space-y-4">

              {/* Job Overview */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Job Overview</h3>
                <div className="space-y-3">
                  {[
                    { icon: Clock,    label: 'Apply Before', value: deadline?.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) || 'Open' },
                    { icon: Calendar, label: 'Drive Date',   value: job.driveDate ? new Date(job.driveDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—' },
                    { icon: Users,    label: 'Openings',     value: job.openings || 'Multiple' },
                    { icon: Briefcase,label: 'Job Type',     value: job.type || 'Full Time' },
                    { icon: MapPin,   label: 'Location',     value: job.location || '—' },
                    { icon: TrendingUp,label:'Experience',   value: job.experience || 'Fresher' },
                  ].map(item => item.value && (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Posted By */}
              {job.postedBy && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3">Posted By</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                      {job.postedBy.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{job.postedBy.name}</p>
                      <p className="text-xs text-gray-400">{job.postedBy.companyName || job.postedBy.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Applicants (for management) */}
              {isManagement && (
                <Link to={`/jobs/${id}/applicants`}
                  className="flex items-center justify-between p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-200 transition">
                  <div>
                    <p className="font-bold text-lg">{applicantCount}</p>
                    <p className="text-blue-200 text-sm">Total Applicants</p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApply && (
        <ApplyModal
          job={job}
          user={user}
          onClose={() => setShowApply(false)}
          onSuccess={() => {
            setApplicationStatus('applied')
            setApplicantCount(c => c + 1)
            setShowApply(false)
          }}
        />
      )}
    </DashboardLayout>
  )
}