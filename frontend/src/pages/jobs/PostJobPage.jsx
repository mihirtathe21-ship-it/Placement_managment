import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  Briefcase, Plus, X, ChevronLeft
} from 'lucide-react'
import api from '../../api'

const BRANCHES = [
  'Computer Engineering',
  'Computer Science',
  'AIML',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical'
]

const ROUNDS = [
  'Aptitude Test',
  'Technical Round',
  'HR Interview',
  'Group Discussion',
  'Coding Test',
  'Case Study'
]

export default function PostJobPage() {

  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(false)
  const [selectedBranches, setSelectedBranches] = useState([])
  const [selectedRounds, setSelectedRounds] = useState([])
  const [selectedYears, setSelectedYears] = useState([])
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      type: 'full-time',
      status: 'active',
      openings: 1
    }
  })

  const jobType = watch('type')

  const toggleBranch = (b) =>
    setSelectedBranches(prev =>
      prev.includes(b)
        ? prev.filter(x => x !== b)
        : [...prev, b]
    )

  const toggleRound = (r) =>
    setSelectedRounds(prev =>
      prev.includes(r)
        ? prev.filter(x => x !== r)
        : [...prev, r]
    )

  const toggleYear = (y) =>
    setSelectedYears(prev =>
      prev.includes(y)
        ? prev.filter(x => x !== y)
        : [...prev, y]
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
          backlogs: Number(data.backlogs) || 0
        },
        rounds: selectedRounds,
        skills
      }

      delete payload.minCGPA
      delete payload.backlogs

      await api.post('/jobs', payload)

      toast.success('Drive posted successfully!')

      navigate('/jobs')

    } catch (err) {

      toast.error(
        err.response?.data?.message || 'Failed to post job'
      )

    } finally {
      setIsLoading(false)
    }
  }

  return (

    <div className="min-h-screen bg-gray-100 pb-16">

      {/* HEADER */}

      <div className="border-b bg-white sticky top-0 z-20">

        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">

          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-900"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Post Placement Drive
            </h1>
            <p className="text-sm text-gray-500">
              Add new campus recruitment drive
            </p>
          </div>

        </div>
      </div>


      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-4xl mx-auto px-6 py-8 space-y-8"
      >

        {/* BASIC INFO */}

        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">

          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="text-sm text-gray-600">
                Job Title *
              </label>

              <input
                type="text"
                placeholder="Software Engineer"
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                {...register('title', { required: true })}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Company Name *
              </label>

              <input
                type="text"
                placeholder="Google / TCS / Infosys"
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                {...register('company', { required: true })}
              />
            </div>

          </div>

          <div>
            <label className="text-sm text-gray-600">
              Job Description *
            </label>

            <textarea
              rows={4}
              placeholder="Describe the role, responsibilities, and requirements..."
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              {...register('description', { required: true })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div>
              <label className="text-sm text-gray-600">
                Job Type
              </label>

              <select
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 text-sm"
                {...register('type')}
              >
                <option value="full-time">Full Time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Location
              </label>

              <input
                type="text"
                placeholder="Pune / Bangalore / Remote"
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 text-sm"
                {...register('location')}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Openings
              </label>

              <input
                type="number"
                min="1"
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 text-sm"
                {...register('openings')}
              />
            </div>

          </div>

        </section>


        {/* DATES */}

        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">

          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Important Dates
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="text-sm text-gray-600">
                Drive Date
              </label>

              <input
                type="date"
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 text-sm"
                {...register('driveDate')}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Last Date To Apply
              </label>

              <input
                type="date"
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 text-sm"
                {...register('lastDateToApply')}
              />
            </div>

          </div>

        </section>


        {/* ELIGIBILITY */}

        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">

          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Eligibility
          </h2>

          <div>

            <label className="text-sm text-gray-600">
              Eligible Branches
            </label>

            <div className="flex flex-wrap gap-2 mt-2">

              {BRANCHES.map(b => (

                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBranch(b)}
                  className={`text-xs px-3 py-1.5 rounded border ${
                    selectedBranches.includes(b)
                      ? 'bg-blue-100 border-blue-400 text-blue-700'
                      : 'bg-gray-50 border-gray-300 text-gray-600'
                  }`}
                >
                  {b}
                </button>

              ))}

            </div>

          </div>

        </section>


        {/* INTERVIEW ROUNDS */}

        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">

          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Interview Rounds
          </h2>

          <div className="flex flex-wrap gap-2">

            {ROUNDS.map(r => (

              <button
                key={r}
                type="button"
                onClick={() => toggleRound(r)}
                className={`text-xs px-3 py-1.5 rounded border ${
                  selectedRounds.includes(r)
                    ? 'bg-blue-100 border-blue-400 text-blue-700'
                    : 'bg-gray-50 border-gray-300 text-gray-600'
                }`}
              >
                {r}
              </button>

            ))}

          </div>

        </section>


        {/* SKILLS */}

        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">

          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Required Skills
          </h2>

          <div className="flex gap-2">

            <input
              type="text"
              placeholder="React, NodeJS, Python..."
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e =>
                e.key === 'Enter' &&
                (e.preventDefault(), addSkill())
              }
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm"
            />

            <button
              type="button"
              onClick={addSkill}
              className="bg-blue-900 text-white px-4 py-2 rounded-lg"
            >
              <Plus size={16} />
            </button>

          </div>

          {skills.length > 0 && (

            <div className="flex flex-wrap gap-2">

              {skills.map(s => (

                <span
                  key={s}
                  className="flex items-center gap-1 text-xs bg-gray-100 px-3 py-1 rounded"
                >
                  {s}

                  <button
                    type="button"
                    onClick={() =>
                      setSkills(prev =>
                        prev.filter(x => x !== s)
                      )
                    }
                  >
                    <X size={12} />
                  </button>

                </span>

              ))}

            </div>

          )}

        </section>


        {/* SUBMIT BUTTON */}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
        >

          {isLoading
            ? 'Posting...'
            : (
              <>
                <Briefcase size={18}/>
                Post Drive
              </>
            )
          }

        </button>

      </form>

    </div>
  )
}