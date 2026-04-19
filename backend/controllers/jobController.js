import { Job } from '../models/Job.js'
import { Application } from '../models/Application.js'
import { Notification } from '../models/Notification.js'
import { User } from '../models/User.js'

// Helper: notify all eligible students when a job is posted
const notifyEligibleStudents = async (job) => {
  try {
    const filter = { role: 'student', isActive: true }
    if (job.eligibility?.branches?.length > 0) {
      filter.branch = { $in: job.eligibility.branches }
    }
    if (job.eligibility?.passingYear?.length > 0) {
      filter.passingYear = { $in: job.eligibility.passingYear }
    }
    if (job.eligibility?.minCGPA > 0) {
      filter.cgpa = { $gte: job.eligibility.minCGPA }
    }
    const students = await User.find(filter).select('_id')
    const notifications = students.map(s => ({
      recipient: s._id,
      type: 'job_posted',
      title: `New Drive: ${job.company}`,
      message: `${job.company} is hiring for ${job.title}.`,
      link: `/jobs`,
      relatedJob: job._id,
    }))
    if (notifications.length) await Notification.insertMany(notifications)
  } catch (err) {
    console.error('Notification error:', err.message)
  }
}

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
export const getJobs = async (req, res, next) => {
  try {
    const { status, type, branch, page = 1, limit = 12, search } = req.query

    const filter = {}
    if (status) filter.status = status
    if (type)   filter.type = type
    if (branch) filter['eligibility.branches'] = branch
    if (search) {
      filter.$or = [
        { title:   { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ]
    }

    if (req.user.role === 'student' && !status) {
      filter.status = { $in: ['active', 'upcoming'] }
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name companyName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const total = await Job.countDocuments(filter)

    if (req.user.role === 'student') {
      const jobIds = jobs.map(j => j._id)
      const applications = await Application.find({
        student: req.user._id,
        job: { $in: jobIds },
      }).select('job status')

      const appMap = {}
      applications.forEach(a => { appMap[a.job.toString()] = a.status })

      const jobsWithStatus = jobs.map(j => ({
        ...j.toObject(),
        applicationStatus: appMap[j._id.toString()] || null,
      }))

      return res.json({
        jobs: jobsWithStatus,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      })
    }

    res.json({ jobs, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    next(err)
  }
}

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
export const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name companyName email')
    if (!job) return res.status(404).json({ message: 'Job not found' })

    let applicationStatus = null
    if (req.user.role === 'student') {
      const app = await Application.findOne({ job: job._id, student: req.user._id })
      applicationStatus = app?.status || null
    }

    const applicantCount = await Application.countDocuments({ job: job._id })
    res.json({ job, applicationStatus, applicantCount })
  } catch (err) {
    next(err)
  }
}

// @desc    Create job
// @route   POST /api/jobs
// @access  TPO + Recruiter + Admin
export const createJob = async (req, res, next) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id })
    await notifyEligibleStudents(job)
    res.status(201).json({ job, message: 'Job posted successfully' })
  } catch (err) {
    next(err)
  }
}

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  TPO + Recruiter (own) + Admin
export const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
    if (!job) return res.status(404).json({ message: 'Job not found' })

    if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' })
    }

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    })
    res.json({ job: updated, message: 'Job updated successfully' })
  } catch (err) {
    next(err)
  }
}

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Admin + TPO + Recruiter (own)
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
    if (!job) return res.status(404).json({ message: 'Job not found' })

    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'tpo' &&
      job.postedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await Job.findByIdAndDelete(req.params.id)
    await Application.deleteMany({ job: req.params.id })
    res.json({ message: 'Job and related applications deleted' })
  } catch (err) {
    next(err)
  }
}

// @desc    Get applicants for a job
// @route   GET /api/jobs/:id/applicants
// @access  TPO + Recruiter + Admin
export const getApplicants = async (req, res, next) => {
  try {
    const { status } = req.query
    const filter = { job: req.params.id }
    if (status) filter.status = status

    const applications = await Application.find(filter)
      // ✅ FIXED — added photo, prn, dob, address, resume, domain,
      //            hasBacklog, backlogs so the profile modal shows full info
      .populate(
        'student',
        'name email phone branch cgpa rollNumber passingYear ' +
        'photo prn dob address resume domain hasBacklog backlogs'
      )
      .sort({ createdAt: -1 })

    res.json({ applications, total: applications.length })
  } catch (err) {
    next(err)
  }
}
