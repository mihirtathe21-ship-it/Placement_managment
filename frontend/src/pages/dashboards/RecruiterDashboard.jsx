import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/ui/StatCard'
import { useAuth } from '../../context/AuthContext'
import { Users, Briefcase, CheckCircle, TrendingUp, Plus } from 'lucide-react'

const candidates = [
  { name: 'Priya Patel', branch: 'CSE', cgpa: '9.2', skills: ['React', 'Node.js'], status: 'Shortlisted' },
  { name: 'Arjun Mehta', branch: 'IT', cgpa: '8.7', skills: ['Python', 'ML'], status: 'In Review' },
  { name: 'Sneha Rao', branch: 'CSE', cgpa: '9.5', skills: ['Java', 'Spring'], status: 'Offered' },
  { name: 'Karan Shah', branch: 'ECE', cgpa: '8.1', skills: ['Embedded', 'C++'], status: 'Pending' },
]

const statusStyle = {
  'Shortlisted': 'bg-navy-500/15 text-navy-300',
  'In Review': 'bg-gold-500/15 text-gold-400',
  'Offered': 'bg-green-500/15 text-green-400',
  'Pending': 'bg-white/10 text-white/40',
}

export default function RecruiterDashboard() {
  const { user } = useAuth()

  return (
    <DashboardLayout title="Recruiter Dashboard">
      <div className="animate-slide-up space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-white mb-1">
              Recruiter Portal
            </h1>
            <p className="text-white/40 text-sm">{user?.companyName || 'Your Company'} — Find the best talent on campus.</p>
          </div>
          <button className="btn-primary max-w-[180px] flex items-center justify-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Post New Job
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={Briefcase} label="Active Jobs" value="4" color="navy" />
          <StatCard icon={Users} label="Applicants" value="287" change="+34" color="green" />
          <StatCard icon={CheckCircle} label="Shortlisted" value="42" color="gold" />
          <StatCard icon={TrendingUp} label="Offers Made" value="8" color="purple" />
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold text-white">Top Candidates</h2>
            <span className="text-white/30 text-xs">{candidates.length} candidates</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Candidate', 'Branch', 'CGPA', 'Skills', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs uppercase tracking-wider text-white/30 font-semibold pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {candidates.map((c, i) => (
                  <tr key={i} className="hover:bg-white/2 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-navy-400 to-navy-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <span className="text-white font-medium text-sm">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-white/50 text-sm">{c.branch}</td>
                    <td className="py-3.5 pr-4 text-white/80 text-sm font-mono">{c.cgpa}</td>
                    <td className="py-3.5 pr-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {c.skills.map(s => (
                          <span key={s} className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-white/50">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${statusStyle[c.status]}`}>{c.status}</span>
                    </td>
                    <td className="py-3.5">
                      <button className="text-navy-400 hover:text-navy-300 text-xs font-semibold transition-colors">View →</button>
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
