// const express = require('express')
// const router = express.Router()
// const { register, login, getMe } = require('../controllers/authController')
// const { protect } = require('../middleware/auth')

// router.post('/register', register)
// router.post('/login', login)
// router.get('/me', protect, getMe)

// module.exports = router// backend/routes/authRoutes.js
import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

export default router;
