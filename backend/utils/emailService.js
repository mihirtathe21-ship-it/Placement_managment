import nodemailer from 'nodemailer'

// ─── Transporter (Gmail free tier) ───────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,   // your Gmail address
    pass: process.env.EMAIL_PASS,   // Gmail App Password (NOT your real password)
  },
})

// ─── Generate 6-digit OTP ─────────────────────────────────────────────────────
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ─── Send Email Verification OTP ─────────────────────────────────────────────
export const sendVerificationEmail = async (email, name, otp) => {
  const mailOptions = {
    from: `"RCPIT Placement Portal" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '📧 Verify Your RCPIT Placement Portal Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4F46E5;">Welcome to RCPIT Placement Portal, ${name}! 🎓</h2>
        <p style="font-size: 16px; color: #333;">Thanks for registering. Please verify your email address using the OTP below:</p>

        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 42px; font-weight: bold; letter-spacing: 10px; color: #4F46E5; background: #EEF2FF; padding: 15px 30px; border-radius: 8px;">
            ${otp}
          </span>
        </div>

        <p style="font-size: 14px; color: #666;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <p style="font-size: 14px; color: #666;">If you did not create an account, please ignore this email.</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">RCPIT Campus Placement Portal</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

// ─── Send Job Notification to Students ───────────────────────────────────────
export const sendJobNotificationEmail = async (email, studentName, job) => {
  const mailOptions = {
    from: `"RCPIT Placement Portal" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🚀 New Placement Drive: ${job.company} is coming to campus!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4F46E5;">Hi ${studentName}! 👋</h2>
        <p style="font-size: 16px; color: #333;">
          Great news! A new placement drive has been posted on the portal.
        </p>

        <div style="background: #F9FAFB; border-left: 4px solid #4F46E5; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1F2937;">🏢 ${job.company}</h3>
          <p style="margin: 5px 0; color: #374151;"><strong>Role:</strong> ${job.title}</p>
          ${job.package ? `<p style="margin: 5px 0; color: #374151;"><strong>Package:</strong> ${job.package} LPA</p>` : ''}
          ${job.location ? `<p style="margin: 5px 0; color: #374151;"><strong>Location:</strong> ${job.location}</p>` : ''}
          ${job.driveDate ? `<p style="margin: 5px 0; color: #374151;"><strong>Drive Date:</strong> ${new Date(job.driveDate).toDateString()}</p>` : ''}
          ${job.lastDateToApply ? `<p style="margin: 5px 0; color: #e53e3e;"><strong>Last Date to Apply:</strong> ${new Date(job.lastDateToApply).toDateString()}</p>` : ''}
        </div>

        <p style="font-size: 15px; color: #333;">Log in to the portal to view full details and apply before the deadline!</p>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/jobs"
            style="background: #4F46E5; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: bold;">
            View & Apply Now
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          You received this because you are a registered student on RCPIT Placement Portal.<br/>
          RCPIT Campus Placement Portal
        </p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}