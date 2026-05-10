 import express from 'express'
import {
  importStudents,
  getStudents,
  shortlistStudents,
} from '../controllers/studentController.js'

import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

router.post(
  '/import',
  protect,
  authorize('tpo', 'admin'),
  importStudents
)

router.get(
  '/',
  protect,
  authorize('tpo', 'admin'),
  getStudents
)

router.post(
  '/shortlist',
  protect,
  authorize('tpo', 'admin'),
  shortlistStudents
)

export default router