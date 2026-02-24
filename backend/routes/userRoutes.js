const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { protect, authorize } = require('../middleware/auth')

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
  } catch (err) {
    next(err)
  }
})

// @desc  Get students (Admin + TPO)
router.get('/students', protect, authorize('admin', 'tpo'), async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ cgpa: -1 })
    res.json({ students, total: students.length })
  } catch (err) {
    next(err)
  }
})

// @desc  Get single user
router.get('/:id', protect, authorize('admin', 'tpo'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) {
    next(err)
  }
})

// @desc  Update user status (Admin only)
router.patch('/:id/status', protect, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user, message: `User ${req.body.isActive ? 'activated' : 'deactivated'} successfully` })
  } catch (err) {
    next(err)
  }
})

module.exports = router
