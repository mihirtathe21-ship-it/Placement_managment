import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { Application } from '../models/Application.js'
import { Job } from '../models/Job.js'
import { Notification } from '../models/Notification.js'

// ─── Import Excel data → save students to DB ─────────────────────────────────
export const importStudents = async (req, res, next) => {
  try {
    const { students } = req.body

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'No student data provided' })
    }

    let created = 0, updated = 0, failed = 0
    const errors = []

    for (const row of students) {
      try {
        // Skip completely empty rows
        const allValues = Object.values(row).map(v => String(v ?? '').trim())
        if (allValues.every(v => v === '' || v === 'undefined' || v === 'null')) continue

        const name        = String(row['Name']        || row['name']         || row['Student Name'] || '').trim()
        const email       = String(row['Email']       || row['email']        || row['Email ID']     || '').trim().toLowerCase()
        const phone       = String(row['Phone']       || row['phone']        || row['Mobile']       || '0000000000').trim()
        const rollNumber  = String(row['RollNumber']  || row['Roll Number']  || row['Roll No']      || '').trim()
        const branch      = String(row['Branch']      || row['branch']       || row['Department']   || '').trim()
        const passingYear = parseInt(row['PassingYear'] || row['Passing Year'] || row['Year'] || 0) || null
        const cgpa        = parseFloat(row['CGPA']    || row['cgpa']         || row['GPA']          || 0) || null
        const backlogs    = parseInt(row['Backlogs']  || row['backlogs']     || row['Arrears']      || 0) || 0
        const domain      = String(row['Domain']      || row['domain']       || row['Specialization'] || row['specialization'] || '').trim()

        // Skip rows without valid email
        if (!email || !email.includes('@')) continue

        const existing = await User.findOne({ email })

        if (existing) {
          const updateData = {}
          if (name)          updateData.name        = name
          if (phone)         updateData.phone       = phone
          if (rollNumber)    updateData.rollNumber  = rollNumber
          if (branch)        updateData.branch      = branch
          if (passingYear)   updateData.passingYear = passingYear
          if (cgpa !== null) updateData.cgpa        = cgpa
          if (domain)        updateData.domain      = domain
          updateData.backlogs = backlogs
          await User.findByIdAndUpdate(existing._id, updateData)
          updated++
        } else {
          if (!name) { failed++; errors.push(`Missing name for ${email}`); continue }
          const hashedPassword = await bcrypt.hash('PlaceNext@123', 10)
          await User.create({
            name, email, phone, rollNumber, branch,
            passingYear, cgpa, backlogs, domain,
            role: 'student', password: hashedPassword, isActive: true,
          })
          created++
        }
      } catch (err) {
        failed++
        errors.push(err.message)
      }
    }

    return res.json({ message: 'Import complete', created, updated, failed, errors: errors.slice(0, 5) })
  } catch (err) {
    next(err)
  }
}

// ─── Get students with filters ────────────────────────────────────────────────
export const getStudents = async (req, res, next) => {
  try {
    const { search, minCGPA, maxCGPA, branch, passingYear, maxBacklogs, domain, page = 1, limit = 20 } = req.query

    const filter = { role: 'student' }

    if (search?.trim()) {
      filter.$or = [
        { name:       { $regex: search.trim(), $options: 'i' } },
        { email:      { $regex: search.trim(), $options: 'i' } },
        { rollNumber: { $regex: search.trim(), $options: 'i' } },
      ]
    }

    if (minCGPA || maxCGPA) {
      filter.cgpa = {}
      if (minCGPA) filter.cgpa.$gte = parseFloat(minCGPA)
      if (maxCGPA) filter.cgpa.$lte = parseFloat(maxCGPA)
    }

    if (branch?.trim())      filter.branch      = { $regex: branch.trim(), $options: 'i' }
    if (passingYear)         filter.passingYear = parseInt(passingYear)
    if (maxBacklogs !== undefined && maxBacklogs !== '') filter.backlogs = { $lte: parseInt(maxBacklogs) }

    // Domain filter
    if (domain?.trim()) filter.domain = { $regex: domain.trim(), $options: 'i' }

    const skip     = (Number(page) - 1) * Number(limit)
    const students = await User.find(filter).select('-password').sort({ cgpa: -1, name: 1 }).skip(skip).limit(Number(limit))
    const total    = await User.countDocuments(filter)

    return res.json({ students, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    next(err)
  }
}

// ─── Shortlist students for a drive ──────────────────────────────────────────
export const shortlistStudents = async (req, res, next) => {
  try {
    const { studentIds, jobId } = req.body
    if (!jobId)                                              return res.status(400).json({ message: 'jobId is required' })
    if (!Array.isArray(studentIds) || !studentIds.length)   return res.status(400).json({ message: 'studentIds required' })

    const job = await Job.findById(jobId)
    if (!job) return res.status(404).json({ message: 'Drive not found' })

    let shortlisted = 0, alreadyDone = 0

    for (const studentId of studentIds) {
      try {
        const existing = await Application.findOne({ job: jobId, student: studentId })
        if (existing) {
          if (existing.status === 'applied') {
            existing.status = 'shortlisted'
            existing.statusHistory.push({ status: 'shortlisted', changedBy: req.user._id, note: 'Shortlisted by TPO' })
            await existing.save()
            shortlisted++
          } else { alreadyDone++ }
        } else {
          await Application.create({
            job: jobId, student: studentId, status: 'shortlisted',
            statusHistory: [
              { status: 'applied',     changedBy: req.user._id },
              { status: 'shortlisted', changedBy: req.user._id, note: 'Shortlisted by TPO' },
            ],
          })
          shortlisted++
        }
        await Notification.create({
          recipient: studentId, type: 'shortlisted',
          title:   `Shortlisted for ${job.company}!`,
          message: `You have been shortlisted for ${job.title} at ${job.company}.`,
          link: '/applications', relatedJob: jobId,
        })
      } catch (err) { console.error(`Failed for ${studentId}:`, err.message) }
    }

    return res.json({ message: 'Shortlisting complete', shortlisted, alreadyDone })
  } catch (err) { next(err) }
}