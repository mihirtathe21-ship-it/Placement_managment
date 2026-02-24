import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/ui/StatCard'
import { useAuth } from '../../context/AuthContext'
import { Users, GraduationCap, Building2, TrendingUp, ShieldCheck, Activity } from 'lucide-react'

const recentActivity = [
  { action: 'New student registered', user: 'Rahul Sharma', time: '2m ago', type: 'student' },
  { action: 'Recruiter account created', user: 'TechCorp HR', time: '15m ago', type: 'recruiter' },
  { action: 'TPO updated placement data', user: 'Prof. Mehta', time: '1h ago', type: 'tpo' },
  { action: 'New job posted', user: 'Infosys', time: '2h ago', type: 'recruiter' },
  { action: 'Placement drive scheduled', user: 'Prof. Mehta', time: '3h ago', type: 'tpo' },
]

const typeColors = {
  student: 'bg-navy-500/20 text-navy-300',
  recruiter: 'bg-green-500/20 text-green-300',
  tpo: 'bg-purple-500/20 text-purple-300',
}

export default function AdminDashboard() {
  const { user } = useAuth()

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="animate-slide-up space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="text-white/40 text-sm">Here's what's happening on the platform today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={GraduationCap} label="Total Students" value="1,284" change="+23" color="navy" />
          <StatCard icon={Building2} label="Recruiters" value="89" change="+5" color="green" />
          <StatCard icon={TrendingUp} label="Placed Students" value="743" change="+48" color="gold" />
          <StatCard icon={Users} label="Active Users" value="312" color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-bold text-white">Recent Activity</h2>
              <Activity className="w-4 h-4 text-white/30" />
            </div>
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
                  <div className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${typeColors[item.type]}`}>
                    {item.type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm">{item.action}</p>
                    <p className="text-white/40 text-xs mt-0.5">{item.user} · {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-bold text-white">System Status</h2>
              <ShieldCheck className="w-4 h-4 text-green-400" />
            </div>
            <div className="space-y-4">
              {[
                { name: 'API Server', status: 'Operational', pct: 99.9 },
                { name: 'Database', status: 'Operational', pct: 99.7 },
                { name: 'Email Service', status: 'Degraded', pct: 87.2 },
                { name: 'File Storage', status: 'Operational', pct: 100 },
              ].map(service => (
                <div key={service.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white/70 text-sm">{service.name}</span>
                    <span className={`text-xs font-medium ${service.status === 'Operational' ? 'text-green-400' : 'text-gold-400'}`}>
                      {service.status}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${service.pct > 95 ? 'bg-green-400' : 'bg-gold-400'}`}
                      style={{ width: `${service.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
