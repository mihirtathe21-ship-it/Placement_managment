export default function StatCard({ icon: Icon, label, value, change, color = 'navy' }) {
  const colors = {
    navy: 'from-navy-500/20 to-navy-600/10 border-navy-500/20',
    green: 'from-green-500/20 to-green-600/10 border-green-500/20',
    gold: 'from-gold-500/20 to-gold-600/10 border-gold-500/20',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
    red: 'from-red-500/20 to-red-600/10 border-red-500/20',
  }
  const iconColors = {
    navy: 'text-navy-300',
    green: 'text-green-300',
    gold: 'text-gold-400',
    purple: 'text-purple-300',
    red: 'text-red-300',
  }

  return (
    <div className={`glass-card p-5 bg-gradient-to-br ${colors[color]} hover:scale-[1.01] transition-all duration-200`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider font-semibold mb-2">{label}</p>
          <p className="font-display text-3xl font-bold text-white">{value}</p>
          {change && (
            <p className={`text-xs mt-1.5 font-medium ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
              {change} from last month
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-xl bg-white/5 ${iconColors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
