import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Briefcase, Users, Plus, ChevronRight, TrendingUp,
  CheckCircle2, Search, Trash2
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import toast from 'react-hot-toast'

const STATUS_STYLE = {
  active: 'bg-green-100 text-green-700',
  upcoming: 'bg-blue-100 text-blue-700',
  closed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
}

function Home({ jobs, stats, loading }) {
  const { user } = useAuth()

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {user?.companyName} · Recruiter
          </p>
        </div>

        <Link
          to="/jobs/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Post Drive
        </Link>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {[
          { label: 'My Drives', val: stats?.total ?? '—', icon: Briefcase },
          { label: 'Active', val: stats?.active ?? '—', icon: TrendingUp },
          { label: 'Applicants', val: stats?.applications ?? '—', icon: Users },
          { label: 'Hired', val: stats?.hired ?? '—', icon: CheckCircle2 },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xl font-bold text-gray-800">
                  {loading ? '—' : s.val}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {s.label}
                </p>
              </div>

              <div className="bg-blue-100 p-2 rounded-lg">
                <s.icon className="w-4 h-4 text-blue-600" />
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* My Drives */}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">
            My Drives
          </h2>

          <Link
            to="/recruiter-dashboard/drives"
            className="text-sm text-blue-600 flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (

          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>

        ) : jobs.length === 0 ? (

          <div className="text-center py-10">
            <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              No drives yet
            </p>

            <Link
              to="/jobs/new"
              className="text-sm text-blue-600 mt-2 inline-block"
            >
              Post your first →
            </Link>
          </div>

        ) : (

          jobs.slice(0, 4).map((job) => (

            <div
              key={job._id}
              className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-none"
            >

              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center font-semibold text-blue-600">
                {job.company?.charAt(0)}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {job.title}
                </p>

                <p className="text-xs text-gray-500">
                  {job.type} · {job.location}
                </p>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full ${STATUS_STYLE[job.status]}`}
              >
                {job.status}
              </span>

              <Link
                to={`/jobs/${job._id}/applicants`}
                className="text-sm text-blue-600 flex items-center gap-1"
              >
                <Users className="w-4 h-4" />
                View
              </Link>

            </div>
          ))

        )}
      </div>

    </div>
  )
}

function MyDrives({ jobs, loading, onDelete }) {

  const [search, setSearch] = useState('')

  const filtered = jobs.filter((j) =>
    !search ||
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.company?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            My Drives
          </h2>

          <p className="text-gray-500 text-sm">
            {jobs.length} posted
          </p>
        </div>

        <Link
          to="/jobs/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          New
        </Link>
      </div>

      {/* Search */}

      <div className="relative">

        <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />

        <input
          type="text"
          placeholder="Search drives..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Drives List */}

      <div className="space-y-3">

        {loading
          ? [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-gray-100 rounded-xl animate-pulse"
              />
            ))

          : filtered.map((job) => (

              <div
                key={job._id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm"
              >

                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center font-semibold text-blue-600">
                  {job.company?.charAt(0)}
                </div>

                <div className="flex-1">

                  <div className="flex items-center gap-2 flex-wrap">

                    <p className="font-semibold text-gray-800 text-sm">
                      {job.title}
                    </p>

                    <span
                      className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLE[job.status]}`}
                    >
                      {job.status}
                    </span>

                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {job.company} · {job.type} · {job.location}
                  </p>

                  {job.package && (
                    <p className="text-xs text-green-600 mt-1">
                      {job.package}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">

                  <Link
                    to={`/jobs/${job._id}/applicants`}
                    className="text-sm text-blue-600 flex items-center gap-1"
                  >
                    <Users className="w-4 h-4" />
                    Applicants
                  </Link>

                  <button
                    onClick={() => onDelete(job._id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              </div>
            ))}
      </div>
    </div>
  )
}

export default function RecruiterDashboard() {

  const { user } = useAuth()
  const location = useLocation()

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {

    api.get('/jobs')
      .then(async ({ data }) => {

        const mine = data.jobs.filter(
          (j) =>
            j.postedBy?._id === user?._id ||
            j.postedBy === user?._id
        )

        setJobs(mine)

        let apps = 0
        let hired = 0

        await Promise.all(
          mine.slice(0, 5).map(async (j) => {
            try {
              const r = await api.get(`/jobs/${j._id}/applicants`)
              apps += r.data.total
              hired += r.data.applications.filter(
                (a) => a.status === 'selected'
              ).length
            } catch {}
          })
        )

        setStats({
          total: mine.length,
          active: mine.filter((j) => j.status === 'active').length,
          applications: apps,
          hired,
        })
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))

  }, [])

  const handleDelete = async (id) => {

    if (!confirm('Delete this drive?')) return

    try {
      await api.delete(`/jobs/${id}`)
      setJobs((p) => p.filter((j) => j._id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  const content = () => {
    if (location.pathname === '/recruiter-dashboard/drives')
      return (
        <MyDrives
          jobs={jobs}
          loading={loading}
          onDelete={handleDelete}
        />
      )

    return (
      <Home
        jobs={jobs}
        stats={stats}
        loading={loading}
      />
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        {content()}
      </div>
    </DashboardLayout>
  )
}