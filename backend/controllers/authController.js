import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { generateOTP, sendVerificationEmail } from '../utils/emailService.js'  // ← NEW

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

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
  prn:         user.prn,
  dob:         user.dob,
  address:     user.address,
  photo:       user.photo,
  resume:      user.resume,
  isVerified:  user.isVerified,   // ← NEW: frontend can check this
})

// @desc    Register user — creates account & sends OTP (does NOT return token yet)
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
      // If registered but never verified → resend OTP instead of blocking
      if (!existingUser.isVerified) {
        const otp    = generateOTP()
        const hashed = await bcrypt.hash(otp, 10)
        existingUser.verificationOTP    = hashed
        existingUser.verificationExpiry = new Date(Date.now() + 10 * 60 * 1000)
        await existingUser.save()
        await sendVerificationEmail(email, existingUser.name, otp)
        return res.status(200).json({
          message:         'Account already exists but not verified. A new OTP has been sent to your email.',
          requiresVerification: true,
          email,
        })
      }
      return res.status(400).json({ message: 'Email already registered. Please sign in.' })
    }

    // Build user data
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

    // Generate OTP and store hashed version
    const otp    = generateOTP()
    const hashed = await bcrypt.hash(otp, 10)
    userData.isVerified         = false
    userData.verificationOTP    = hashed
    userData.verificationExpiry = new Date(Date.now() + 10 * 60 * 1000)  // 10 min

    const user = await User.create(userData)

    // Send OTP email
    await sendVerificationEmail(email, name, otp)

    // Return without token — user must verify first
    return res.status(201).json({
      message:              'Registration successful! Please check your email for the OTP to verify your account.',
      requiresVerification: true,
      email,
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' })
    }

    // Fetch user with OTP fields (not selected by default since we keep them lean)
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email.' })
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified. Please sign in.' })
    }

    if (!user.verificationOTP || !user.verificationExpiry) {
      return res.status(400).json({ message: 'No OTP found. Please register again or request a new OTP.' })
    }

    // Check expiry
    if (new Date() > user.verificationExpiry) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' })
    }

    // Compare OTP
    const isMatch = await bcrypt.compare(otp, user.verificationOTP)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' })
    }

    // Mark verified, clear OTP fields
    user.isVerified         = true
    user.verificationOTP    = null
    user.verificationExpiry = null
    await user.save()

    // Issue token — user is now fully registered
    const token = generateToken(user._id)
    return res.json({
      message: 'Email verified successfully! Welcome to RCPIT Placement Portal 🎉',
      token,
      user: sanitizeUser(user),
    })
  } catch (err) {
    next(err)
  }
}

// @desc    Resend OTP to email
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email) return res.status(400).json({ message: 'Email is required.' })

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'No account found with this email.' })
    if (user.isVerified) return res.status(400).json({ message: 'Email is already verified.' })

    const otp    = generateOTP()
    const hashed = await bcrypt.hash(otp, 10)
    user.verificationOTP    = hashed
    user.verificationExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    await sendVerificationEmail(email, user.name, otp)

    return res.json({ message: 'A new OTP has been sent to your email.' })
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

    // ← NEW: Block login if email not verified
    if (!user.isVerified) {
      return res.status(403).json({
        message:              'Please verify your email before signing in. Check your inbox for the OTP.',
        requiresVerification: true,
        email,
      })
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
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
}