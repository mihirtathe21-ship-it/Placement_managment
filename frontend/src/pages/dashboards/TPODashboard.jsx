import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  GraduationCap, Briefcase, Upload, BarChart2,
  Search, SlidersHorizontal, RefreshCw, CheckCircle2,
  Download, FileSpreadsheet, Users, Award,
  UserCheck, X, Plus, AlertCircle
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import api from '../../api'
import toast from 'react-hot-toast'
import StudentProfileModal from '../../components/ui/StudentProfileModal'

const DOMAINS = [
  'Full Stack Development',
  'Frontend Development',
  'Backend Development',
  'Data Analytics',
  'Data Science',
  'Machine Learning',
  'Artificial Intelligence',
  'Cloud Computing',
  'DevOps',
  'Cybersecurity',
  'Mobile Development',
  'UI/UX Design',
  '.NET Development',
  'Java Development',
  'Python Development',
  'Embedded Systems',
  'Networking',
  'Database Administration',
  'Other',
]

// ─────────────────────────────────────────────────────────────────────────────
// HOME TAB
// ─────────────────────────────────────────────────────────────────────────────
function HomeTab() {
  const [summary, setSummary]       = useState(null)
  const [recentApps, setRecentApps] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/summary').catch(() => ({ data: {} })),
      api.get('/applications', { params: { limit: 6 } }).catch(() => ({ data: { applications: [] } })),
    ]).then(([s, a]) => {
      setSummary(s.data)
      setRecentApps(a.data.applications || [])
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1a2744]">TPO Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Manage placement drives, students &amp; shortlisting</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', val: summary?.totalStudents        ?? '—', icon: GraduationCap,   c: 'text-blue-600',    b: 'bg-blue-50',    border: 'border-blue-100' },
          { label: 'Active Drives',  val: summary?.activeJobs           ?? '—', icon: Briefcase,       c: 'text-emerald-600', b: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Applications',   val: summary?.totalApplications    ?? '—', icon: FileSpreadsheet, c: 'text-violet-600',  b: 'bg-violet-50',  border: 'border-violet-100' },
          { label: 'Placed',         val: summary?.selectedApplications ?? '—', icon: Award,           c: 'text-amber-600',   b: 'bg-amber-50',   border: 'border-amber-100' },
        ].map(s => (
          <div key={s.label} className={`bg-white border ${s.border} rounded-2xl p-5 shadow-sm`}>
            <div className={`w-9 h-9 ${s.b} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-4.5 h-4.5 ${s.c}`} />
            </div>
            <p className="text-2xl font-bold text-[#1a2744]">{loading ? '—' : s.val}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Post Drive',    icon: Plus,          to: '/jobs/new',               c: 'text-blue-600',    b: 'bg-blue-50',    border: 'border-blue-200',   hover: 'hover:bg-blue-100' },
          { label: 'Find Students', icon: GraduationCap, to: '/tpo-dashboard/students', c: 'text-emerald-600', b: 'bg-emerald-50', border: 'border-emerald-200', hover: 'hover:bg-emerald-100' },
          { label: 'Upload Data',   icon: Upload,        to: '/tpo-dashboard/upload',   c: 'text-violet-600',  b: 'bg-violet-50',  border: 'border-violet-200',  hover: 'hover:bg-violet-100' },
          { label: 'Analytics',     icon: BarChart2,     to: '/analytics',              c: 'text-amber-600',   b: 'bg-amber-50',   border: 'border-amber-200',   hover: 'hover:bg-amber-100' },
        ].map(a => (
          <Link key={a.label} to={a.to}
            className={`flex flex-col items-center gap-2.5 py-5 px-3 border ${a.border} ${a.b} ${a.hover} rounded-2xl transition-all shadow-sm`}>
            <a.icon className={`w-5 h-5 ${a.c}`} />
            <span className={`text-xs ${a.c} font-semibold`}>{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1a2744] text-sm mb-4">Recent Applications</h2>
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse mb-2" />)
        ) : recentApps.length === 0 ? (
          <p className="text-slate-300 text-sm text-center py-8">No applications yet</p>
        ) : recentApps.map(app => (
          <div key={app._id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-all">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600 shrink-0">
              {app.student?.name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-[#1a2744] font-medium truncate">{app.student?.name || 'Unknown'}</p>
              <p className="text-[11px] text-slate-400 truncate">{app.job?.title} · {app.job?.company}</p>
            </div>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold shrink-0 ${
              app.status === 'selected'    ? 'bg-emerald-100 text-emerald-700' :
              app.status === 'shortlisted' ? 'bg-amber-100   text-amber-700'   :
              app.status === 'rejected'    ? 'bg-red-100     text-red-700'     :
              'bg-slate-100 text-slate-500'
            }`}>{app.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD TAB  (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
function UploadTab() {
  const [rows, setRows]             = useState([])
  const [headers, setHeaders]       = useState([])
  const [fileName, setFileName]     = useState('')
  const [uploading, setUploading]   = useState(false)
  const [result, setResult]         = useState(null)
  const [dragOver, setDragOver]     = useState(false)
  const [parseError, setParseError] = useState('')
  const fileRef = useRef()

  const parseCSV = (text) => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return { headers: [], rows: [] }
    const hdrs = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    const data = lines.slice(1)
      .filter(l => l.trim())
      .map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
        const obj = {}
        hdrs.forEach((h, i) => { obj[h] = vals[i] || '' })
        return obj
      })
    return { headers: hdrs, rows: data }
  }

  const parseXLSX = async (file) => {
    return new Promise((resolve, reject) => {
      const tryParse = (XLSX) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const wb   = XLSX.read(e.target.result, { type: 'binary' })
            const ws   = wb.Sheets[wb.SheetNames[0]]
            const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
            if (!json || json.length < 2) { reject(new Error('File is empty')); return }
            const hdrs = json[0].map(h => String(h).trim()).filter(Boolean)
            const data = json.slice(1)
              .filter(row => row.some(c => c !== ''))
              .map(row => {
                const obj = {}
                hdrs.forEach((h, idx) => { obj[h] = row[idx] ?? '' })
                return obj
              })
            resolve({ headers: hdrs, rows: data })
          } catch (err) { reject(err) }
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsBinaryString(file)
      }

      if (window.XLSX) {
        tryParse(window.XLSX)
      } else {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
        script.onload = () => tryParse(window.XLSX)
        script.onerror = () => reject(new Error('Could not load Excel parser'))
        document.head.appendChild(script)
      }
    })
  }

  const handleFile = async (file) => {
    if (!file) return
    setParseError(''); setResult(null); setRows([]); setHeaders([])
    const ext = file.name.split('.').pop().toLowerCase()
    if (ext === 'csv') {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const { headers: hdrs, rows: data } = parseCSV(e.target.result)
          if (!hdrs.length) { setParseError('CSV file is empty or invalid'); return }
          setHeaders(hdrs); setRows(data); setFileName(file.name)
          toast.success(`${data.length} rows loaded`)
        } catch (err) { setParseError('Failed to parse CSV: ' + err.message) }
      }
      reader.readAsText(file)
    } else if (['xlsx', 'xls'].includes(ext)) {
      try {
        const { headers: hdrs, rows: data } = await parseXLSX(file)
        setHeaders(hdrs); setRows(data); setFileName(file.name)
        toast.success(`${data.length} rows loaded from ${file.name}`)
      } catch (err) {
        setParseError('Failed to parse Excel: ' + err.message + '. Try saving as CSV instead.')
        toast.error('Failed to parse Excel file')
      }
    } else {
      setParseError('Please upload a .xlsx, .xls, or .csv file')
    }
  }

  const handleInputChange = (e) => { handleFile(e.target.files?.[0]); e.target.value = '' }
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]) }

  const handleUpload = async () => {
    if (!rows.length) { toast.error('No data to upload'); return }
    setUploading(true)
    try {
      const { data } = await api.post('/students/import', { students: rows })
      setResult(data)
      toast.success(`${data.created} students added, ${data.updated} updated!`)
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Upload failed')
    } finally { setUploading(false) }
  }

  const downloadTemplate = () => {
    const csv = [
      'Name,Email,Phone,RollNumber,Branch,PassingYear,CGPA,Backlogs,Domain',
      'Jane Doe,jane@college.edu,9876543210,CS2001,Computer Science,2025,8.5,0,Full Stack Development',
      'John Smith,john@college.edu,9876543211,IT2002,Information Technology,2025,7.2,1,Data Analytics',
      'Priya Patel,priya@college.edu,9876543212,EC2003,Electronics,2026,9.1,0,Machine Learning',
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'student_template.csv'
    a.click(); URL.revokeObjectURL(url)
    toast.success('Template downloaded!')
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-[#1a2744]">Upload Student Data</h2>
        <p className="text-slate-400 text-sm mt-1">
          Upload Excel or CSV once — data is permanently stored in the database.
          After this, use <strong className="text-emerald-600">Find Students</strong> tab to filter and shortlist anytime.
        </p>
      </div>

      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <FileSpreadsheet className="w-5 h-5 text-blue-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1a2744]">Download template first</p>
          <p className="text-xs text-slate-400">CSV with all columns including Domain &amp; Specialization</p>
        </div>
        <button onClick={downloadTemplate}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 border border-blue-300 bg-white px-3 py-1.5 rounded-lg transition-all shrink-0 font-medium shadow-sm">
          <Download className="w-3.5 h-3.5" />Download CSV Template
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400">Supported:</span>
        {['.xlsx', '.xls', '.csv'].map(f => (
          <span key={f} className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md font-mono">{f}</span>
        ))}
        <span className="text-xs text-slate-300 ml-1">· Include a "Domain" column for specialization</span>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl py-14 text-center cursor-pointer transition-all select-none ${
          dragOver    ? 'border-violet-400 bg-violet-50' :
          rows.length ? 'border-emerald-400 bg-emerald-50' :
                        'border-slate-300 bg-slate-50 hover:border-violet-400 hover:bg-violet-50'
        }`}
      >
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleInputChange} className="hidden" />
        {rows.length > 0 ? (
          <>
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="text-[#1a2744] font-semibold">{fileName}</p>
            <p className="text-emerald-600 text-sm mt-1">{rows.length} students loaded · Click to change</p>
          </>
        ) : (
          <>
            <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Click to select file or drag &amp; drop here</p>
            <p className="text-slate-300 text-xs mt-1">Excel (.xlsx, .xls) or CSV files</p>
          </>
        )}
      </div>

      {parseError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-600">File Error</p>
            <p className="text-xs text-red-400 mt-0.5">{parseError}</p>
          </div>
        </div>
      )}

      {rows.length > 0 && headers.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
            <span className="text-sm font-semibold text-[#1a2744]">{rows.length} students ready to upload</span>
            <span className="text-slate-400 text-xs">preview: first 5 rows</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {headers.map(h => (
                    <th key={h} className="text-left text-[11px] text-slate-400 px-4 py-2.5 font-semibold whitespace-nowrap uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    {headers.map(h => (
                      <td key={h} className="px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap">{String(row[h] ?? '—')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 5 && (
            <p className="text-center text-slate-400 text-xs py-2.5 border-t border-slate-100 bg-slate-50">
              + {rows.length - 5} more rows
            </p>
          )}
        </div>
      )}

      {rows.length > 0 && (
        <button onClick={handleUpload} disabled={uploading}
          className="w-full py-3.5 bg-[#1a2744] hover:bg-[#243460] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md">
          {uploading ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving to database...</>
          ) : (
            <><Upload className="w-4 h-4" />Save {rows.length} Students to Database</>
          )}
        </button>
      )}

      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-emerald-700">Upload Complete — Data saved permanently</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { val: result.created, label: 'New Students', c: 'text-emerald-600' },
              { val: result.updated, label: 'Updated',      c: 'text-blue-600' },
              { val: result.failed,  label: 'Failed',       c: 'text-red-500' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-emerald-100 rounded-xl py-3 shadow-sm">
                <p className={`text-2xl font-bold ${s.c}`}>{s.val}</p>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
          {result.errors?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-red-600 mb-1">Errors:</p>
              {result.errors.map((e, i) => <p key={i} className="text-xs text-red-400">{e}</p>)}
            </div>
          )}
          <Link to="/tpo-dashboard/students"
            className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition-all text-sm shadow-sm">
            <GraduationCap className="w-4 h-4" />Go to Find Students →
          </Link>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FIND STUDENTS TAB — with domain filter + profile modal
// ─────────────────────────────────────────────────────────────────────────────
function FindStudentsTab() {
  const [students, setStudents]         = useState([])
  const [total, setTotal]               = useState(0)
  const [loading, setLoading]           = useState(false)
  const [selected, setSelected]         = useState(new Set())
  const [drives, setDrives]             = useState([])
  const [driveId, setDriveId]           = useState('')
  const [shortlisting, setShortlisting] = useState(false)
  const [result, setResult]             = useState(null)
  const [hasFetched, setHasFetched]     = useState(false)
  const [page, setPage]                 = useState(1)

  // ── NEW: profile modal state ──
  const [profileStudent, setProfileStudent] = useState(null)

  const LIMIT = 15

  const [search,      setSearch]      = useState('')
  const [minCGPA,     setMinCGPA]     = useState('')
  const [maxCGPA,     setMaxCGPA]     = useState('')
  const [branch,      setBranch]      = useState('')
  const [passingYear, setPassingYear] = useState('')
  const [maxBacklogs, setMaxBacklogs] = useState('')
  const [domain,      setDomain]      = useState('')

  useEffect(() => {
    api.get('/jobs', { params: { status: 'active', limit: 50 } })
      .then(r => setDrives(r.data.jobs || []))
      .catch(() => {})
  }, [])

  const doFetch = useCallback(async (pg) => {
    setLoading(true)
    try {
      const params = { page: pg, limit: LIMIT }
      if (search.trim())      params.search      = search.trim()
      if (minCGPA)            params.minCGPA     = minCGPA
      if (maxCGPA)            params.maxCGPA     = maxCGPA
      if (branch.trim())      params.branch      = branch.trim()
      if (passingYear)        params.passingYear = passingYear
      if (maxBacklogs !== '') params.maxBacklogs = maxBacklogs
      if (domain)             params.domain      = domain

      const { data } = await api.get('/students', { params })
      setStudents(data.students || [])
      setTotal(data.total || 0)
      setSelected(new Set())
      setHasFetched(true)
    } catch {
      toast.error('Failed to load students')
    } finally { setLoading(false) }
  }, [search, minCGPA, maxCGPA, branch, passingYear, maxBacklogs, domain])

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); doFetch(1) }, 350)
    return () => clearTimeout(t)
  }, [search, minCGPA, maxCGPA, branch, passingYear, maxBacklogs, domain])

  useEffect(() => { if (hasFetched) doFetch(page) }, [page])

  const resetFilters = () => {
    setSearch(''); setMinCGPA(''); setMaxCGPA('')
    setBranch(''); setPassingYear(''); setMaxBacklogs(''); setDomain('')
    setPage(1)
  }

  const hasFilters = search || minCGPA || maxCGPA || branch || passingYear || maxBacklogs !== '' || domain

  const toggleOne = (id) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  const toggleAll = () => {
    setSelected(prev => prev.size === students.length ? new Set() : new Set(students.map(s => s._id)))
  }

  const handleShortlist = async () => {
    if (!driveId)            { toast.error('Select a drive first');        return }
    if (selected.size === 0) { toast.error('Select at least one student'); return }
    setShortlisting(true); setResult(null)
    try {
      const { data } = await api.post('/students/shortlist', {
        jobId: driveId, studentIds: [...selected],
      })
      setResult(data); setSelected(new Set())
      toast.success(`${data.shortlisted} student${data.shortlisted !== 1 ? 's' : ''} shortlisted!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Shortlisting failed')
    } finally { setShortlisting(false) }
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-5">

      {/* ── Student Profile Modal ── */}
      {profileStudent && (
        <StudentProfileModal
          student={profileStudent}
          onClose={() => setProfileStudent(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-[#1a2744]">Find Students</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Filter by criteria &amp; domain, then shortlist for a drive.{' '}
            <span className="text-blue-500 font-medium">Click any row to view full profile.</span>
          </p>
        </div>
        <Link to="/tpo-dashboard/upload"
          className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 border border-violet-200 bg-violet-50 hover:bg-violet-100 px-3 py-2 rounded-xl transition-all font-medium shadow-sm">
          <Upload className="w-3.5 h-3.5" />Upload / Update Data
        </Link>
      </div>

      {/* ── Filter Panel ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-[#1a2744]">Filter Criteria</span>
          </div>
          {hasFilters && (
            <button onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium">
              <RefreshCw className="w-3 h-3" />Reset
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input type="text"
            placeholder="Search by name, email or roll number..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1a2744] placeholder-slate-400 focus:outline-none focus:border-[#1a2744] focus:bg-white transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Min CGPA',     val: minCGPA,     set: setMinCGPA,     type: 'number', ph: 'e.g. 7.0', step: '0.1', min: '0', max: '10' },
            { label: 'Max CGPA',     val: maxCGPA,     set: setMaxCGPA,     type: 'number', ph: 'e.g. 10',  step: '0.1', min: '0', max: '10' },
            { label: 'Branch',       val: branch,      set: setBranch,      type: 'text',   ph: 'e.g. CS' },
            { label: 'Passing Year', val: passingYear, set: setPassingYear, type: 'number', ph: 'e.g. 2025' },
            { label: 'Max Backlogs', val: maxBacklogs, set: setMaxBacklogs, type: 'number', ph: 'e.g. 0',   min: '0' },
          ].map(f => (
            <div key={f.label}>
              <label className="text-[11px] text-slate-400 mb-1.5 block font-medium uppercase tracking-wide">{f.label}</label>
              <input type={f.type} placeholder={f.ph} value={f.val} step={f.step} min={f.min} max={f.max}
                onChange={e => f.set(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-[#1a2744] placeholder-slate-300 focus:outline-none focus:border-[#1a2744] focus:bg-white transition-colors"
              />
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Specialization Domain</label>
            {domain && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                {domain}
                <button onClick={() => setDomain('')} className="hover:text-emerald-900 ml-0.5">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {DOMAINS.map(d => (
              <button key={d} onClick={() => setDomain(prev => prev === d ? '' : d)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                  domain === d
                    ? 'bg-[#1a2744] border-[#1a2744] text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-[#1a2744] hover:border-slate-300 hover:bg-slate-50'
                }`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {hasFetched && !loading && (
          <p className="text-sm text-slate-500 pt-2 border-t border-slate-100">
            Found <span className="font-bold text-emerald-600">{total}</span> student{total !== 1 ? 's' : ''}
            {hasFilters && <span className="text-slate-300 text-xs ml-1">matching your criteria</span>}
          </p>
        )}
      </div>

      {result && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-700">
              {result.shortlisted} student{result.shortlisted !== 1 ? 's' : ''} shortlisted!
            </p>
            {result.alreadyDone > 0 && (
              <p className="text-xs text-slate-400">{result.alreadyDone} were already in pipeline</p>
            )}
          </div>
          <button onClick={() => setResult(null)} className="text-slate-300 hover:text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Student Table ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <input type="checkbox"
              checked={students.length > 0 && selected.size === students.length}
              onChange={toggleAll}
              className="w-4 h-4 rounded cursor-pointer accent-[#1a2744]"
            />
            <span className="text-xs text-slate-400 font-medium">
              {selected.size > 0
                ? <span className="text-emerald-600 font-semibold">{selected.size} selected</span>
                : 'Select all on this page'}
            </span>
          </div>
          {loading && <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />}
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="w-12 px-5 py-3" />
              <th className="text-left text-[11px] text-slate-400 px-4 py-3 font-semibold uppercase tracking-wide">Student</th>
              <th className="text-left text-[11px] text-slate-400 px-4 py-3 font-semibold uppercase tracking-wide hidden sm:table-cell">Roll No.</th>
              <th className="text-left text-[11px] text-slate-400 px-4 py-3 font-semibold uppercase tracking-wide hidden md:table-cell">Branch</th>
              <th className="text-left text-[11px] text-slate-400 px-4 py-3 font-semibold uppercase tracking-wide">CGPA</th>
              <th className="text-left text-[11px] text-slate-400 px-4 py-3 font-semibold uppercase tracking-wide hidden lg:table-cell">Domain</th>
              <th className="text-left text-[11px] text-slate-400 px-4 py-3 font-semibold uppercase tracking-wide hidden lg:table-cell">Year</th>
              {/* ── NEW column ── */}
              <th className="text-left text-[11px] text-slate-400 px-4 py-3 font-semibold uppercase tracking-wide">Profile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-5 py-3">
                  <div className="h-8 bg-slate-100 rounded-lg animate-pulse" />
                </td></tr>
              ))
            ) : !hasFetched ? (
              <tr><td colSpan={8} className="text-center py-16">
                <Search className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-medium">Use the filters above to search for students</p>
                <p className="text-slate-300 text-xs mt-1">Leave all blank to show all students</p>
              </td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-16">
                <GraduationCap className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-medium">No students found</p>
                <p className="text-slate-300 text-xs mt-1">
                  {hasFilters ? 'Try adjusting your filters' : 'Upload student data first'}
                </p>
                {!hasFilters && (
                  <Link to="/tpo-dashboard/upload"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs text-violet-600 hover:text-violet-700 font-medium">
                    <Upload className="w-3.5 h-3.5" />Upload student data →
                  </Link>
                )}
              </td></tr>
            ) : students.map(s => (
              <tr key={s._id}
                className={`transition-colors ${
                  selected.has(s._id) ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-slate-50'
                }`}
              >
                {/* Checkbox — stop row-click from toggling checkbox only */}
                <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={selected.has(s._id)} onChange={() => toggleOne(s._id)}
                    className="w-4 h-4 rounded cursor-pointer accent-[#1a2744]" />
                </td>

                {/* Clickable cells → open profile */}
                <td className="px-4 py-3 cursor-pointer" onClick={() => setProfileStudent(s)}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      selected.has(s._id) ? 'bg-[#1a2744] text-white' : 'bg-slate-100 text-slate-500'
                    }`}>{s.name?.charAt(0)?.toUpperCase() || '?'}</div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1a2744] leading-tight">{s.name}</p>
                      <p className="text-[10px] text-slate-400 max-w-[160px] truncate">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell cursor-pointer" onClick={() => setProfileStudent(s)}>
                  <span className="text-xs text-slate-500 font-mono">{s.rollNumber || '—'}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell cursor-pointer" onClick={() => setProfileStudent(s)}>
                  <span className="text-xs text-slate-500">{s.branch || '—'}</span>
                </td>
                <td className="px-4 py-3 cursor-pointer" onClick={() => setProfileStudent(s)}>
                  <span className={`text-sm font-bold ${
                    !s.cgpa       ? 'text-slate-300'    :
                    s.cgpa >= 8.5 ? 'text-emerald-600' :
                    s.cgpa >= 7.5 ? 'text-blue-600'    :
                    s.cgpa >= 6.5 ? 'text-amber-600'   : 'text-red-500'
                  }`}>{s.cgpa ?? '—'}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell cursor-pointer" onClick={() => setProfileStudent(s)}>
                  {s.domain ? (
                    <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                      {s.domain}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell cursor-pointer" onClick={() => setProfileStudent(s)}>
                  <span className="text-xs text-slate-500">{s.passingYear || '—'}</span>
                </td>

                {/* ── NEW: explicit View Profile button ── */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => setProfileStudent(s)}
                    className="flex items-center gap-1 text-[11px] text-[#1a2744] font-semibold border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 hover:text-blue-600 px-2.5 py-1.5 rounded-lg transition-all"
                  >
                    <Users className="w-3 h-3" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-400 font-medium">{total} total students</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="text-xs px-3 py-1.5 bg-white hover:bg-slate-100 disabled:opacity-30 text-slate-600 border border-slate-200 rounded-lg transition-all font-medium shadow-sm">Prev</button>
              <span className="text-xs text-slate-400 font-medium">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="text-xs px-3 py-1.5 bg-white hover:bg-slate-100 disabled:opacity-30 text-slate-600 border border-slate-200 rounded-lg transition-all font-medium shadow-sm">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky shortlist bar */}
      {selected.size > 0 && (
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md border border-[#1a2744]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-xl shadow-slate-200">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#1a2744] flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-[#1a2744]">
              {selected.size} student{selected.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          <select value={driveId} onChange={e => setDriveId(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#1a2744] focus:outline-none focus:border-[#1a2744] transition-colors">
            <option value="">— Select drive to shortlist for —</option>
            {drives.length === 0
              ? <option disabled>No active drives — post one first</option>
              : drives.map(d => (
                  <option key={d._id} value={d._id}>{d.company} — {d.title}</option>
                ))
            }
          </select>
          <button onClick={handleShortlist} disabled={shortlisting || !driveId}
            className="flex items-center justify-center gap-2 bg-[#1a2744] hover:bg-[#243460] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-all shrink-0 shadow-sm">
            {shortlisting
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><CheckCircle2 className="w-4 h-4" />Shortlist Now</>
            }
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function TPODashboard() {
  const location = useLocation()

  const renderTab = () => {
    switch (location.pathname) {
      case '/tpo-dashboard/upload':   return <UploadTab />
      case '/tpo-dashboard/students': return <FindStudentsTab />
      default:                        return <HomeTab />
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        {renderTab()}
      </div>
    </DashboardLayout>
  )
}
