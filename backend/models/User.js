const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'tpo', 'student', 'recruiter'],
      required: [true, 'Role is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Student-specific fields
    rollNumber: { type: String, sparse: true },
    branch: { type: String },
    passingYear: { type: Number },
    cgpa: { type: Number, min: 0, max: 10 },

    // Recruiter-specific fields
    companyName: { type: String },
    designation: { type: String },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
userSchema.index({ role: 1 })
userSchema.index({ email: 1 })

module.exports = mongoose.model('User', userSchema)
