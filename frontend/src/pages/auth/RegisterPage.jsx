import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  User, Mail, Lock, Eye, EyeOff, UserPlus, Briefcase,
  Building2, GraduationCap, Phone, Hash, BookOpen
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const ROLE_PATHS = {
  student: '/student-dashboard',
  recruiter: '/recruiter-dashboard',
}

const roles = [
  { value: 'student', label: 'Student', icon: GraduationCap, desc: 'Looking for placements' },
  { value: 'recruiter', label: 'Recruiter', icon: Building2, desc: 'Hiring talent' },
]

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [selectedRole, setSelectedRole] = useState('student')
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { role: 'student' }
  })

  const password = watch('password')

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const payload = { ...data, role: selectedRole }
      const user = await registerUser(payload)
      toast.success(`Account created! Welcome, ${user.name}!`)
      navigate(ROLE_PATHS[user.role])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen mesh-bg noise py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-navy-400 to-navy-600 rounded-xl flex items-center justify-center shadow-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">PlaceNext</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-white/40 text-sm">Join the placement analysis portal</p>
        </div>

        <div className="glass-card p-8">
          {/* Role Selection */}
          <div className="mb-8">
            <label className="label-text text-center block mb-3">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedRole(value)}
                  className={`role-option ${selectedRole === value ? 'selected' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    selectedRole === value ? 'bg-navy-500/40' : 'bg-white/5'
                  }`}>
                    <Icon className={`w-5 h-5 ${selectedRole === value ? 'text-navy-300' : 'text-white/40'}`} />
                  </div>
                  <span className={`font-semibold text-sm ${selectedRole === value ? 'text-white' : 'text-white/60'}`}>{label}</span>
                  <span className={`text-xs ${selectedRole === value ? 'text-navy-300/70' : 'text-white/30'}`}>{desc}</span>
                  {selectedRole === value && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-navy-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Common Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-text">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    className={`input-field pl-10 ${errors.name ? 'error' : ''}`}
                    {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 chars' } })}
                  />
                </div>
                {errors.name && <p className="error-text">{errors.name.message}</p>}
              </div>

              <div>
                <label className="label-text">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    placeholder="you@email.com"
                    className={`input-field pl-10 ${errors.email ? 'error' : ''}`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                    })}
                  />
                </div>
                {errors.email && <p className="error-text">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="label-text">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  className={`input-field pl-10 ${errors.phone ? 'error' : ''}`}
                  {...register('phone', {
                    required: 'Phone is required',
                    pattern: { value: /^[+\d\s-]{10,15}$/, message: 'Invalid phone number' }
                  })}
                />
              </div>
              {errors.phone && <p className="error-text">{errors.phone.message}</p>}
            </div>

            {/* Student-specific fields */}
            {selectedRole === 'student' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white/3 border border-white/5">
                <div>
                  <label className="label-text">Roll Number</label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      placeholder="CS20001"
                      className={`input-field pl-10 ${errors.rollNumber ? 'error' : ''}`}
                      {...register('rollNumber', selectedRole === 'student' ? { required: 'Roll number required' } : {})}
                    />
                  </div>
                  {errors.rollNumber && <p className="error-text">{errors.rollNumber.message}</p>}
                </div>

                <div>
                  <label className="label-text">Branch / Department</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <select
                      className={`input-field pl-10 ${errors.branch ? 'error' : ''}`}
                      {...register('branch', selectedRole === 'student' ? { required: 'Branch required' } : {})}
                    >
                      <option value="" className="bg-gray-900">Select Branch</option>
                      {['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical'].map(b => (
                        <option key={b} value={b} className="bg-gray-900">{b}</option>
                      ))}
                    </select>
                  </div>
                  {errors.branch && <p className="error-text">{errors.branch.message}</p>}
                </div>

                <div>
                  <label className="label-text">Passing Year</label>
                  <select
                    className={`input-field ${errors.passingYear ? 'error' : ''}`}
                    {...register('passingYear', selectedRole === 'student' ? { required: 'Passing year required' } : {})}
                  >
                    <option value="" className="bg-gray-900">Select Year</option>
                    {[2024, 2025, 2026, 2027].map(y => (
                      <option key={y} value={y} className="bg-gray-900">{y}</option>
                    ))}
                  </select>
                  {errors.passingYear && <p className="error-text">{errors.passingYear.message}</p>}
                </div>

                <div>
                  <label className="label-text">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="8.50"
                    className={`input-field ${errors.cgpa ? 'error' : ''}`}
                    {...register('cgpa', selectedRole === 'student' ? {
                      required: 'CGPA required',
                      min: { value: 0, message: 'Min 0' },
                      max: { value: 10, message: 'Max 10' }
                    } : {})}
                  />
                  {errors.cgpa && <p className="error-text">{errors.cgpa.message}</p>}
                </div>
              </div>
            )}

            {/* Recruiter-specific fields */}
            {selectedRole === 'recruiter' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white/3 border border-white/5">
                <div>
                  <label className="label-text">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      placeholder="Acme Corp"
                      className={`input-field pl-10 ${errors.companyName ? 'error' : ''}`}
                      {...register('companyName', selectedRole === 'recruiter' ? { required: 'Company name required' } : {})}
                    />
                  </div>
                  {errors.companyName && <p className="error-text">{errors.companyName.message}</p>}
                </div>

                <div>
                  <label className="label-text">Designation</label>
                  <input
                    type="text"
                    placeholder="HR Manager"
                    className={`input-field ${errors.designation ? 'error' : ''}`}
                    {...register('designation', selectedRole === 'recruiter' ? { required: 'Designation required' } : {})}
                  />
                  {errors.designation && <p className="error-text">{errors.designation.message}</p>}
                </div>
              </div>
            )}

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-text">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    className={`input-field pl-10 pr-11 ${errors.password ? 'error' : ''}`}
                    {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="error-text">{errors.password.message}</p>}
              </div>

              <div>
                <label className="label-text">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    placeholder="Repeat password"
                    className={`input-field pl-10 ${errors.confirmPassword ? 'error' : ''}`}
                    {...register('confirmPassword', {
                      required: 'Please confirm password',
                      validate: val => val === password || 'Passwords do not match'
                    })}
                  />
                </div>
                {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary flex items-center justify-center gap-2 mt-2">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-white/40 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-navy-400 hover:text-navy-300 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
