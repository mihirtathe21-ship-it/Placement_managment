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
  applied: { text: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  shortlisted: { text: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  interview: { text: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
  selected: { text: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  rejected: { text: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  withdrawn: { text: 'text-gray-600', bg: 'bg-gray-100 border-gray-200' },
}

function checkEligibility(user, job) {
  const reasons = []
  const el = job.eligibility || {}

  if (el.minCGPA > 0) {
    reasons.push({
      field: 'CGPA',
      required: `≥ ${el.minCGPA}`,
      yours: user.cgpa || 'Not set',
      pass: user.cgpa >= el.minCGPA,
    })
  }

  if (el.branches?.length > 0) {
    reasons.push({
      field: 'Branch',
      required: el.branches.join(', '),
      yours: user.branch || 'Not set',
      pass: el.branches.includes(user.branch),
    })
  }

  if (el.passingYear?.length > 0) {
    reasons.push({
      field: 'Passing Year',
      required: el.passingYear.join(', '),
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

  if (loading)
    return (
      <DashboardLayout>
        <div className="p-8 max-w-4xl mx-auto space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </DashboardLayout>
    )

  if (!job)
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-gray-500">Job not found.</div>
      </DashboardLayout>
    )

  const { eligible, reasons } = isStudent ? checkEligibility(user, job) : { eligible: true, reasons: [] }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 bg-gray-50">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Jobs
        </button>

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex justify-between flex-wrap gap-4">

            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                {job.company?.charAt(0)}
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-800">{job.title}</h1>
                <p className="text-gray-500">{job.company}</p>

                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">

                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                  )}

                  {job.type && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {job.type}
                    </span>
                  )}

                  {(job.package || job.stipend) && (
                    <span className="flex items-center gap-1 text-green-600">
                      <Star className="w-4 h-4" />
                      {job.package || job.stipend}
                    </span>
                  )}

                  {job.openings && (
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {job.openings} openings
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                {job.status}
              </span>

              {isManagement && (
                <Link
                  to={`/jobs/${id}/applicants`}
                  className="text-sm text-blue-600 font-medium"
                >
                  {applicantCount} Applicants
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-5">

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold text-gray-800 mb-2">About the Role</h2>
              <p className="text-gray-600 text-sm whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {job.skills?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="font-semibold text-gray-800 mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map(s => (
                    <span
                      key={s}
                      className="px-3 py-1 text-xs bg-gray-100 rounded-md text-gray-600"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* APPLY BUTTON */}

            {isStudent && !applicationStatus && eligible && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
              >
                Apply Now
              </button>
            )}

            {showForm && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">

                <h3 className="font-semibold text-gray-800">
                  Submit Application
                </h3>

                <textarea
                  rows={4}
                  placeholder="Write a cover letter..."
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                />

                <div className="flex gap-3">

                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2 bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleApply}
                    disabled={submitting}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Submit
                  </button>

                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}

          <div className="space-y-4">

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Important Dates
              </h3>

              {job.lastDateToApply && (
                <div className="flex gap-2 items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-red-500" />
                  Apply before{' '}
                  {new Date(job.lastDateToApply).toLocaleDateString()}
                </div>
              )}

              {job.driveDate && (
                <div className="flex gap-2 items-center text-sm text-gray-600 mt-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  Drive Date{' '}
                  {new Date(job.driveDate).toLocaleDateString()}
                </div>
              )}
            </div>

            {job.postedBy && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Posted By
                </h3>

                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center text-blue-600 font-bold">
                    {job.postedBy.name?.charAt(0)}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {job.postedBy.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {job.postedBy.companyName || job.postedBy.email}
                    </p>
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