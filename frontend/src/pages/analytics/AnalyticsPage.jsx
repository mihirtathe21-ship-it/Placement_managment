import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import {
  Briefcase, Building2, GraduationCap, Award
} from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'

const COLORS = ['#1a2744', '#3b5bdb', '#2f9e44', '#e67700', '#c92a2a', '#1971c2']

const StatCard = ({ icon: Icon, label, value, sub, bgColor, iconColor, borderColor }) => (
  <div className={`bg-white border ${borderColor} rounded-2xl p-5 shadow-sm`}>
    <div className="flex items-start justify-between mb-3">
      <div className={`w-9 h-9 rounded-xl ${bgColor} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      {sub && (
        <span className="text-xs text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
          {sub}
        </span>
      )}
    </div>
    <div className="text-2xl font-bold text-[#1a2744]">{value}</div>
    <div className="text-xs text-slate-400 mt-0.5 font-medium">{label}</div>
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs shadow-lg">
      <p className="text-slate-500 mb-2 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState(null)
  const [branchData, setBranchData] = useState([])
  const [timeData, setTimeData] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [s, b, t, c] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/by-branch'),
          api.get('/analytics/over-time'),
          api.get('/analytics/top-companies'),
        ])
        setSummary(s.data)
        setBranchData(b.data.data)
        setTimeData(t.data.data)
        setCompanies(c.data.data)
      } catch {
        toast.error('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-[#1a2744] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-[#1a2744] pb-16">

      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold text-[#1a2744]">Placement Analytics</h1>
          <p className="text-slate-400 text-xs mt-0.5 font-medium">Real-time placement statistics and insights</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              icon={GraduationCap} label="Total Students" value={summary.totalStudents}
              bgColor="bg-blue-50" iconColor="text-blue-600" borderColor="border-blue-100"
            />
            <StatCard
              icon={Building2} label="Recruiters" value={summary.totalRecruiters}
              bgColor="bg-violet-50" iconColor="text-violet-600" borderColor="border-violet-100"
            />
            <StatCard
              icon={Briefcase} label="Active Drives" value={summary.activeJobs}
              sub={`${summary.totalJobs} total`}
              bgColor="bg-slate-100" iconColor="text-[#1a2744]" borderColor="border-slate-200"
            />
            <StatCard
              icon={Award} label="Placement Rate" value={`${summary.placementRate}%`}
              sub={`${summary.selectedApplications} placed`}
              bgColor="bg-emerald-50" iconColor="text-emerald-600" borderColor="border-emerald-100"
            />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Applications Over Time */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-[#1a2744] mb-1">Applications Over Time</h3>
            <p className="text-slate-400 text-xs mb-5">Monthly application and selection trends</p>
            {timeData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-300 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="applications" stroke="#1a2744" strokeWidth={2} dot={false} name="Applications" />
                  <Line type="monotone" dataKey="selected" stroke="#2f9e44" strokeWidth={2} dot={false} name="Selected" />
                </LineChart>
              </ResponsiveContainer>
            )}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
              <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span className="w-4 h-0.5 bg-[#1a2744] rounded-full inline-block" />Applications
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span className="w-4 h-0.5 bg-[#2f9e44] rounded-full inline-block" />Selected
              </span>
            </div>
          </div>

          {/* Branch-wise Placement */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-[#1a2744] mb-1">Branch-wise Placements</h3>
            <p className="text-slate-400 text-xs mb-5">Students placed per department</p>
            {branchData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-300 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={branchData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="branch" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" fill="#e2e8f0" radius={[0, 4, 4, 0]} name="Total" />
                  <Bar dataKey="placed" fill="#1a2744" radius={[0, 4, 4, 0]} name="Placed" />
                </BarChart>
              </ResponsiveContainer>
            )}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
              <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span className="w-3 h-3 bg-[#1a2744] rounded-sm inline-block" />Placed
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span className="w-3 h-3 bg-slate-200 rounded-sm inline-block" />Total
              </span>
            </div>
          </div>
        </div>

        {/* Placement Rate by Branch */}
        {branchData.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-[#1a2744] mb-5">Placement Rate by Branch</h3>
            <div className="space-y-3.5">
              {branchData.map((b, i) => (
                <div key={b.branch} className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 w-36 shrink-0 truncate font-medium">{b.branch}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${b.rate}%`, backgroundColor: COLORS[i % COLORS.length] }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[#1a2744] w-10 text-right">{b.rate}%</span>
                  <span className="text-xs text-slate-400 w-16 text-right font-medium">{b.placed}/{b.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Companies */}
        {companies.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-[#1a2744] mb-5">Top Recruiting Companies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {companies.map((c, i) => (
                <div key={c.company}
                  className="flex items-center gap-3 bg-slate-50 hover:bg-white rounded-xl p-3.5 border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
                  <div className="w-8 h-8 rounded-lg bg-[#1a2744] flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1a2744] truncate">{c.company}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.hired} hired · {c.jobCount} drive{c.jobCount !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-emerald-700">{c.hired}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
