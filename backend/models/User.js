import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:     { type: String, required: true, select: false },
    phone:        { type: String, default: '' },
    role:         { type: String, enum: ['student', 'tpo', 'recruiter', 'admin'], default: 'student' },

    // Student fields
    rollNumber:   { type: String, default: '' },
    branch:       { type: String, default: '' },
    passingYear:  { type: Number },
    cgpa:         { type: Number, min: 0, max: 10 },
    backlogs:     { type: Number, default: 0 },
    domain:       { type: String, default: '' },

    // Recruiter / TPO fields
    companyName:  { type: String, default: '' },
    designation:  { type: String, default: '' },

    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
)

// ✅ Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// ✅ Compare entered password against stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

export const User = mongoose.model('User', userSchema)