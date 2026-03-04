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
        <h1 className="text-2xl font-bold text-white">TPO Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Manage placement drives, students &amp; shortlisting</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Students', val: summary?.totalStudents        ?? '—', icon: GraduationCap,   c: 'text-blue-400',    b: 'bg-blue-500/10' },
          { label: 'Active Drives',  val: summary?.activeJobs           ?? '—', icon: Briefcase,       c: 'text-emerald-400', b: 'bg-emerald-500/10' },
          { label: 'Applications',   val: summary?.totalApplications    ?? '—', icon: FileSpreadsheet, c: 'text-violet-400',  b: 'bg-violet-500/10' },
          { label: 'Placed',         val: summary?.selectedApplications ?? '—', icon: Award,           c: 'text-amber-400',   b: 'bg-amber-500/10' },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
            <div className={`w-8 h-8 ${s.b} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.c}`} />
            </div>
            <p className="text-xl font-bold text-white">{loading ? '—' : s.val}</p>
            <p className="text-[11px] text-white/35 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Post Drive',    icon: Plus,          to: '/jobs/new',               cls: 'border-blue-500/20    bg-blue-500/5    hover:bg-blue-500/10' },
          { label: 'Find Students', icon: GraduationCap, to: '/tpo-dashboard/students', cls: 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10' },
          { label: 'Upload Data',   icon: Upload,        to: '/tpo-dashboard/upload',   cls: 'border-violet-500/20  bg-violet-500/5  hover:bg-violet-500/10' },
          { label: 'Analytics',     icon: BarChart2,     to: '/analytics',              cls: 'border-amber-500/20   bg-amber-500/5   hover:bg-amber-500/10' },
        ].map(a => (
          <Link key={a.label} to={a.to}
            className={`flex flex-col items-center gap-2 py-5 px-3 border rounded-2xl transition-all ${a.cls}`}>
            <a.icon className="w-5 h-5 text-white/60" />
            <span className="text-[11px] text-white/55 font-medium">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <h2 className="font-semibold text-white text-sm mb-4">Recent Applications</h2>
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-12 bg-white/[0.03] rounded-xl animate-pulse mb-2" />)
        ) : recentApps.length === 0 ? (
          <p className="text-white/25 text-sm text-center py-8">No applications yet</p>
        ) : recentApps.map(app => (
          <div key={app._id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.03] rounded-xl transition-all">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
              {app.student?.name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-white font-medium truncate">{app.student?.name || 'Unknown'}</p>
              <p className="text-[11px] text-white/40 truncate">{app.job?.title} · {app.job?.company}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
              app.status === 'selected'    ? 'bg-emerald-500/15 text-emerald-400' :
              app.status === 'shortlisted' ? 'bg-amber-500/15   text-amber-400'   :
              app.status === 'rejected'    ? 'bg-red-500/15     text-red-400'     :
              'bg-white/5 text-white/40'
            }`}>{app.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD TAB
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
        <h2 className="text-xl font-bold text-white">Upload Student Data</h2>
        <p className="text-white/40 text-sm mt-1">
          Upload Excel or CSV once — data is permanently stored in the database.
          After this, use <strong className="text-emerald-400">Find Students</strong> tab to filter and shortlist anytime.
        </p>
      </div>

      {/* Template */}
      <div className="flex items-center gap-3 bg-blue-500/[0.05] border border-blue-500/20 rounded-xl px-4 py-3">
        <FileSpreadsheet className="w-5 h-5 text-blue-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">Download template first</p>
          <p className="text-xs text-white/40">CSV with all columns including Domain &amp; Specialization</p>
        </div>
        <button onClick={downloadTemplate}
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 rounded-lg transition-all shrink-0">
          <Download className="w-3.5 h-3.5" />Download CSV Template
        </button>
      </div>

      {/* Formats */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-white/30">Supported:</span>
        {['.xlsx', '.xls', '.csv'].map(f => (
          <span key={f} className="text-xs bg-white/[0.05] text-white/50 px-2 py-0.5 rounded-md font-mono">{f}</span>
        ))}
        <span className="text-xs text-white/20 ml-1">· Include a "Domain" column for specialization</span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl py-14 text-center cursor-pointer transition-all select-none ${
          dragOver    ? 'border-violet-400/50 bg-violet-500/[0.08]' :
          rows.length ? 'border-emerald-500/30 bg-emerald-500/[0.04]' :
                        'border-white/[0.10] bg-white/[0.02] hover:border-violet-500/30 hover:bg-violet-500/[0.04]'
        }`}
      >
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleInputChange} className="hidden" />
        {rows.length > 0 ? (
          <>
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-white font-semibold">{fileName}</p>
            <p className="text-emerald-400 text-sm mt-1">{rows.length} students loaded · Click to change</p>
          </>
        ) : (
          <>
            <Upload className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 font-medium">Click to select file or drag &amp; drop here</p>
            <p className="text-white/20 text-xs mt-1">Excel (.xlsx, .xls) or CSV files</p>
          </>
        )}
      </div>

      {/* Parse error */}
      {parseError && (
        <div className="flex items-start gap-3 bg-red-500/[0.06] border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400">File Error</p>
            <p className="text-xs text-red-400/70 mt-0.5">{parseError}</p>
          </div>
        </div>
      )}

      {/* Preview */}
      {rows.length > 0 && headers.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
            <span className="text-sm font-semibold text-white">{rows.length} students ready to upload</span>
            <span className="text-white/25 text-xs">preview: first 5 rows</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  {headers.map(h => (
                    <th key={h} className="text-left text-[11px] text-white/30 px-4 py-2.5 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {rows.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {headers.map(h => (
                      <td key={h} className="px-4 py-2.5 text-xs text-white/55 whitespace-nowrap">{String(row[h] ?? '—')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 5 && (
            <p className="text-center text-white/20 text-xs py-2 border-t border-white/[0.04]">
              + {rows.length - 5} more rows
            </p>
          )}
        </div>
      )}

      {/* Upload button */}
      {rows.length > 0 && (
        <button onClick={handleUpload} disabled={uploading}
          className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
          {uploading ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving to database...</>
          ) : (
            <><Upload className="w-4 h-4" />Save {rows.length} Students to Database</>
          )}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className="bg-emerald-500/[0.06] border border-emerald-500/25 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-emerald-400">Upload Complete — Data saved permanently</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { val: result.created, label: 'New Students', c: 'text-emerald-400' },
              { val: result.updated, label: 'Updated',      c: 'text-blue-400' },
              { val: result.failed,  label: 'Failed',       c: 'text-red-400' },
            ].map(s => (
              <div key={s.label} className="bg-white/[0.03] rounded-xl py-3">
                <p className={`text-2xl font-bold ${s.c}`}>{s.val}</p>
                <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          {result.errors?.length > 0 && (
            <div className="bg-red-500/[0.05] border border-red-500/15 rounded-xl p-3">
              <p className="text-xs font-semibold text-red-400 mb-1">Errors:</p>
              {result.errors.map((e, i) => <p key={i} className="text-xs text-red-300/60">{e}</p>)}
            </div>
          )}
          <Link to="/tpo-dashboard/students"
            className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl transition-all text-sm">
            <GraduationCap className="w-4 h-4" />Go to Find Students →
          </Link>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FIND STUDENTS TAB — with domain filter
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
  const LIMIT = 15

  // Filters
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

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white">Find Students</h2>
          <p className="text-white/40 text-sm mt-0.5">Filter by criteria &amp; domain, then shortlist for a drive</p>
        </div>
        <Link to="/tpo-dashboard/upload"
          className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 border border-violet-500/20 bg-violet-500/[0.06] px-3 py-2 rounded-xl transition-all">
          <Upload className="w-3.5 h-3.5" />Upload / Update Data
        </Link>
      </div>

      {/* ── Filter Panel ── */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white">Filter Criteria</span>
          </div>
          {hasFilters && (
            <button onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-white/35 hover:text-white/60 transition-colors">
              <RefreshCw className="w-3 h-3" />Reset
            </button>
          )}
        </div>

        {/* Search box */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
          <input type="text"
            placeholder="Search by name, email or roll number..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>

        {/* Numeric / text filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Min CGPA',     val: minCGPA,     set: setMinCGPA,     type: 'number', ph: 'e.g. 7.0', step: '0.1', min: '0', max: '10' },
            { label: 'Max CGPA',     val: maxCGPA,     set: setMaxCGPA,     type: 'number', ph: 'e.g. 10',  step: '0.1', min: '0', max: '10' },
            { label: 'Branch',       val: branch,      set: setBranch,      type: 'text',   ph: 'e.g. CS' },
            { label: 'Passing Year', val: passingYear, set: setPassingYear, type: 'number', ph: 'e.g. 2025' },
            { label: 'Max Backlogs', val: maxBacklogs, set: setMaxBacklogs, type: 'number', ph: 'e.g. 0',   min: '0' },
          ].map(f => (
            <div key={f.label}>
              <label className="text-[11px] text-white/35 mb-1.5 block">{f.label}</label>
              <input type={f.type} placeholder={f.ph} value={f.val} step={f.step} min={f.min} max={f.max}
                onChange={e => f.set(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          ))}
        </div>

        {/* ── Domain filter pills ── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-[11px] text-white/35 font-medium">Specialization Domain</label>
            {domain && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {domain}
                <button onClick={() => setDomain('')} className="hover:text-white ml-0.5">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {DOMAINS.map(d => (
              <button key={d} onClick={() => setDomain(prev => prev === d ? '' : d)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  domain === d
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold'
                    : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/60 hover:bg-white/[0.05]'
                }`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        {hasFetched && !loading && (
          <p className="text-sm text-white/40 pt-1 border-t border-white/[0.04]">
            Found <span className="font-bold text-emerald-400">{total}</span> student{total !== 1 ? 's' : ''}
            {hasFilters && <span className="text-white/25 text-xs ml-1">matching your criteria</span>}
          </p>
        )}
      </div>

      {/* Shortlist result banner */}
      {result && (
        <div className="flex items-center gap-3 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-400">
              {result.shortlisted} student{result.shortlisted !== 1 ? 's' : ''} shortlisted!
            </p>
            {result.alreadyDone > 0 && (
              <p className="text-xs text-white/30">{result.alreadyDone} were already in pipeline</p>
            )}
          </div>
          <button onClick={() => setResult(null)} className="text-white/20 hover:text-white/50">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Student Table ── */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">

        {/* Select-all header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <input type="checkbox"
              checked={students.length > 0 && selected.size === students.length}
              onChange={toggleAll}
              className="w-4 h-4 rounded cursor-pointer accent-emerald-500"
            />
            <span className="text-xs text-white/40">
              {selected.size > 0
                ? <span className="text-emerald-400 font-semibold">{selected.size} selected</span>
                : 'Select all on this page'}
            </span>
          </div>
          {loading && <div className="w-4 h-4 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />}
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              <th className="w-12 px-5 py-3" />
              <th className="text-left text-[11px] text-white/25 px-4 py-3 font-medium">Student</th>
              <th className="text-left text-[11px] text-white/25 px-4 py-3 font-medium hidden sm:table-cell">Roll No.</th>
              <th className="text-left text-[11px] text-white/25 px-4 py-3 font-medium hidden md:table-cell">Branch</th>
              <th className="text-left text-[11px] text-white/25 px-4 py-3 font-medium">CGPA</th>
              <th className="text-left text-[11px] text-white/25 px-4 py-3 font-medium hidden lg:table-cell">Domain</th>
              <th className="text-left text-[11px] text-white/25 px-4 py-3 font-medium hidden lg:table-cell">Year</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-5 py-3">
                  <div className="h-8 bg-white/[0.04] rounded-lg animate-pulse" />
                </td></tr>
              ))
            ) : !hasFetched ? (
              <tr><td colSpan={7} className="text-center py-16">
                <Search className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <p className="text-white/25 text-sm">Use the filters above to search for students</p>
                <p className="text-white/15 text-xs mt-1">Leave all blank to show all students</p>
              </td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16">
                <GraduationCap className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <p className="text-white/25 text-sm font-medium">No students found</p>
                <p className="text-white/15 text-xs mt-1">
                  {hasFilters ? 'Try adjusting your filters' : 'Upload student data first'}
                </p>
                {!hasFilters && (
                  <Link to="/tpo-dashboard/upload"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs text-violet-400 hover:text-violet-300">
                    <Upload className="w-3.5 h-3.5" />Upload student data →
                  </Link>
                )}
              </td></tr>
            ) : students.map(s => (
              <tr key={s._id} onClick={() => toggleOne(s._id)}
                className={`cursor-pointer transition-colors ${
                  selected.has(s._id) ? 'bg-emerald-500/[0.07] hover:bg-emerald-500/[0.09]' : 'hover:bg-white/[0.02]'
                }`}>
                <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={selected.has(s._id)} onChange={() => toggleOne(s._id)}
                    className="w-4 h-4 rounded cursor-pointer accent-emerald-500" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      selected.has(s._id) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.06] text-white/40'
                    }`}>{s.name?.charAt(0)?.toUpperCase() || '?'}</div>
                    <div>
                      <p className="text-[13px] font-medium text-white leading-tight">{s.name}</p>
                      <p className="text-[10px] text-white/35 max-w-[160px] truncate">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-xs text-white/45 font-mono">{s.rollNumber || '—'}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs text-white/45">{s.branch || '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-bold ${
                    !s.cgpa       ? 'text-white/25'    :
                    s.cgpa >= 8.5 ? 'text-emerald-400' :
                    s.cgpa >= 7.5 ? 'text-blue-400'    :
                    s.cgpa >= 6.5 ? 'text-amber-400'   : 'text-red-400'
                  }`}>{s.cgpa ?? '—'}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {s.domain ? (
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                      {s.domain}
                    </span>
                  ) : (
                    <span className="text-xs text-white/20">—</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-xs text-white/45">{s.passingYear || '—'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05]">
            <span className="text-xs text-white/30">{total} total students</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="text-xs px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.07] disabled:opacity-30 text-white rounded-lg transition-all">Prev</button>
              <span className="text-xs text-white/35">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="text-xs px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.07] disabled:opacity-30 text-white rounded-lg transition-all">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky shortlist bar ── */}
      {selected.size > 0 && (
        <div className="sticky bottom-4 z-20 bg-[#0c1221]/95 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-2xl shadow-black/50">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-sm font-semibold text-white">
              {selected.size} student{selected.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          <select value={driveId} onChange={e => setDriveId(e.target.value)}
            className="flex-1 bg-white/[0.08] border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors">
            <option value="" className="bg-[#0c1221]">— Select drive to shortlist for —</option>
            {drives.length === 0
              ? <option disabled className="bg-[#0c1221]">No active drives — post one first</option>
              : drives.map(d => (
                  <option key={d._id} value={d._id} className="bg-[#0c1221]">{d.company} — {d.title}</option>
                ))
            }
          </select>
          <button onClick={handleShortlist} disabled={shortlisting || !driveId}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-all shrink-0">
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
// MAIN — renders correct tab based on route
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