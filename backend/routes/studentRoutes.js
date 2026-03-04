import express from 'express'
import {
  importStudents,
  getStudents,
  shortlistStudents,
} from '../controllers/studentController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// POST /api/students/import    → Upload Excel data once, saves to DB
router.post('/import',    protect, authorize('tpo', 'admin'), importStudents)

// GET  /api/students           → Filter/search students from DB
router.get('/',           protect, authorize('tpo', 'admin'), getStudents)

// POST /api/students/shortlist → Shortlist selected students for a drive
router.post('/shortlist', protect, authorize('tpo', 'admin'), shortlistStudents)

export default router