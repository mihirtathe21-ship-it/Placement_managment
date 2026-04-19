// components/ui/StudentProfileModal.jsx

import {
  X, Hash, Calendar, MapPin, Briefcase,
  Mail, Phone, Download, GraduationCap, Award,
  BookOpen, AlertCircle, ExternalLink
} from 'lucide-react'

// ── Your backend serves uploads at http://localhost:5000/uploads/filename
// ── Files are stored in DB as "/uploads/filename"
const BASE_URL = 'http://localhost:5000'

const getFileUrl = (filePath) => {
  if (!filePath) return ''
  if (filePath.startsWith('http')) return filePath           // already full URL
  if (filePath.startsWith('/'))    return `${BASE_URL}${filePath}`  // "/uploads/x"
  return `${BASE_URL}/${filePath}`                           // "uploads/x"
}

const cgpaColor = (cgpa) => {
  if (cgpa == null) return 'text-slate-400'
  if (cgpa >= 8.5)  return 'text-emerald-600'
  if (cgpa >= 7.5)  return 'text-blue-600'
  if (cgpa >= 6.5)  return 'text-amber-600'
  return 'text-red-500'
}

const cgpaBg = (cgpa) => {
  if (cgpa == null) return 'bg-slate-100 border-slate-200'
  if (cgpa >= 8.5)  return 'bg-emerald-50 border-emerald-200'
  if (cgpa >= 7.5)  return 'bg-blue-50 border-blue-200'
  if (cgpa >= 6.5)  return 'bg-amber-50 border-amber-200'
  return 'bg-red-50 border-red-200'
}

const formatDob = (dob) => {
  if (!dob) return null
  return new Date(dob).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

export default function StudentProfileModal({ student, onClose }) {
  if (!student) return null

  const photoUrl  = getFileUrl(student.photo)
  const resumeUrl = getFileUrl(student.resume)

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  // Open resume in new tab — using window.open ensures it
  // always goes directly to the backend URL, never through
  // the Vite dev proxy which caused "not GET /uploads/..." errors
  const handleResumeClick = (e) => {
    e.preventDefault()
    window.open(resumeUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#1a2744]" />
            <span className="text-sm font-bold text-[#1a2744]">Student Profile</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Hero ── */}
        <div className="px-6 pt-6 pb-5 flex items-start gap-5 border-b border-slate-100">

          {/* Photo — initial letter always shown underneath as fallback */}
          <div className="w-20 h-20 rounded-2xl border-2 border-slate-200 bg-blue-50 shrink-0 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-bold text-2xl select-none">
              {student.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            {photoUrl && (
              <img
                src={photoUrl}
                alt={student.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            )}
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-[#1a2744] leading-tight">{student.name || '—'}</h2>
            <p className="text-sm text-slate-400 mt-0.5 truncate">{student.email || '—'}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {student.branch && (
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-semibold">
                  {student.branch}
                </span>
              )}
              {student.passingYear && (
                <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full font-semibold">
                  Batch {student.passingYear}
                </span>
              )}
              {student.domain && (
                <span className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full font-semibold">
                  {student.domain}
                </span>
              )}
            </div>
          </div>

          {/* CGPA */}
          {student.cgpa != null && (
            <div className={`shrink-0 text-center px-4 py-2.5 rounded-xl border ${cgpaBg(student.cgpa)}`}>
              <p className={`text-xl font-bold ${cgpaColor(student.cgpa)}`}>{student.cgpa}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">CGPA</p>
            </div>
          )}
        </div>

        {/* ── Info grid ── */}
        <div className="px-6 py-5 space-y-4">

          {/* Personal */}
          <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
            Personal Details
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {student.prn && (
              <InfoRow icon={Hash} label="PRN" value={student.prn} />
            )}
            {student.rollNumber && (
              <InfoRow icon={BookOpen} label="Roll Number" value={student.rollNumber} />
            )}
            {student.dob && (
              <InfoRow icon={Calendar} label="Date of Birth" value={formatDob(student.dob)} />
            )}
            {student.phone && (
              <InfoRow icon={Phone} label="Phone" value={student.phone} />
            )}
            {student.email && (
              <InfoRow icon={Mail} label="Email" value={student.email} className="sm:col-span-2" />
            )}
            {student.address && (
              <InfoRow icon={MapPin} label="Address" value={student.address} className="sm:col-span-2" />
            )}
          </div>

          {/* Academic */}
          <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold pt-3 border-t border-slate-100">
            Academic Details
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {student.branch && (
              <InfoRow icon={Briefcase} label="Branch" value={student.branch} />
            )}
            {student.passingYear && (
              <InfoRow icon={GraduationCap} label="Passing Year" value={student.passingYear} />
            )}
            {student.cgpa != null && (
              <InfoRow
                icon={Award}
                label="CGPA"
                value={student.cgpa}
                valueClass={cgpaColor(student.cgpa)}
              />
            )}
            {student.backlogs != null && (
              <InfoRow
                icon={AlertCircle}
                label="Backlogs"
                value={student.backlogs === 0 ? 'None' : student.backlogs}
                valueClass={student.backlogs > 0 ? 'text-red-500' : 'text-emerald-600'}
              />
            )}
            {student.domain && (
              <InfoRow
                icon={BookOpen}
                label="Domain / Specialization"
                value={student.domain}
                className="sm:col-span-2"
              />
            )}
          </div>

          {/* Resume */}
          {resumeUrl && (
            <>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold pt-3 border-t border-slate-100">
                Documents
              </p>
              {/* ✅ Uses window.open via onClick instead of href
                  so the browser goes directly to http://localhost:5000/uploads/...
                  and never routes through the Vite dev proxy */}
              <button
                onClick={handleResumeClick}
                className="w-full flex items-center gap-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl px-4 py-3 transition-all group text-left"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a2744] group-hover:text-blue-700 transition-colors">
                    View / Download Resume
                  </p>
                  <p className="text-xs text-slate-400 font-mono truncate">{resumeUrl}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
              </button>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-semibold text-slate-600 hover:text-[#1a2744] border border-slate-200 hover:border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, className = '', valueClass = '' }) {
  return (
    <div className={`flex items-start gap-3 bg-slate-50 rounded-xl p-3 ${className}`}>
      <Icon className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-slate-400 mb-0.5 font-medium">{label}</p>
        <p className={`text-sm font-semibold text-[#1a2744] break-words ${valueClass}`}>{value}</p>
      </div>
    </div>
  )
}
