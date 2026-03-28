import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import applicationRoutes from './routes/Applicationroutes.js'
import analyticsRoutes from './routes/Analyticsroutes.js'
import notificationRoutes from './routes/Notificationroutes.js'
import errorHandler from './middleware/errorHandler.js'
import studentRoutes from './routes/studentRoutes.js'

dotenv.config()

// ── __dirname shim for ES modules ─────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const app = express()
const httpServer = createServer(app)

// ── Socket.io — real-time notifications ───────────────────────────────────────
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

// Track connected users: userId -> socketId
const onlineUsers = new Map()

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`)

  socket.on('register', (userId) => {
    onlineUsers.set(userId, socket.id)
    console.log(`👤 User ${userId} registered on socket`)
  })

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId)
        break
      }
    }
  })
})

// Helper to send real-time notification to a specific user
export const sendRealtimeNotification = (userId, notification) => {
  const socketId = onlineUsers.get(userId.toString())
  if (socketId) {
    io.to(socketId).emit('notification', notification)
  }
}

// ── Core middleware ───────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// ── Static files — serve uploaded photos & resumes ✅ NEW ────────────────────
// Files saved by multer land in <project-root>/uploads/
// Frontend can access them at:  http://localhost:5000/uploads/<filename>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB()

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes)
app.use('/api/users',         userRoutes)
app.use('/api/jobs',          jobRoutes)
app.use('/api/applications',  applicationRoutes)
app.use('/api/analytics',     analyticsRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/students',      studentRoutes)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: '🚀 PlaceNext API is running' }))

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler)

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => console.log(`🚀 PlaceNext API running on port ${PORT}`))