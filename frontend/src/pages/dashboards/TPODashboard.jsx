import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Users, Briefcase, BarChart2, Upload, ChevronRight,
  Search, CheckCircle2, GraduationCap, FileSpreadsheet,
  Download, Filter, Edit3, X, Award, AlertCircle
} from 'lucide-react'
import * as XLSX from 'xlsx'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import toast from 'react-hot-toast'

// ── Home ──────────────────────────────────────────────────────────────────────
function Home({ summary, recentApps, loading }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">TPO Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Manage placement drives, students & shortlisting</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Students',     val: summary?.totalStudents ?? '—',      icon: GraduationCap, c: 'text-blue-400',    b: 'bg-blue-500/10' },
          { label: 'Active Drives',val: summary?.activeJobs ?? '—',         icon: Briefcase,     c: 'text-emerald-400', b: 'bg-emerald-500/10' },
          { label: 'Applications', val: summary?.totalApplications ?? '—',  icon: FileSpreadsheet,c:'text-violet-400',  b: 'bg-violet-500/10' },
          { label: 'Placed',       val: summary?.selectedApplications ?? '—',icon: Award,        c: 'text-amber-400',   b: 'bg-amber-500/10' },
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

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Post Drive',      icon: Briefcase,      to: '/jobs/new',                color: 'border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10' },
          { label: 'View Students',   icon: GraduationCap,  to: '/tpo-dashboard/students',  color: 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10' },
          { label: 'Excel Shortlist', icon: Upload,         to: '/tpo-dashboard/shortlist', color: 'border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10' },
          { label: 'Analytics',       icon: BarChart2,      to: '/analytics',               color: 'border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10' },
        ].map(a => (
          <Link key={a.label} to={a.to}
            className={`flex flex-col items-center gap-2 py-4 px-3 border rounded-2xl transition-all ${a.color}`}>
            <a.icon className="w-5 h-5 text-white/50" />
            <span className="text-[11px] text-white/50 font-medium text-center">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent applications */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white text-sm">Recent Applications</h2>
          <Link to="/tpo-dashboard/applications" className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>
        ) : recentApps.length === 0 ? (
          <p className="text-white/25 text-sm text-center py-6">No applications yet</p>
        ) : recentApps.map(app => (
          <div key={app._id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.03] rounded-xl transition-all">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-400">
              {app.student?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-white font-medium truncate">{app.student?.name}</p>
              <p className="text-[11px] text-white/40 truncate">{app.job?.title} · {app.job?.company}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              app.status === 'selected' ? 'bg-emerald-500/10 text-emerald-400' :
              app.status === 'shortlisted' ? 'bg-amber-500/10 text-amber-400' :
              app.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
              'bg-white/5 text-white/40'
            }`}>{app.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Student List ──────────────────────────────────────────────────────────────
function StudentList() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/users/students')
      .then(r => setStudents(r.data.students))
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = students.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.branch?.toLowerCase().includes(search.toLowerCase())
  )

  const save = async () => {
    setSaving(true)
    try {
      await api.patch(`/users/${editing._id}/profile`, form)
      setStudents(prev => prev.map(s => s._id === editing._id ? { ...s, ...form } : s))
      toast.success('Student updated')
      setEditing(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Students</h2>
        <p className="text-white/40 text-sm">{students.length} registered</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
        <input type="text" placeholder="Search name, roll no, branch..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-emerald-500/40" />
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Student', 'Roll No.', 'Branch', 'CGPA', 'Year', ''].map(h => (
                <th key={h} className={`text-left text-[11px] text-white/30 px-4 py-3 font-medium ${h === 'Roll No.' || h === 'Branch' ? 'hidden sm:table-cell' : ''} ${h === 'Year' ? 'hidden lg:table-cell' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {loading ? [...Array(5)].map((_, i) => (
              <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-8 bg-white/[0.04] rounded animate-pulse" /></td></tr>
            )) : filtered.map(s => (
              <tr key={s._id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">{s.name?.charAt(0)}</div>
                    <div><p className="text-[13px] font-medium text-white">{s.name}</p><p className="text-[10px] text-white/35">{s.email}</p></div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell"><span className="text-xs text-white/45 font-mono">{s.rollNumber || '—'}</span></td>
                <td className="px-4 py-3 hidden sm:table-cell"><span className="text-xs text-white/45">{s.branch || '—'}</span></td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-bold ${s.cgpa >= 8 ? 'text-emerald-400' : s.cgpa >= 6 ? 'text-amber-400' : s.cgpa ? 'text-red-400' : 'text-white/30'}`}>
                    {s.cgpa ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell"><span className="text-xs text-white/45">{s.passingYear || '—'}</span></td>
                <td className="px-4 py-3">
                  <button onClick={() => { setEditing(s); setForm({ cgpa: s.cgpa, branch: s.branch, passingYear: s.passingYear }) }}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                    <Edit3 className="w-3.5 h-3.5" />Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <p className="text-center text-white/25 text-sm py-10">No students found</p>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1221] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-5">
              <div><h3 className="font-bold text-white">Edit Student</h3><p className="text-white/40 text-xs">{editing.name}</p></div>
              <button onClick={() => setEditing(null)} className="text-white/30 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/40 mb-1 block">CGPA</label>
                <input type="number" step="0.01" min="0" max="10" value={form.cgpa || ''}
                  onChange={e => setForm(p => ({ ...p, cgpa: parseFloat(e.target.value) }))}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/40" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Branch</label>
                <select value={form.branch || ''} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none">
                  {['Computer Science','Information Technology','Electronics','Mechanical','Civil','Electrical'].map(b => (
                    <option key={b} value={b} className="bg-gray-900">{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Passing Year</label>
                <select value={form.passingYear || ''} onChange={e => setForm(p => ({ ...p, passingYear: parseInt(e.target.value) }))}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none">
                  {[2024,2025,2026,2027].map(y => <option key={y} value={y} className="bg-gray-900">{y}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 text-sm bg-white/[0.05] text-white/50 rounded-xl hover:bg-white/[0.08] transition-all">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2.5 text-sm bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Excel Shortlist ───────────────────────────────────────────────────────────
function ExcelShortlist() {
  const [rows, setRows] = useState([])
  const [headers, setHeaders] = useState([])
  const [fileName, setFileName] = useState('')
  const [minCGPA, setMinCGPA] = useState('')
  const [branch, setBranch] = useState('')
  const [minYear, setMinYear] = useState('')
  const [driveId, setDriveId] = useState('')
  const [drives, setDrives] = useState([])
  const [shortlisting, setShortlisting] = useState(false)
  const [result, setResult] = useState(null)
  const fileRef = useRef()

  useEffect(() => {
    api.get('/jobs', { params: { status: 'active', limit: 50 } })
      .then(r => setDrives(r.data.jobs))
      .catch(() => {})
  }, [])

  const handleFile = e => {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    setResult(null)
    const reader = new FileReader()
    reader.onload = evt => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(ws, { header: 1 })
      if (json.length > 0) {
        setHeaders(json[0])
        setRows(json.slice(1).map(row => {
          const obj = {}
          json[0].forEach((h, i) => { obj[h] = row[i] })
          return obj
        }))
      }
    }
    reader.readAsBinaryString(file)
  }

  // Normalize key variations from Excel
  const get = (row, ...keys) => {
    for (const k of keys) {
      const found = Object.keys(row).find(rk => rk.toLowerCase().replace(/\s/g,'') === k.toLowerCase().replace(/\s/g,''))
      if (found && row[found] !== undefined && row[found] !== '') return row[found]
    }
    return null
  }

  const filtered = rows.filter(row => {
    const cgpa = parseFloat(get(row, 'cgpa', 'CGPA', 'Cgpa') || 0)
    const br   = (get(row, 'branch', 'Branch', 'Department') || '').toLowerCase()
    const yr   = parseInt(get(row, 'passingyear', 'PassingYear', 'Passing Year', 'year') || 0)
    const cgpaOk   = !minCGPA  || cgpa >= parseFloat(minCGPA)
    const branchOk = !branch   || br.includes(branch.toLowerCase())
    const yearOk   = !minYear  || yr >= parseInt(minYear)
    return cgpaOk && branchOk && yearOk
  })

  const handleShortlist = async () => {
    if (!driveId) return toast.error('Please select a drive first')
    if (filtered.length === 0) return toast.error('No students match the filters')
    setShortlisting(true)
    try {
      const emails = filtered.map(r => get(r, 'email', 'Email')).filter(Boolean)
      const { data } = await api.post('/applications/bulk-shortlist', { jobId: driveId, emails })
      setResult(data)
      toast.success(`${data.shortlisted} students shortlisted!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Shortlisting failed')
    } finally { setShortlisting(false) }
  }

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Name','Email','Phone','RollNumber','Branch','PassingYear','CGPA'],
      ['Jane Doe','jane@college.edu','9876543210','CS2001','Computer Science','2025','8.5'],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Students')
    XLSX.writeFile(wb, 'shortlist_template.xlsx')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Excel Shortlist</h2>
        <p className="text-white/40 text-sm">Upload an Excel file, filter students by CGPA/branch/year, and shortlist them for a drive</p>
      </div>

      {/* Step 1 — Upload */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Step 1 — Upload Excel</p>
        <div onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-white/[0.08] hover:border-violet-500/30 rounded-xl py-10 text-center cursor-pointer transition-all group">
          <FileSpreadsheet className="w-9 h-9 text-white/15 group-hover:text-violet-400/40 mx-auto mb-3 transition-colors" />
          <p className="text-white/40 text-sm font-medium">{fileName || 'Click to upload .xlsx or .xls'}</p>
          <p className="text-white/20 text-xs mt-1">{rows.length > 0 ? `${rows.length} rows loaded` : 'Excel file required'}</p>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
        </div>
        <button onClick={downloadTemplate}
          className="flex items-center gap-2 text-xs text-white/30 hover:text-violet-400 transition-colors mx-auto mt-3">
          <Download className="w-3.5 h-3.5" />Download template
        </button>
      </div>

      {/* Step 2 — Filter */}
      {rows.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Step 2 — Filter Students</p>
            <span className="text-sm font-bold text-violet-400">{filtered.length} <span className="text-white/30 font-normal">/ {rows.length} match</span></span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">Min CGPA</label>
              <input type="number" step="0.1" min="0" max="10" placeholder="e.g. 7.0"
                value={minCGPA} onChange={e => setMinCGPA(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/40" />
            </div>
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">Branch (contains)</label>
              <input type="text" placeholder="e.g. Computer"
                value={branch} onChange={e => setBranch(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/40" />
            </div>
            <div>
              <label className="text-[11px] text-white/40 mb-1 block">Min Passing Year</label>
              <input type="number" placeholder="e.g. 2025"
                value={minYear} onChange={e => setMinYear(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/40" />
            </div>
          </div>

          {/* Preview table */}
          <div className="rounded-xl border border-white/[0.06] overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  {headers.map(h => (
                    <th key={h} className="text-left text-[11px] text-white/25 px-4 py-2.5 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.slice(0, 8).map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    {headers.map(h => (
                      <td key={h} className="px-4 py-2.5 text-xs text-white/55">{row[h] ?? '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 8 && (
              <p className="text-center text-white/20 text-xs py-2">+{filtered.length - 8} more rows</p>
            )}
            {filtered.length === 0 && (
              <p className="text-center text-white/20 text-sm py-6">No students match the filters</p>
            )}
          </div>
        </div>
      )}

      {/* Step 3 — Select drive & shortlist */}
      {rows.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Step 3 — Select Drive & Shortlist</p>
          <select value={driveId} onChange={e => setDriveId(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/40">
            <option value="" className="bg-gray-900">— Select a drive —</option>
            {drives.map(d => (
              <option key={d._id} value={d._id} className="bg-gray-900">{d.company} — {d.title}</option>
            ))}
          </select>

          <button onClick={handleShortlist} disabled={shortlisting || !driveId || filtered.length === 0}
            className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
            {shortlisting
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><CheckCircle2 className="w-4 h-4" />Shortlist {filtered.length} Students</>
            }
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-emerald-500/[0.05] border border-emerald-500/20 rounded-2xl p-5">
          <h3 className="font-semibold text-emerald-400 mb-3">Shortlisting Complete</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><div className="text-2xl font-bold text-emerald-400">{result.shortlisted}</div><div className="text-xs text-white/40">Shortlisted</div></div>
            <div><div className="text-2xl font-bold text-amber-400">{result.alreadyApplied || 0}</div><div className="text-xs text-white/40">Already applied</div></div>
            <div><div className="text-2xl font-bold text-red-400">{result.notFound || 0}</div><div className="text-xs text-white/40">Not found</div></div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TPODashboard() {
  const location = useLocation()
  const [summary, setSummary] = useState(null)
  const [recentApps, setRecentApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/summary'),
      api.get('/applications', { params: { limit: 6 } }),
    ]).then(([s, a]) => {
      setSummary(s.data)
      setRecentApps(a.data.applications)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const content = () => {
    if (location.pathname === '/tpo-dashboard/students') return <StudentList />
    if (location.pathname === '/tpo-dashboard/shortlist') return <ExcelShortlist />
    return <Home summary={summary} recentApps={recentApps} loading={loading} />
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">{content()}</div>
    </DashboardLayout>
  )
}