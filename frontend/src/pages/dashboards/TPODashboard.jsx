import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/ui/StatCard'
import { useAuth } from '../../context/AuthContext'
import { GraduationCap, Briefcase, TrendingUp, Calendar, ChevronRight } from 'lucide-react'

const upcomingDrives = [
  { company: 'Infosys', date: 'Nov 28, 2024', roles: ['SDE', 'Analyst'], eligible: 156, status: 'Confirmed' },
  { company: 'TCS', date: 'Dec 5, 2024', roles: ['Developer'], eligible: 203, status: 'Pending' },
  { company: 'Wipro', date: 'Dec 12, 2024', roles: ['Engineer', 'QA'], eligible: 178, status: 'Confirmed' },
]

export default function TPODashboard() {
  const { user } = useAuth()

  return (
    <DashboardLayout title="TPO Dashboard">
      <div className="animate-slide-up space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">
            TPO Portal — {user?.name}
          </h1>
          <p className="text-white/40 text-sm">Manage placement activities and student readiness.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={GraduationCap} label="Eligible Students" value="892" change="+12" color="navy" />
          <StatCard icon={Briefcase} label="Active Drives" value="7" color="green" />
          <StatCard icon={TrendingUp} label="Placed This Year" value="543" change="+67" color="gold" />
          <StatCard icon={Calendar} label="Upcoming Drives" value="3" color="purple" />
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold text-white">Upcoming Placement Drives</h2>
            <button className="text-navy-400 hover:text-navy-300 text-xs font-semibold flex items-center gap-1 transition-colors">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs uppercase tracking-wider text-white/30 font-semibold pb-3">Company</th>
                  <th className="text-left text-xs uppercase tracking-wider text-white/30 font-semibold pb-3">Date</th>
                  <th className="text-left text-xs uppercase tracking-wider text-white/30 font-semibold pb-3">Roles</th>
                  <th className="text-left text-xs uppercase tracking-wider text-white/30 font-semibold pb-3">Eligible</th>
                  <th className="text-left text-xs uppercase tracking-wider text-white/30 font-semibold pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {upcomingDrives.map((drive, i) => (
                  <tr key={i} className="hover:bg-white/2 transition-colors">
                    <td className="py-3.5 text-white font-semibold text-sm">{drive.company}</td>
                    <td className="py-3.5 text-white/60 text-sm">{drive.date}</td>
                    <td className="py-3.5">
                      <div className="flex gap-1.5 flex-wrap">
                        {drive.roles.map(r => (
                          <span key={r} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-white/60">{r}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 text-white/60 text-sm">{drive.eligible}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        drive.status === 'Confirmed' ? 'bg-green-500/15 text-green-400' : 'bg-gold-500/15 text-gold-400'
                      }`}>
                        {drive.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
