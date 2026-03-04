import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const DOMAINS = [
  'Full Stack Development',
  'Frontend Development',
  'Backend Development',
  'Data Analytics',
  'Data Science',
  'Machine Learning',
  'Artificial Intelligence',
  'Cloud Computing',
  'DevOps',
  'Cybersecurity',
  'Mobile Development',
  'UI/UX Design',
  '.NET Development',
  'Java Development',
  'Python Development',
  'Embedded Systems',
  'Networking',
  'Database Administration',
  'Other',
]

const userSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:     { type: String, required: true, minlength: 6 },
    phone:        { type: String, default: '' },
    role:         { type: String, enum: ['student', 'tpo', 'recruiter', 'admin'], default: 'student' },

    // Student-specific fields
    rollNumber:   { type: String, default: '' },
    branch:       { type: String, default: '' },
    passingYear:  { type: Number },
    cgpa:         { type: Number, min: 0, max: 10 },
    backlogs:     { type: Number, default: 0 },

    // ← NEW: student's specialization domain
    domain:       { type: String, enum: [...DOMAINS, ''], default: '' },

    // Recruiter/TPO fields
    companyName:  { type: String, default: '' },
    designation:  { type: String, default: '' },

    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
)

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

export const User = mongoose.model('User', userSchema)
export { DOMAINS }