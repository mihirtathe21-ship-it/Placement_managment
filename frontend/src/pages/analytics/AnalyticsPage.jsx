import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  Users, Briefcase, TrendingUp, Building2,
  GraduationCap, Award, Target, Activity
} from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'

const COLORS = ['#4f8ef7', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#38bdf8']

const StatCard = ({ icon: Icon, label, value, sub, color = 'text-navy-400' }) => (
  <div className="bg-white/3 border border-white/5 rounded-2xl p-5">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-9 h-9 rounded-xl bg-current/10 flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      {sub && <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{sub}</span>}
    </div>
    <div className="text-2xl font-display font-bold text-white">{value}</div>
    <div className="text-xs text-white/40 mt-0.5">{label}</div>
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0d1425] border border-white/10 rounded-xl p-3 text-xs">
      <p className="text-white/60 mb-2">{label}</p>
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
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-navy-500/30 border-t-navy-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white pb-16">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0d1425]/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="font-display text-xl font-bold text-white">Placement Analytics</h1>
          <p className="text-white/40 text-xs mt-0.5">Real-time placement statistics and insights</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard icon={GraduationCap} label="Total Students" value={summary.totalStudents} color="text-blue-400" />
            <StatCard icon={Building2} label="Recruiters" value={summary.totalRecruiters} color="text-purple-400" />
            <StatCard icon={Briefcase} label="Active Drives" value={summary.activeJobs} sub={`${summary.totalJobs} total`} color="text-navy-400" />
            <StatCard
              icon={Award}
              label="Placement Rate"
              value={`${summary.placementRate}%`}
              sub={`${summary.selectedApplications} placed`}
              color="text-emerald-400"
            />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications Over Time */}
          <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-1">Applications Over Time</h3>
            <p className="text-white/30 text-xs mb-5">Monthly application and selection trends</p>
            {timeData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-white/20 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="applications" stroke="#4f8ef7" strokeWidth={2} dot={false} name="Applications" />
                  <Line type="monotone" dataKey="selected" stroke="#34d399" strokeWidth={2} dot={false} name="Selected" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Branch-wise Placement */}
          <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-1">Branch-wise Placements</h3>
            <p className="text-white/30 text-xs mb-5">Students placed per department</p>
            {branchData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-white/20 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={branchData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="branch" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="placed" fill="#4f8ef7" radius={[0, 4, 4, 0]} name="Placed" />
                  <Bar dataKey="total" fill="rgba(255,255,255,0.05)" radius={[0, 4, 4, 0]} name="Total" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Placement Rate by Branch */}
        {branchData.length > 0 && (
          <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-5">Placement Rate by Branch</h3>
            <div className="space-y-3">
              {branchData.map((b, i) => (
                <div key={b.branch} className="flex items-center gap-4">
                  <span className="text-xs text-white/50 w-36 shrink-0 truncate">{b.branch}</span>
                  <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${b.rate}%`,
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-white/60 w-12 text-right">{b.rate}%</span>
                  <span className="text-xs text-white/30 w-16 text-right">{b.placed}/{b.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Companies */}
        {companies.length > 0 && (
          <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-5">Top Recruiting Companies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {companies.map((c, i) => (
                <div key={c.company} className="flex items-center gap-3 bg-white/3 rounded-xl p-3 border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-500/30 to-navy-700/30 flex items-center justify-center text-sm font-bold text-navy-300">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{c.company}</p>
                    <p className="text-xs text-white/40">{c.hired} hired · {c.jobCount} drive{c.jobCount !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="shrink-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-emerald-400">{c.hired}</span>
                    </div>
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