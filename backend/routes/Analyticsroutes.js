import express from 'express'
import { getSummary, getByBranch, getOverTime, getTopCompanies, getMyStats } from '../controllers/analyticsController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

router.get('/summary', protect, authorize('admin', 'tpo'), getSummary)
router.get('/by-branch', protect, authorize('admin', 'tpo'), getByBranch)
router.get('/over-time', protect, authorize('admin', 'tpo'), getOverTime)
router.get('/top-companies', protect, authorize('admin', 'tpo'), getTopCompanies)
router.get('/my-stats', protect, authorize('student'), getMyStats)

export default router