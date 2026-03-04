import mongoose from 'mongoose'

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'interview', 'selected', 'rejected', 'withdrawn'],
    default: 'applied',
  },
  resumeUrl: { type: String },
  coverLetter: { type: String },
  currentRound: { type: String },
  notes: { type: String }, // Internal TPO/recruiter notes
  offerLetterUrl: { type: String },
  offeredPackage: { type: String },
  statusHistory: [{
    status: { type: String },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: { type: String },
  }],
}, {
  timestamps: true,
})

// One student can apply to a job only once
applicationSchema.index({ job: 1, student: 1 }, { unique: true })
applicationSchema.index({ student: 1, status: 1 })
applicationSchema.index({ job: 1, status: 1 })

export const Application = mongoose.model('Application', applicationSchema)