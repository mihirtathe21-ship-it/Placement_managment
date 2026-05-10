import express from 'express'
import { register, login, getMe, verifyEmail, resendOTP } from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/register',     register)
router.post('/verify-email', verifyEmail)   // ← NEW: OTP verification
router.post('/resend-otp',   resendOTP)     // ← NEW: resend OTP
router.post('/login',        login)
router.get('/me',            protect, getMe)

export default router