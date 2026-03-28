import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

// ✅ Added prn, dob, address, photo, resume
const sanitizeUser = (user) => ({
  _id:         user._id,
  name:        user.name,
  email:       user.email,
  role:        user.role,
  phone:       user.phone,
  rollNumber:  user.rollNumber,
  branch:      user.branch,
  passingYear: user.passingYear,
  cgpa:        user.cgpa,
  hasBacklog:  user.hasBacklog,
  backlogs:    user.backlogs,
  domain:      user.domain,
  companyName: user.companyName,
  designation: user.designation,
  createdAt:   user.createdAt,
  // ✅ Profile fields — these were missing, causing data to vanish on refresh
  prn:         user.prn,
  dob:         user.dob,
  address:     user.address,
  photo:       user.photo,
  resume:      user.resume,
})

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const {
      name, email, password, role, phone,
      rollNumber, branch, passingYear, cgpa, domain,
      hasBacklog, backlogs,
      companyName, designation,
    } = req.body

    if (!['student', 'recruiter'].includes(role)) {
      return res.status(403).json({ message: 'Admin and TPO accounts must be created by system administrators.' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered. Please sign in.' })
    }

    const userData = { name, email, password, role, phone }

    if (role === 'student') {
      if (!rollNumber) return res.status(400).json({ message: 'Roll number is required for students.' })
      Object.assign(userData, {
        rollNumber,
        branch,
        passingYear,
        cgpa,
        domain,
        hasBacklog: hasBacklog ?? false,
        backlogs:   hasBacklog ? (backlogs ?? 0) : 0,
      })
    }

    if (role === 'recruiter') {
      if (!companyName) return res.status(400).json({ message: 'Company name is required for recruiters.' })
      Object.assign(userData, { companyName, designation })
    }

    const user = await User.create(userData)
    const token = generateToken(user._id)
    res.status(201).json({ token, user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated.' })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const token = generateToken(user._id)
    res.json({ token, user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
}

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    // Re-fetch from DB to get the absolute latest data including profile fields
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
}