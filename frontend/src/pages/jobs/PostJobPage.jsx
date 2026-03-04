import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  Briefcase, Building2, MapPin, Calendar, Users,
  Plus, X, ChevronLeft, Zap, GraduationCap, DollarSign
} from 'lucide-react'
import api from '../../api'

const BRANCHES = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical']
const ROUNDS = ['Aptitude Test', 'Technical Round', 'HR Interview', 'Group Discussion', 'Coding Test', 'Case Study']

export default function PostJobPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBranches, setSelectedBranches] = useState([])
  const [selectedRounds, setSelectedRounds] = useState([])
  const [selectedYears, setSelectedYears] = useState([])
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { type: 'full-time', status: 'active', openings: 1 }
  })
  const jobType = watch('type')

  const toggleBranch = (b) => setSelectedBranches(prev =>
    prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
  )
  const toggleRound = (r) => setSelectedRounds(prev =>
    prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
  )
  const toggleYear = (y) => setSelectedYears(prev =>
    prev.includes(y) ? prev.filter(x => x !== y) : [...prev, y]
  )
  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills(prev => [...prev, skillInput.trim()])
      setSkillInput('')
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const payload = {
        ...data,
        eligibility: {
          branches: selectedBranches,
          minCGPA: Number(data.minCGPA) || 0,
          passingYear: selectedYears,
          backlogs: Number(data.backlogs) || 0,
        },
        rounds: selectedRounds,
        skills,
      }
      delete payload.minCGPA
      delete payload.backlogs
      await api.post('/jobs', payload)
      toast.success('Drive posted successfully!')
      navigate('/jobs')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white pb-16">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0d1425]/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Post a Drive</h1>
            <p className="text-white/40 text-xs">Fill in the placement drive details</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Basic Info */}
        <section className="bg-white/3 border border-white/5 rounded-2xl p-6 space-y-5">
          <h2 className="font-semibold text-white/70 text-sm uppercase tracking-widest">Basic Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Job Title *</label>
              <input
                type="text"
                placeholder="Software Engineer"
                className={`w-full bg-white/5 border ${errors.title ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-navy-500/50`}
                {...register('title', { required: true })}
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Company Name *</label>
              <input
                type="text"
                placeholder="Acme Corp"
                className={`w-full bg-white/5 border ${errors.company ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-navy-500/50`}
                {...register('company', { required: true })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Job Description *</label>
            <textarea
              rows={4}
              placeholder="Describe the role, responsibilities, and requirements..."
              className={`w-full bg-white/5 border ${errors.description ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-navy-500/50 resize-none`}
              {...register('description', { required: true })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Job Type</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                {...register('type')}
              >
                <option value="full-time" className="bg-gray-900">Full-time</option>
                <option value="internship" className="bg-gray-900">Internship</option>
                <option value="contract" className="bg-gray-900">Contract</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Location</label>
              <input
                type="text"
                placeholder="On-Campus / City"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
                {...register('location')}
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Openings</label>
              <input
                type="number"
                min="1"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                {...register('openings')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">
                {jobType === 'internship' ? 'Stipend' : 'CTC / Package'}
              </label>
              <input
                type="text"
                placeholder={jobType === 'internship' ? '₹50,000/month' : '12 LPA'}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
                {...register(jobType === 'internship' ? 'stipend' : 'package')}
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Status</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                {...register('status')}
              >
                <option value="active" className="bg-gray-900">Active</option>
                <option value="upcoming" className="bg-gray-900">Upcoming</option>
                <option value="closed" className="bg-gray-900">Closed</option>
              </select>
            </div>
          </div>
        </section>

        {/* Dates */}
        <section className="bg-white/3 border border-white/5 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-white/70 text-sm uppercase tracking-widest">Dates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Drive Date</label>
              <input
                type="date"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                {...register('driveDate')}
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Last Date to Apply</label>
              <input
                type="date"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                {...register('lastDateToApply')}
              />
            </div>
          </div>
        </section>

        {/* Eligibility */}
        <section className="bg-white/3 border border-white/5 rounded-2xl p-6 space-y-5">
          <h2 className="font-semibold text-white/70 text-sm uppercase tracking-widest">Eligibility Criteria</h2>

          <div>
            <label className="text-xs text-white/50 mb-2 block">Eligible Branches (leave empty = all)</label>
            <div className="flex flex-wrap gap-2">
              {BRANCHES.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBranch(b)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    selectedBranches.includes(b)
                      ? 'bg-navy-500/30 border-navy-500/50 text-navy-300'
                      : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-white/50 mb-2 block">Eligible Passing Years</label>
            <div className="flex gap-2">
              {[2024, 2025, 2026, 2027].map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => toggleYear(y)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    selectedYears.includes(y)
                      ? 'bg-navy-500/30 border-navy-500/50 text-navy-300'
                      : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Minimum CGPA</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="6.0"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
                {...register('minCGPA')}
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Max Backlogs Allowed</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
                {...register('backlogs')}
              />
            </div>
          </div>
        </section>

        {/* Interview Rounds */}
        <section className="bg-white/3 border border-white/5 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-white/70 text-sm uppercase tracking-widest">Interview Rounds</h2>
          <div className="flex flex-wrap gap-2">
            {ROUNDS.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => toggleRound(r)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  selectedRounds.includes(r)
                    ? 'bg-navy-500/30 border-navy-500/50 text-navy-300'
                    : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {selectedRounds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {selectedRounds.map((r, i) => (
                <span key={r} className="text-xs bg-navy-500/20 text-navy-300 px-2 py-1 rounded-md">
                  {i + 1}. {r}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Skills */}
        <section className="bg-white/3 border border-white/5 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-white/70 text-sm uppercase tracking-widest">Required Skills</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. React, Python, SQL"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
            />
            <button type="button" onClick={addSkill}
              className="bg-navy-500/30 hover:bg-navy-500/50 text-navy-300 px-4 py-2.5 rounded-xl text-sm transition-all">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <span key={s} className="flex items-center gap-1.5 text-xs bg-white/5 text-white/60 px-3 py-1.5 rounded-lg">
                  {s}
                  <button type="button" onClick={() => setSkills(prev => prev.filter(x => x !== s))}>
                    <X className="w-3 h-3 text-white/30 hover:text-white/60" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-navy-500 hover:bg-navy-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Briefcase className="w-4 h-4" />
              Post Drive
            </>
          )}
        </button>
      </form>
    </div>
  )
}