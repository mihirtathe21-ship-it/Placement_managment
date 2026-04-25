import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  applyToJob, getMyApplications, updateApplicationStatus,
  withdrawApplication, getAllApplications,
} from '../controllers/applicationController.js'
import { Application } from '../models/Application.js'
import { User } from '../models/User.js'
import { Job } from '../models/Job.js'
import { Notification } from '../models/Notification.js'
import { protect, authorize } from '../middleware/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

// ── Multer — save uploaded resumes to /uploads ────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'))
  },
  filename: (req, file, cb) => {
    const unique = `${req.user._id}-resume-${Date.now()}${path.extname(file.originalname)}`
    cb(null, unique)
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) cb(null, true)
  else cb(new Error('Only PDF, DOC, DOCX files are allowed'), false)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

const router = express.Router()

// ── Apply to job — accepts multipart/form-data (resume optional) ──────────────
router.post('/', protect, authorize('student'), upload.single('resume'), applyToJob)

router.get('/my',              protect, authorize('student'),                    getMyApplications)
router.get('/',                protect, authorize('admin', 'tpo'),               getAllApplications)
router.patch('/:id/status',    protect, authorize('admin', 'tpo', 'recruiter'),  updateApplicationStatus)
router.patch('/:id/withdraw',  protect, authorize('student'),                    withdrawApplication)

// @desc  TPO bulk-shortlist students from Excel by email for a drive
// @route POST /api/applications/bulk-shortlist
// @access TPO + Admin
router.post('/bulk-shortlist', protect, authorize('tpo', 'admin'), async (req, res, next) => {
  try {
    const { jobId, emails } = req.body
    if (!jobId || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: 'jobId and emails array are required' })
    }

    const job = await Job.findById(jobId)
    if (!job) return res.status(404).json({ message: 'Drive not found' })

    let shortlisted = 0, alreadyApplied = 0, notFound = 0

    for (const email of emails) {
      if (!email) continue
      const student = await User.findOne({ email: email.toLowerCase().trim(), role: 'student' })
      if (!student) { notFound++; continue }

      const existing = await Application.findOne({ job: jobId, student: student._id })
      if (existing) {
        if (existing.status === 'applied') {
          existing.status = 'shortlisted'
          existing.statusHistory.push({ status: 'shortlisted', changedBy: req.user._id, note: 'Bulk shortlisted via Excel' })
          await existing.save()
          shortlisted++
        } else {
          alreadyApplied++
        }
      } else {
        await Application.create({
          job: jobId,
          student: student._id,
          status: 'shortlisted',
          statusHistory: [
            { status: 'applied',     changedBy: req.user._id },
            { status: 'shortlisted', changedBy: req.user._id, note: 'Bulk shortlisted via Excel' },
          ],
        })
        shortlisted++
      }

      await Notification.create({
        recipient:  student._id,
        type:       'shortlisted',
        title:      `Shortlisted for ${job.company}`,
        message:    `You have been shortlisted for ${job.title} at ${job.company}. Check your applications for details.`,
        link:       '/applications',
        relatedJob: jobId,
      })
    }

    res.json({ message: 'Shortlisting complete', shortlisted, alreadyApplied, notFound })
  } catch (err) {
    next(err)
  }
})

export default router