import { Application } from '../models/Application.js'
import { Job } from '../models/Job.js'
import { User } from '../models/User.js'

// @desc    Get placement analytics summary
// @route   GET /api/analytics/summary
// @access  Admin + TPO
export const getSummary = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalRecruiters,
      totalJobs,
      activeJobs,
      totalApplications,
      selectedApplications,
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'recruiter', isActive: true }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'selected' }),
    ])

    const placementRate = totalStudents > 0
      ? ((selectedApplications / totalStudents) * 100).toFixed(1)
      : 0

    res.json({
      totalStudents,
      totalRecruiters,
      totalJobs,
      activeJobs,
      totalApplications,
      selectedApplications,
      placementRate,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Placements by branch
// @route   GET /api/analytics/by-branch
// @access  Admin + TPO
export const getByBranch = async (req, res, next) => {
  try {
    const data = await Application.aggregate([
      { $match: { status: 'selected' } },
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentData',
        },
      },
      { $unwind: '$studentData' },
      {
        $group: {
          _id: '$studentData.branch',
          placed: { $sum: 1 },
          avgPackage: { $avg: { $toDouble: { $replaceAll: { input: { $ifNull: ['$offeredPackage', '0'] }, find: '[^0-9.]', replacement: '' } } } },
        },
      },
      { $sort: { placed: -1 } },
    ])

    // Add total students per branch
    const students = await User.aggregate([
      { $match: { role: 'student', isActive: true } },
      { $group: { _id: '$branch', total: { $sum: 1 } } },
    ])
    const studentMap = {}
    students.forEach(s => { studentMap[s._id] = s.total })

    const result = data.map(d => ({
      branch: d._id || 'Unknown',
      placed: d.placed,
      total: studentMap[d._id] || 0,
      rate: studentMap[d._id] ? ((d.placed / studentMap[d._id]) * 100).toFixed(1) : 0,
    }))

    res.json({ data: result })
  } catch (err) {
    next(err)
  }
}

// @desc    Applications over time (monthly)
// @route   GET /api/analytics/over-time
// @access  Admin + TPO
export const getOverTime = async (req, res, next) => {
  try {
    const data = await Application.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: 1 },
          selected: { $sum: { $cond: [{ $eq: ['$status', 'selected'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ])

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const result = data.map(d => ({
      month: `${months[d._id.month - 1]} ${d._id.year}`,
      applications: d.total,
      selected: d.selected,
    }))

    res.json({ data: result })
  } catch (err) {
    next(err)
  }
}

// @desc    Top recruiting companies
// @route   GET /api/analytics/top-companies
// @access  Admin + TPO
export const getTopCompanies = async (req, res, next) => {
  try {
    const data = await Application.aggregate([
      { $match: { status: 'selected' } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobData',
        },
      },
      { $unwind: '$jobData' },
      {
        $group: {
          _id: '$jobData.company',
          hired: { $sum: 1 },
          jobs: { $addToSet: '$jobData._id' },
        },
      },
      { $sort: { hired: -1 } },
      { $limit: 10 },
      {
        $project: {
          company: '$_id',
          hired: 1,
          jobCount: { $size: '$jobs' },
        },
      },
    ])

    res.json({ data })
  } catch (err) {
    next(err)
  }
}

// @desc    Student's personal analytics
// @route   GET /api/analytics/my-stats
// @access  Student
export const getMyStats = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate('job', 'title company package')

    const statusCounts = {}
    applications.forEach(a => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1
    })

    res.json({
      total: applications.length,
      statusCounts,
      applications: applications.slice(0, 5), // recent 5
    })
  } catch (err) {
    next(err)
  }
}