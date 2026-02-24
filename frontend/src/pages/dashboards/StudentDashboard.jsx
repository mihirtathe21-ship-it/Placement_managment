import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/ui/StatCard'
import { useAuth } from '../../context/AuthContext'
import { Briefcase, CheckCircle, Clock, Star, ChevronRight, MapPin, Building2 } from 'lucide-react'

const jobListings = [
  { company: 'Google', role: 'SDE Intern', package: '₹8L', location: 'Bangalore', deadline: 'Nov 30', match: 92 },
  { company: 'Microsoft', role: 'Software Engineer', package: '₹18L', location: 'Hyderabad', deadline: 'Dec 8', match: 88 },
  { company: 'Infosys', role: 'Systems Engineer', package: '₹4.5L', location: 'Pune', deadline: 'Dec 15', match: 95 },
]

export default function StudentDashboard() {
  const { user } = useAuth()

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="animate-slide-up space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-white mb-1">
              Hello, {user?.name?.split(' ')[0]} 🎓
            </h1>
            <p className="text-white/40 text-sm">Track your placement journey and discover opportunities.</p>
          </div>
          <div className="glass-card px-4 py-3 flex items-center gap-3">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider">Profile Strength</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-navy-400 to-cyan-400 rounded-full" />
                </div>
                <span className="text-white/70 text-xs font-semibold">75%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={Briefcase} label="Applied Jobs" value="12" color="navy" />
          <StatCard icon={CheckCircle} label="Shortlisted" value="4" color="green" />
          <StatCard icon={Clock} label="In Progress" value="3" color="gold" />
          <StatCard icon={Star} label="Offers" value="1" color="purple" />
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold text-white">Recommended Jobs</h2>
            <button className="text-navy-400 hover:text-navy-300 text-xs font-semibold flex items-center gap-1 transition-colors">
              Browse All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {jobListings.map((job, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/5 hover:border-navy-400/30 hover:bg-white/5 transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-500/30 to-navy-600/20 border border-navy-400/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-navy-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-semibold text-sm">{job.role}</p>
                    <span className="text-white/30 text-xs">at {job.company}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-white/40 text-xs"><MapPin className="w-3 h-3" />{job.location}</span>
                    <span className="text-green-400 text-xs font-semibold">{job.package}</span>
                    <span className="text-white/30 text-xs">Deadline: {job.deadline}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-xs font-semibold text-navy-300 bg-navy-500/15 px-2 py-0.5 rounded-full">
                    {job.match}% match
                  </span>
                  <button className="text-xs font-semibold text-white/0 group-hover:text-navy-400 transition-colors">
                    Apply →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
