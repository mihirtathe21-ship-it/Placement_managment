import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, RotateCcw, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import toast from 'react-hot-toast'
import logo from '../../assets/logo.png'

export default function VerifyEmailPage() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { login } = useAuth()

  // email passed from register/login page via router state
  const email = location.state?.email || ''

  const [otp, setOtp]           = useState(['', '', '', '', '', ''])
  const [loading, setLoading]   = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)   // 60 s cooldown before resend
  const inputRefs = useRef([])

  // Start countdown on mount
  useEffect(() => {
    if (!email) { navigate('/register'); return }
    const timer = setInterval(() => {
      setCountdown(c => (c > 0 ? c - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [email, navigate])

  // ── OTP input helpers ─────────────────────────────────────────────────────
  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return           // digits only
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setOtp(text.split(''))
      inputRefs.current[5]?.focus()
    }
    e.preventDefault()
  }

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { toast.error('Please enter the complete 6-digit OTP'); return }

    setLoading(true)
    try {
      const res = await api.post('/auth/verify-email', { email, otp: code })
      // Backend returns token + user on success — log them in directly
      const { token, user } = res.data
      // Reuse AuthContext login flow by injecting token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      toast.success('Email verified! Welcome to RCPIT Placement Portal 🎉')

      const ROLE_PATHS = {
        admin: '/admin-dashboard',
        tpo: '/tpo-dashboard',
        student: '/student-dashboard',
        recruiter: '/recruiter-dashboard',
      }
      navigate(ROLE_PATHS[user.role] || '/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return
    setResending(true)
    try {
      await api.post('/auth/resend-otp', { email })
      toast.success('A new OTP has been sent to your email!')
      setCountdown(60)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #f4f6fb; color: #1a1a2e; min-height: 100vh; }

        .navbar {
          display: flex; align-items: center;
          padding: 0 2.5rem; height: 60px;
          background: #fff; border-bottom: 1px solid #e8edf3;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .nb-brand { display: flex; align-items: center; gap: .6rem; text-decoration: none; }
        .nb-brand-title { font-size: .88rem; font-weight: 700; color: #1a1a2e; line-height: 1.2; }
        .nb-brand-sub { font-size: .62rem; color: #8896a8; }

        .page {
          min-height: calc(100vh - 60px);
          display: flex; align-items: center; justify-content: center;
          padding: 2.5rem 1.5rem;
        }

        .card {
          width: 100%; max-width: 440px;
          background: #fff;
          border: 1px solid #dde3ec;
          border-radius: 18px;
          padding: 2.6rem 2.2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05), 0 16px 48px rgba(0,0,0,0.08);
          text-align: center;
        }

        .icon-wrap {
          width: 64px; height: 64px; border-radius: 50%;
          background: #eef3fa; border: 2px solid #c7d8f0;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.4rem;
        }

        .card-title {
          font-family: 'Merriweather', serif;
          font-size: 1.45rem; font-weight: 900; color: #1a1a2e; margin-bottom: .35rem;
        }
        .card-sub { font-size: .8rem; color: #8896a8; line-height: 1.6; margin-bottom: .3rem; }
        .card-email { font-size: .82rem; font-weight: 700; color: #1a3c6e; margin-bottom: 2rem; }

        /* ── OTP boxes ── */
        .otp-row {
          display: flex; justify-content: center; gap: .6rem; margin-bottom: 1.6rem;
        }
        .otp-box {
          width: 48px; height: 56px;
          border: 1.5px solid #dde3ec;
          border-radius: 10px;
          background: #f8fafc;
          font-size: 1.4rem; font-weight: 700; text-align: center; color: #1a1a2e;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color .18s, box-shadow .18s, background .18s;
          caret-color: #1a3c6e;
        }
        .otp-box:focus {
          border-color: #1a3c6e; background: #fff;
          box-shadow: 0 0 0 3px rgba(26,60,110,0.1);
        }
        .otp-box.filled { border-color: #1a3c6e; background: #eef3fa; }

        .btn-verify {
          width: 100%; padding: .8rem;
          background: #1a3c6e; color: #fff;
          font-size: .88rem; font-weight: 700;
          font-family: 'Inter', sans-serif;
          border: none; border-radius: 10px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: .45rem;
          box-shadow: 0 4px 14px rgba(26,60,110,0.22);
          transition: background .18s, transform .18s;
          margin-bottom: 1.2rem;
        }
        .btn-verify:hover:not(:disabled) { background: #142e55; transform: translateY(-1px); }
        .btn-verify:disabled { opacity: .6; cursor: not-allowed; }

        .spinner {
          width: 17px; height: 17px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .divider { height: 1px; background: #eef1f6; margin: 0 0 1.2rem; }

        .resend-row { font-size: .77rem; color: #8896a8; }
        .resend-btn {
          background: none; border: none; cursor: pointer; padding: 0;
          font-size: .77rem; font-weight: 600; color: #1a3c6e;
          font-family: 'Inter', sans-serif;
          text-decoration: underline;
          transition: color .15s;
        }
        .resend-btn:disabled { color: #aab4c0; cursor: not-allowed; text-decoration: none; }
        .countdown { font-weight: 600; color: #1a3c6e; }

        .back-link {
          display: inline-flex; align-items: center; gap: .3rem;
          margin-top: 1.1rem; font-size: .75rem; color: #8896a8;
          text-decoration: none;
          transition: color .15s;
        }
        .back-link:hover { color: #1a3c6e; }

        @media (max-width: 480px) {
          .otp-box { width: 42px; height: 50px; font-size: 1.2rem; }
          .card { padding: 2rem 1.3rem; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <a href="/" className="nb-brand">
          <img src={logo} alt="SES Logo" style={{ width: 34, height: 34, objectFit: 'contain' }} />
          <div>
            <div className="nb-brand-title">Training and Placement</div>
            <div className="nb-brand-sub">R. C. Patel Institute of Technology, Shirpur</div>
          </div>
        </a>
      </nav>

      {/* ── PAGE ── */}
      <div className="page">
        <div className="card">

          <div className="icon-wrap">
            <ShieldCheck size={30} color="#1a3c6e" />
          </div>

          <h2 className="card-title">Verify Your Email</h2>
          <p className="card-sub">We sent a 6-digit OTP to</p>
          <p className="card-email">{email}</p>

          <form onSubmit={handleVerify}>
            <div className="otp-row" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => inputRefs.current[idx] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  className={`otp-box${digit ? ' filled' : ''}`}
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            <button type="submit" disabled={loading} className="btn-verify">
              {loading
                ? <div className="spinner" />
                : <><ShieldCheck size={15} /> Verify & Continue</>
              }
            </button>
          </form>

          <div className="divider" />

          <p className="resend-row">
            Didn't receive it?{' '}
            {countdown > 0 ? (
              <span>Resend in <span className="countdown">{countdown}s</span></span>
            ) : (
              <button
                className="resend-btn"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? 'Sending…' : <><RotateCcw size={11} style={{display:'inline',marginRight:3}} />Resend OTP</>}
              </button>
            )}
          </p>

          <Link to="/register" className="back-link">
            <ArrowLeft size={13} /> Back to Register
          </Link>
        </div>
      </div>
    </>
  )
}