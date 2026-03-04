import express from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// @desc  Get all users (Admin only)
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

// @desc  Get all students (Admin + TPO)
router.get('/students', protect, authorize('admin', 'tpo'), async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ cgpa: -1 })
    res.json({ students, total: students.length })
  } catch (err) { next(err) }
})

// @desc  Bulk import students from Excel (TPO only)
// @route POST /api/users/import-students
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
        // Normalize field names (handle different Excel column naming)
        const name        = row['Name'] || row['name']
        const email       = row['Email'] || row['email']
        const phone       = row['Phone'] || row['phone'] || row['Mobile'] || '0000000000'
        const rollNumber  = row['RollNumber'] || row['Roll Number'] || row['rollNumber'] || row['roll_number']
        const branch      = row['Branch'] || row['branch'] || row['Department']
        const passingYear = parseInt(row['PassingYear'] || row['Passing Year'] || row['passingYear']) || null
        const cgpa        = parseFloat(row['CGPA'] || row['cgpa'] || row['Cgpa']) || null

        if (!email) { failed++; continue }

        const existing = await User.findOne({ email })
        if (existing) {
          // Update existing student's academic info
          await User.findByIdAndUpdate(existing._id, {
            ...(cgpa !== null && { cgpa }),
            ...(branch && { branch }),
            ...(passingYear && { passingYear }),
            ...(rollNumber && { rollNumber }),
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

// @desc  Get single user
router.get('/:id', protect, authorize('admin', 'tpo'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) { next(err) }
})

// @desc  Update student profile (TPO/Admin)
// @route PATCH /api/users/:id/profile
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

// @desc  Toggle user active status (Admin only)
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