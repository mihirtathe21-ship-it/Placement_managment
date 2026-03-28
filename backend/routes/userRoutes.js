import express from 'express'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { User } from '../models/User.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// ── __dirname shim (ES modules don't have it natively) ───────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

// ── Uploads folder — auto-create if it doesn't exist ─────────────────────────
const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

// ── Multer config ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => {
    const unique = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`
    cb(null, unique)
  },
})

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'photo')  return cb(null, file.mimetype.startsWith('image/'))
  if (file.fieldname === 'resume') return cb(null, file.mimetype === 'application/pdf')
  cb(null, false)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
})

// ── GET /api/users  —  all users (Admin only) ─────────────────────────────────
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query
    const filter = {}
    if (role) filter.role = role

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const total = await User.countDocuments(filter)
    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
})

// ── GET /api/users/students  —  all students (Admin + TPO) ───────────────────
router.get('/students', protect, authorize('admin', 'tpo'), async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ cgpa: -1 })
    res.json({ students, total: students.length })
  } catch (err) { next(err) }
})

// ── POST /api/users/import-students  —  bulk import from Excel (TPO/Admin) ───
router.post('/import-students', protect, authorize('tpo', 'admin'), async (req, res, next) => {
  try {
    const { students } = req.body
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'No student data provided' })
    }

    let created = 0, updated = 0, failed = 0
    const errors = []

    for (const row of students) {
      try {
        const name        = row['Name']        || row['name']
        const email       = row['Email']       || row['email']
        const phone       = row['Phone']       || row['phone'] || row['Mobile'] || '0000000000'
        const rollNumber  = row['RollNumber']  || row['Roll Number'] || row['rollNumber'] || row['roll_number']
        const branch      = row['Branch']      || row['branch']      || row['Department']
        const passingYear = parseInt(row['PassingYear'] || row['Passing Year'] || row['passingYear']) || null
        const cgpa        = parseFloat(row['CGPA'] || row['cgpa'] || row['Cgpa']) || null

        if (!email) { failed++; continue }

        const existing = await User.findOne({ email })
        if (existing) {
          await User.findByIdAndUpdate(existing._id, {
            ...(cgpa        !== null && { cgpa }),
            ...(branch               && { branch }),
            ...(passingYear          && { passingYear }),
            ...(rollNumber           && { rollNumber }),
          })
          updated++
        } else {
          if (!name) { failed++; continue }
          const defaultPassword = await bcrypt.hash('PlaceNext@123', 10)
          await User.create({
            name, email, phone, rollNumber, branch, passingYear, cgpa,
            role: 'student',
            password: defaultPassword,
            isActive: true,
          })
          created++
        }
      } catch (e) {
        failed++
        errors.push(e.message)
      }
    }

    res.json({
      message: `Import complete: ${created} created, ${updated} updated, ${failed} failed`,
      created, updated, failed, errors: errors.slice(0, 5),
    })
  } catch (err) { next(err) }
})

// ── PUT /api/users/profile  —  student updates own profile ───────────────────
// Uses a manual multer call so file errors return 400 instead of crashing to 500
router.put('/profile', protect, (req, res, next) => {
  upload.fields([
    { name: 'photo',  maxCount: 1 },
    { name: 'resume', maxCount: 1 },
  ])(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` })
    }
    if (err) {
      return res.status(400).json({ message: `Invalid file: ${err.message}` })
    }
    next()
  })
}, async (req, res, next) => {
  try {
    const { prn, dob, address } = req.body

    if (prn && !/^[0-9]{9}$/.test(prn)) {
      return res.status(400).json({ message: 'PRN must be exactly 9 digits' })
    }
    if (dob) {
      const age = new Date().getFullYear() - new Date(dob).getFullYear()
      if (age < 16) return res.status(400).json({ message: 'Minimum age is 16' })
    }

    const updates = {}
    if (prn)     updates.prn     = prn
    if (dob)     updates.dob     = dob
    if (address) updates.address = address

    if (req.files?.photo?.[0])  updates.photo  = `/uploads/${req.files.photo[0].filename}`
    if (req.files?.resume?.[0]) updates.resume = `/uploads/${req.files.resume[0].filename}`

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) return res.status(404).json({ message: 'User not found' })

    res.json({ message: 'Profile updated successfully', user })
  } catch (err) {
    console.error('updateProfile error:', err) // shows real cause in terminal
    next(err)
  }
})

// ── GET /api/users/:id  —  single user (Admin + TPO) ─────────────────────────
router.get('/:id', protect, authorize('admin', 'tpo'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) { next(err) }
})

// ── PATCH /api/users/:id/profile  —  TPO/Admin updates a student ──────────────
router.patch('/:id/profile', protect, authorize('tpo', 'admin'), async (req, res, next) => {
  try {
    const allowed = ['cgpa', 'branch', 'passingYear', 'rollNumber', 'phone']
    const update = {}
    allowed.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f] })

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user, message: 'Profile updated' })
  } catch (err) { next(err) }
})

// ── PATCH /api/users/:id/status  —  toggle active (Admin only) ───────────────
router.patch('/:id/status', protect, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    ).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user, message: `User ${req.body.isActive ? 'activated' : 'deactivated'} successfully` })
  } catch (err) { next(err) }
})

export default router