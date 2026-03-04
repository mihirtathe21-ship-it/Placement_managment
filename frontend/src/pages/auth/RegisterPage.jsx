import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, GraduationCap, Building2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import logo from '../../assets/logo.png'

const DOMAINS = [
  'Full Stack Development','Frontend Development','Backend Development',
  'Data Analytics','Data Science','Machine Learning','Artificial Intelligence',
  'Cloud Computing','DevOps','Cybersecurity','Mobile Development','UI/UX Design',
  '.NET Development','Java Development','Python Development',
  'Embedded Systems','Networking','Database Administration','Other',
]

const BRANCHES = [
  'Computer Science','Information Technology','Electronics',
  'Mechanical','Civil','Electrical','Chemical','Biotechnology','Other',
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    role: 'student',
    rollNumber: '', branch: '', passingYear: '', cgpa: '', domain: '',
    companyName: '', designation: '',
  })

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email and password are required')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created successfully!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@700;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', sans-serif;
          background: #f4f6fb;
          color: #1a1a2e;
          min-height: 100vh;
        }

        /* ── NAVBAR ── */
        .navbar {
          display: flex; align-items: center;
          padding: 0 2.5rem; height: 60px;
          background: #fff;
          border-bottom: 1px solid #e8edf3;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .nb-brand { display: flex; align-items: center; gap: .6rem; text-decoration: none; }
        .nb-brand-title { font-size: .88rem; font-weight: 700; color: #1a1a2e; line-height: 1.2; }
        .nb-brand-sub { font-size: .62rem; color: #8896a8; }

        /* ── PAGE ── */
        .page {
          min-height: calc(100vh - 60px);
          display: flex; align-items: flex-start; justify-content: center;
          padding: 2.5rem 1.5rem 3rem;
        }

        /* ── CARD ── */
        .card {
          width: 100%; max-width: 600px;
          background: #fff;
          border: 1px solid #dde3ec;
          border-radius: 18px;
          padding: 2.4rem 2.2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05), 0 16px 48px rgba(0,0,0,0.08);
        }

        /* ── Header ── */
        .card-header { text-align: center; margin-bottom: 1.8rem; }
        .card-title {
          font-family: 'Merriweather', serif;
          font-size: 1.5rem; font-weight: 900; color: #1a1a2e; margin-bottom: .25rem;
        }
        .card-sub { font-size: .78rem; color: #8896a8; }

        /* ── Role selector ── */
        .role-label {
          font-size: .7rem; font-weight: 700; color: #8896a8;
          text-transform: uppercase; letter-spacing: .08em; margin-bottom: .5rem; display: block;
        }
        .role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; margin-bottom: 1.4rem; }
        .role-btn {
          display: flex; align-items: center; justify-content: center; gap: .5rem;
          padding: .65rem; border-radius: 10px;
          font-size: .82rem; font-weight: 600;
          border: 1.5px solid #dde3ec;
          background: #f8fafc; color: #8896a8;
          cursor: pointer; transition: all .18s;
        }
        .role-btn:hover { border-color: #1a3c6e; color: #1a3c6e; background: #f0f4fa; }
        .role-btn.active { border-color: #1a3c6e; background: #eef3fa; color: #1a3c6e; }

        /* ── Section divider ── */
        .section-divider {
          border: none; border-top: 1px solid #eef1f6;
          margin: 1.4rem 0 1.2rem;
        }
        .section-heading {
          font-size: .68rem; font-weight: 700; color: #aab4c0;
          text-transform: uppercase; letter-spacing: .1em; margin-bottom: 1rem;
        }

        /* ── Grid helpers ── */
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: .9rem; margin-bottom: .9rem; }
        .grid1 { margin-bottom: .9rem; }

        /* ── Field ── */
        .lbl {
          display: block; font-size: .72rem; font-weight: 600;
          color: #556; margin-bottom: .35rem;
        }
        .input-wrap { position: relative; }
        .inp {
          width: 100%;
          padding: .68rem .9rem;
          border: 1.5px solid #dde3ec;
          border-radius: 9px;
          font-size: .83rem; font-family: 'Inter', sans-serif;
          color: #1a1a2e; background: #f8fafc;
          outline: none;
          transition: border-color .18s, box-shadow .18s, background .18s;
          appearance: none;
        }
        .inp::placeholder { color: #c0cdd8; }
        .inp:focus { border-color: #1a3c6e; background: #fff; box-shadow: 0 0 0 3px rgba(26,60,110,0.09); }
        .inp.pr { padding-right: 2.6rem; }
        .eye-btn {
          position: absolute; right: .85rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; padding: 0;
          color: #b0bec8; display: flex; align-items: center; transition: color .18s;
        }
        .eye-btn:hover { color: #445; }

        /* ── Domain chips ── */
        .domain-lbl {
          font-size: .72rem; font-weight: 600; color: #556;
          margin-bottom: .45rem; display: block;
        }
        .domain-note { font-size: .68rem; color: #1a3c6e; font-weight: 400; margin-left: .3rem; }
        .domain-grid { display: flex; flex-wrap: wrap; gap: .45rem; margin-bottom: .4rem; }
        .domain-chip {
          padding: .38rem .75rem; border-radius: 99px;
          border: 1.5px solid #dde3ec;
          background: #f8fafc;
          font-size: .75rem; font-weight: 500; color: #8896a8;
          cursor: pointer; transition: all .15s;
        }
        .domain-chip:hover { border-color: #1a3c6e; color: #1a3c6e; background: #f0f4fa; }
        .domain-chip.selected { border-color: #1a3c6e; background: #eef3fa; color: #1a3c6e; font-weight: 700; }
        .domain-hint { font-size: .68rem; color: #b0bec8; margin-top: .2rem; }

        /* ── Submit ── */
        .btn-submit {
          width: 100%; padding: .8rem; margin-top: .8rem;
          background: #1a3c6e; color: #fff;
          font-size: .88rem; font-weight: 700;
          font-family: 'Inter', sans-serif;
          border: none; border-radius: 10px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: .45rem;
          box-shadow: 0 4px 14px rgba(26,60,110,0.22);
          transition: background .18s, transform .18s;
        }
        .btn-submit:hover:not(:disabled) { background: #142e55; transform: translateY(-1px); }
        .btn-submit:disabled { opacity: .6; cursor: not-allowed; }
        .spinner { width: 17px; height: 17px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .signin-row { text-align: center; font-size: .77rem; color: #8896a8; margin-top: 1rem; }
        .signin-row a { color: #1a3c6e; font-weight: 600; text-decoration: none; }
        .signin-row a:hover { text-decoration: underline; }

        @media (max-width: 540px) {
          .grid2 { grid-template-columns: 1fr; }
          .card { padding: 1.8rem 1.2rem; }
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

          {/* Header */}
          <div className="card-header">
            <h2 className="card-title">Create Account</h2>
            <p className="card-sub">Join the RCPIT Placement Portal</p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Role */}
            <span className="role-label">I am a</span>
            <div className="role-grid">
              {[
                { val: 'student',   label: 'Student',   icon: GraduationCap },
                { val: 'recruiter', label: 'Recruiter', icon: Building2 },
              ].map(r => (
                <button
                  key={r.val} type="button"
                  onClick={() => set('role', r.val)}
                  className={`role-btn${form.role === r.val ? ' active' : ''}`}
                >
                  <r.icon size={15} /> {r.label}
                </button>
              ))}
            </div>

            {/* Basic info */}
            <div className="grid2">
              <div>
                <label className="lbl">Full Name *</label>
                <input type="text" placeholder="Jane Doe" value={form.name}
                  onChange={e => set('name', e.target.value)} className="inp" required />
              </div>
              <div>
                <label className="lbl">Email *</label>
                <input type="email" placeholder="jane@college.edu" value={form.email}
                  onChange={e => set('email', e.target.value)} className="inp" required />
              </div>
            </div>

            <div className="grid2">
              <div>
                <label className="lbl">Password *</label>
                <div className="input-wrap">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    className="inp pr" required
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(p => !p)}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="lbl">Phone</label>
                <input type="tel" placeholder="9876543210" value={form.phone}
                  onChange={e => set('phone', e.target.value)} className="inp" />
              </div>
            </div>

            {/* ── Student fields ── */}
            {form.role === 'student' && (
              <>
                <hr className="section-divider" />
                <p className="section-heading">Academic Details</p>

                <div className="grid2">
                  <div>
                    <label className="lbl">Roll Number</label>
                    <input type="text" placeholder="CS2001" value={form.rollNumber}
                      onChange={e => set('rollNumber', e.target.value)} className="inp" />
                  </div>
                  <div>
                    <label className="lbl">Branch</label>
                    <select value={form.branch} onChange={e => set('branch', e.target.value)} className="inp">
                      <option value="">Select branch</option>
                      {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="lbl">Passing Year</label>
                    <select value={form.passingYear} onChange={e => set('passingYear', e.target.value)} className="inp">
                      <option value="">Select year</option>
                      {[2024,2025,2026,2027,2028].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="lbl">CGPA</label>
                    <input type="number" step="0.01" min="0" max="10" placeholder="e.g. 8.5"
                      value={form.cgpa} onChange={e => set('cgpa', e.target.value)} className="inp" />
                  </div>
                </div>

                <div className="grid1">
                  <label className="domain-lbl">
                    Specialization Domain
                    <span className="domain-note">(used for job matching)</span>
                  </label>
                  <div className="domain-grid">
                    {DOMAINS.map(d => (
                      <span
                        key={d}
                        onClick={() => set('domain', form.domain === d ? '' : d)}
                        className={`domain-chip${form.domain === d ? ' selected' : ''}`}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                  {!form.domain && <p className="domain-hint">Select your primary area of expertise</p>}
                </div>
              </>
            )}

            {/* ── Recruiter fields ── */}
            {form.role === 'recruiter' && (
              <>
                <hr className="section-divider" />
                <p className="section-heading">Company Details</p>
                <div className="grid2">
                  <div>
                    <label className="lbl">Company Name</label>
                    <input type="text" placeholder="Acme Corp" value={form.companyName}
                      onChange={e => set('companyName', e.target.value)} className="inp" />
                  </div>
                  <div>
                    <label className="lbl">Designation</label>
                    <input type="text" placeholder="HR Manager" value={form.designation}
                      onChange={e => set('designation', e.target.value)} className="inp" />
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? <div className="spinner" /> : 'Create Account'}
            </button>

            <p className="signin-row">
              Already have an account? <Link to="/">Sign in</Link>
            </p>

          </form>
        </div>
      </div>
    </>
  )
}