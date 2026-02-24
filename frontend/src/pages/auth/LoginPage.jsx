import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, LogIn, Briefcase } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const ROLE_PATHS = {
  admin: '/admin-dashboard',
  tpo: '/tpo-dashboard',
  student: '/student-dashboard',
  recruiter: '/recruiter-dashboard',
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const user = await login(data.email, data.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(ROLE_PATHS[user.role] || '/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen mesh-bg noise flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-navy-600/20 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-12 right-12 w-72 h-72 bg-navy-400/10 rounded-full blur-3xl animate-float" style={{animationDelay:'3s'}} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-navy-400 to-navy-600 rounded-xl flex items-center justify-center shadow-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">PlaceNext</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <p className="text-navy-300 text-sm font-semibold uppercase tracking-widest">Placement Analytics</p>
            <h1 className="font-display text-5xl font-bold text-white leading-tight">
              Shape the Future of<br />
              <span className="gradient-text">Campus Placements</span>
            </h1>
            <p className="text-white/40 text-lg max-w-sm leading-relaxed">
              A unified platform for students, recruiters, and placement officers to collaborate seamlessly.
            </p>
          </div>

          <div className="flex gap-8">
            {[
              { label: 'Companies', value: '200+' },
              { label: 'Placements', value: '1.8K' },
              { label: 'Avg Package', value: '₹12L' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="font-display text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-white/40 text-xs uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/20 text-xs">© 2024 PlaceNext. Final Year Project.</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center p-8 lg:p-12 relative z-10">
        <div className="animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-navy-400 to-navy-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-white">PlaceNext</span>
          </div>

          <div className="glass-card p-8">
            <div className="mb-8">
              <h2 className="font-display text-3xl font-bold text-white mb-2">Sign In</h2>
              <p className="text-white/40 text-sm">Enter your credentials to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label-text">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    placeholder="you@college.edu"
                    className={`input-field pl-10 ${errors.email ? 'error' : ''}`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                    })}
                  />
                </div>
                {errors.email && <p className="error-text">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label-text">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`input-field pl-10 pr-11 ${errors.password ? 'error' : ''}`}
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="error-text">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary flex items-center justify-center gap-2 mt-2">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-white/40 text-sm">
                New to PlaceNext?{' '}
                <Link to="/register" className="text-navy-400 hover:text-navy-300 font-semibold transition-colors">
                  Create account
                </Link>
              </p>
            </div>

            {/* Demo hint */}
            <div className="mt-4 p-3 rounded-xl bg-gold-500/5 border border-gold-500/10">
              <p className="text-gold-400/70 text-xs text-center font-mono">
                ℹ️ Admin & TPO accounts are created manually via DB seed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
