import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['job_posted', 'application_update', 'shortlisted', 'selected', 'rejected', 'drive_reminder', 'general'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String }, // e.g. /jobs/123
  isRead: { type: Boolean, default: false },
  relatedJob: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  relatedApplication: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
}, {
  timestamps: true,
})

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 })

export const Notification = mongoose.model('Notification', notificationSchema)