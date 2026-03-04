import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'

const ROLE_PATHS = {
  admin: '/admin-dashboard',
  tpo: '/tpo-dashboard',
  student: '/student-dashboard',
  recruiter: '/recruiter-dashboard',
}

export default function HomePage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const user = await login(data.email, data.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(ROLE_PATHS[user.role] || '/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@700;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', sans-serif;
          background: #ffffff;
          color: #1a1a2e;
          min-height: 100vh;
        }

        /* ════════════════════════
           NAVBAR — exact old style
        ════════════════════════ */
        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          height: 60px;
          background: #ffffff;
          border-bottom: 1px solid #e8edf3;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        /* Left: logo placeholder + name */
        .nb-brand {
          display: flex;
          align-items: center;
          gap: .6rem;
          text-decoration: none;
        }
        .nb-logo-box {
          width: 36px; height: 36px;
          border-radius: 6px;
          background: #1a3c6e;
          display: flex; align-items: center; justify-content: center;
          font-size: .55rem; font-weight: 800; color: #f0c040;
          letter-spacing: -.3px; text-align: center; line-height: 1.1;
          flex-shrink: 0;
          /* replace with <img src={logo} /> later */
        }
        .nb-brand-text { }
        .nb-brand-title {
          font-size: .88rem; font-weight: 700; color: #1a1a2e; line-height: 1.2;
        }
        .nb-brand-sub { font-size: .62rem; color: #8896a8; }

        /* Center nav links */
        .nb-links {
          display: flex; align-items: center; gap: .25rem;
          list-style: none;
        }
        .nb-links a {
          padding: .4rem .85rem; border-radius: 5px;
          font-size: .84rem; font-weight: 500; color: #444;
          text-decoration: none;
          transition: color .15s, background .15s;
        }
        .nb-links a:hover { color: #1a3c6e; background: #f0f4fa; }

        /* Right: Student Login button */
        .nb-login {
          padding: .42rem 1.1rem;
          border: 1.5px solid #1a3c6e;
          border-radius: 5px;
          font-size: .82rem; font-weight: 600; color: #1a3c6e;
          background: transparent; cursor: pointer;
          text-decoration: none;
          transition: background .15s, color .15s;
        }
        .nb-login:hover { background: #1a3c6e; color: #fff; }

        /* ════════════════════════
           HERO
        ════════════════════════ */
        .hero {
          min-height: calc(100vh - 60px);
          display: flex;
          align-items: center;
          padding: 3rem 2.5rem;
          background: #ffffff;
        }
        .hero-inner {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 5rem;
          align-items: center;
        }

        /* ── Left: college info ── */
        .hero-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        /* logo placeholder — remove after adding real logo */
        .college-logo {
          width: 80px; height: 80px;
          border-radius: 50%;
          background: #1a3c6e;
          display: flex; align-items: center; justify-content: center;
          font-size: .75rem; font-weight: 800; color: #f0c040;
          text-align: center; line-height: 1.2;
          margin-bottom: 1.4rem;
          /* replace entire div with: <img src={logo} alt="SES logo" style={{width:80,height:80,objectFit:'contain',marginBottom:'1.4rem'}} /> */
        }

        .college-society {
          font-size: 1rem;
          font-weight: 500;
          color: #7a8fa6;
          margin-bottom: .55rem;
          letter-spacing: .01em;
        }

        .college-name {
          font-family: 'Merriweather', serif;
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          font-weight: 900;
          color: #1a1a2e;
          line-height: 1.2;
          margin-bottom: .8rem;
        }

        .college-auto {
          font-size: .85rem;
          font-weight: 600;
          color: #5a7a9a;
          margin-bottom: .2rem;
        }

        .college-affiliated {
          font-size: .85rem;
          font-weight: 600;
          color: #5a7a9a;
          margin-bottom: 1.4rem;
        }

        .college-dept {
          font-family: 'Merriweather', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a1a2e;
        }

        /* ── Right: Sign In form ── */
        .signin-wrap {
          display: flex;
          justify-content: center;
        }

        .signin-card {
          width: 100%;
          max-width: 400px;
          background: #ffffff;
          border: 1px solid #dde3ec;
          border-radius: 16px;
          padding: 2.2rem 2rem;
          box-shadow:
            0 2px 8px rgba(0,0,0,0.06),
            0 12px 40px rgba(0,0,0,0.08);
        }

        .sc-title {
          font-family: 'Merriweather', serif;
          font-size: 1.45rem; font-weight: 900; color: #1a1a2e;
          margin-bottom: .3rem;
        }
        .sc-sub { font-size: .78rem; color: #8896a8; margin-bottom: 1.6rem; line-height: 1.5; }

        .field { margin-bottom: 1rem; }
        .lbl { display: block; font-size: .74rem; font-weight: 600; color: #445; margin-bottom: .38rem; }

        .input-wrap { position: relative; }
        .i-icon {
          position: absolute; left: .85rem; top: 50%;
          transform: translateY(-50%);
          color: #b0bec8; pointer-events: none; display: flex;
        }
        .inp {
          width: 100%;
          padding: .72rem .9rem .72rem 2.4rem;
          border: 1.5px solid #dde3ec;
          border-radius: 9px;
          font-size: .84rem; font-family: 'Inter', sans-serif;
          color: #1a1a2e; background: #f8fafc;
          outline: none;
          transition: border-color .18s, box-shadow .18s, background .18s;
        }
        .inp::placeholder { color: #c0cdd8; }
        .inp:focus {
          border-color: #1a3c6e;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(26,60,110,0.1);
        }
        .inp.err { border-color: #f87171; }
        .inp.pr  { padding-right: 2.6rem; }

        .eye-btn {
          position: absolute; right: .85rem; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer; padding: 0;
          color: #b0bec8; display: flex; align-items: center;
          transition: color .18s;
        }
        .eye-btn:hover { color: #445; }
        .err-msg { font-size: .7rem; color: #ef4444; margin-top: .28rem; }

        .btn-signin {
          width: 100%; padding: .78rem; margin-top: .5rem;
          background: #1a3c6e; color: #fff;
          font-size: .87rem; font-weight: 700;
          font-family: 'Inter', sans-serif;
          border: none; border-radius: 9px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: .45rem;
          box-shadow: 0 4px 14px rgba(26,60,110,0.25);
          transition: background .18s, transform .18s;
        }
        .btn-signin:hover:not(:disabled) { background: #142e55; transform: translateY(-1px); }
        .btn-signin:disabled { opacity: .6; cursor: not-allowed; }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .sc-divider { height: 1px; background: #eef1f6; margin: 1.3rem 0; }
        .sc-register { text-align: center; font-size: .77rem; color: #8896a8; }
        .sc-register a { color: #1a3c6e; font-weight: 600; text-decoration: none; }
        .sc-register a:hover { text-decoration: underline; }

        /* ── Responsive ── */
        @media (max-width: 820px) {
          .hero-inner { grid-template-columns: 1fr; gap: 2.5rem; }
          .hero-left { align-items: center; text-align: center; }
          .nb-links { display: none; }
        }
      `}</style>

      {/* ══ NAVBAR ══ */}
      <nav className="navbar">
        {/* Brand */}
        <a href="#" className="nb-brand">
          <img src={logo} alt="SES Logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <div className="nb-brand-text">
            <div className="nb-brand-title">Training and Placement</div>
            <div className="nb-brand-sub">R. C. Patel Institute of Technology, Shirpur</div>
          </div>
        </a>
      </nav>

      {/* ══ HERO ══ */}
      <main className="hero">
        <div className="hero-inner">

          {/* ── Left: College info ── */}
          <div className="hero-left">
            {/*
              LOGO PLACEHOLDER — replace this div with your actual logo image:
              <img src={logo} alt="SES Logo" style={{width:80,height:80,objectFit:'contain',marginBottom:'1.4rem'}} />
            */}
            <img src={logo} alt="SES Logo" style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: '1.4rem' }} />

            <p className="college-society">Shirpur Education Society's</p>
            <h1 className="college-name">
              R. C. Patel Institute of Technology,<br />Shirpur
            </h1>
            <p className="college-auto">An Autonomous Institute</p>
            <p className="college-affiliated">Affiliated to DBATU, Lonere (M.S.)</p>
            <p className="college-dept">Training and Placement Department</p>
          </div>

          {/* ── Right: Sign In ── */}
          <div className="signin-wrap">
            <div className="signin-card">
              <h2 className="sc-title">Sign In</h2>
              <p className="sc-sub">Enter your credentials to access your dashboard</p>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="field">
                  <label className="lbl">Email Address</label>
                  <div className="input-wrap">
                    <span className="i-icon"><Mail size={15} /></span>
                    <input
                      type="email"
                      placeholder="you@college.edu"
                      className={`inp${errors.email ? ' err' : ''}`}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                      })}
                    />
                  </div>
                  {errors.email && <p className="err-msg">{errors.email.message}</p>}
                </div>

                <div className="field">
                  <label className="lbl">Password</label>
                  <div className="input-wrap">
                    <span className="i-icon"><Lock size={15} /></span>
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`inp pr${errors.password ? ' err' : ''}`}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Min 6 characters' }
                      })}
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <p className="err-msg">{errors.password.message}</p>}
                </div>

                <button type="submit" disabled={isLoading} className="btn-signin">
                  {isLoading
                    ? <div className="spinner" />
                    : <><LogIn size={15} /> Sign In</>
                  }
                </button>
              </form>

              <div className="sc-divider" />
              <p className="sc-register">
                New to PlaceNext?{' '}
                <Link to="/register">Create account</Link>
              </p>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}


// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useForm } from 'react-hook-form'
// import toast from 'react-hot-toast'
// import { Mail, Lock, Eye, EyeOff, LogIn, Briefcase } from 'lucide-react'
// import { useAuth } from '../../context/AuthContext'

// const ROLE_PATHS = {
//   admin: '/admin-dashboard',
//   tpo: '/tpo-dashboard',
//   student: '/student-dashboard',
//   recruiter: '/recruiter-dashboard',
// }

// export default function LoginPage() {
//   const { login } = useAuth()
//   const navigate = useNavigate()
//   const [showPass, setShowPass] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)

//   const { register, handleSubmit, formState: { errors } } = useForm()

//   const onSubmit = async (data) => {
//     setIsLoading(true)
//     try {
//       const user = await login(data.email, data.password)
//       toast.success(`Welcome back, ${user.name}!`)
//       navigate(ROLE_PATHS[user.role] || '/login')
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Invalid credentials')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen mesh-bg noise flex">
//       {/* Left Panel */}
//       <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden">
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute -top-24 -left-24 w-96 h-96 bg-navy-600/20 rounded-full blur-3xl animate-float" />
//           <div className="absolute -bottom-12 right-12 w-72 h-72 bg-navy-400/10 rounded-full blur-3xl animate-float" style={{animationDelay:'3s'}} />
//         </div>
        
//         <div className="relative z-10">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gradient-to-br from-navy-400 to-navy-600 rounded-xl flex items-center justify-center shadow-lg">
//               <Briefcase className="w-5 h-5 text-white" />
//             </div>
//             <span className="font-display text-xl font-bold text-white">PlaceNext</span>
//           </div>
//         </div>

//         <div className="relative z-10 space-y-6">
//           <div className="space-y-3">
//             <p className="text-navy-300 text-sm font-semibold uppercase tracking-widest">Placement Analytics</p>
//             <h1 className="font-display text-5xl font-bold text-white leading-tight">
//               Shape the Future of<br />
//               <span className="gradient-text">Campus Placements</span>
//             </h1>
//             <p className="text-white/40 text-lg max-w-sm leading-relaxed">
//               A unified platform for students, recruiters, and placement officers to collaborate seamlessly.
//             </p>
//           </div>

//           <div className="flex gap-8">
//             {[
//               { label: 'Companies', value: '200+' },
//               { label: 'Placements', value: '1.8K' },
//               { label: 'Avg Package', value: '₹12L' },
//             ].map(stat => (
//               <div key={stat.label}>
//                 <div className="font-display text-2xl font-bold text-white">{stat.value}</div>
//                 <div className="text-white/40 text-xs uppercase tracking-wider">{stat.label}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="relative z-10">
//           <p className="text-white/20 text-xs">© 2024 PlaceNext. Final Year Project.</p>
//         </div>
//       </div>

//       {/* Right Panel - Login Form */}
//       <div className="flex-1 lg:max-w-md flex flex-col justify-center p-8 lg:p-12 relative z-10">
//         <div className="animate-slide-up">
//           {/* Mobile logo */}
//           <div className="flex items-center gap-3 mb-8 lg:hidden">
//             <div className="w-9 h-9 bg-gradient-to-br from-navy-400 to-navy-600 rounded-xl flex items-center justify-center">
//               <Briefcase className="w-4 h-4 text-white" />
//             </div>
//             <span className="font-display text-lg font-bold text-white">PlaceNext</span>
//           </div>

//           <div className="glass-card p-8">
//             <div className="mb-8">
//               <h2 className="font-display text-3xl font-bold text-white mb-2">Sign In</h2>
//               <p className="text-white/40 text-sm">Enter your credentials to access your dashboard</p>
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//               <div>
//                 <label className="label-text">Email Address</label>
//                 <div className="relative">
//                   <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
//                   <input
//                     type="email"
//                     placeholder="you@college.edu"
//                     className={`input-field pl-10 ${errors.email ? 'error' : ''}`}
//                     {...register('email', {
//                       required: 'Email is required',
//                       pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
//                     })}
//                   />
//                 </div>
//                 {errors.email && <p className="error-text">{errors.email.message}</p>}
//               </div>

//               <div>
//                 <label className="label-text">Password</label>
//                 <div className="relative">
//                   <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
//                   <input
//                     type={showPass ? 'text' : 'password'}
//                     placeholder="••••••••"
//                     className={`input-field pl-10 pr-11 ${errors.password ? 'error' : ''}`}
//                     {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
//                   />
//                   <button type="button" onClick={() => setShowPass(!showPass)}
//                     className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
//                     {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                   </button>
//                 </div>
//                 {errors.password && <p className="error-text">{errors.password.message}</p>}
//               </div>

//               <button type="submit" disabled={isLoading} className="btn-primary flex items-center justify-center gap-2 mt-2">
//                 {isLoading ? (
//                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                 ) : (
//                   <>
//                     <LogIn className="w-4 h-4" />
//                     Sign In
//                   </>
//                 )}
//               </button>
//             </form>

//             <div className="mt-6 pt-6 border-t border-white/5 text-center">
//               <p className="text-white/40 text-sm">
//                 New to PlaceNext?{' '}
//                 <Link to="/register" className="text-navy-400 hover:text-navy-300 font-semibold transition-colors">
//                   Create account
//                 </Link>
//               </p>
//             </div>

//             {/* Demo hint */}
//             <div className="mt-4 p-3 rounded-xl bg-gold-500/5 border border-gold-500/10">
//               <p className="text-gold-400/70 text-xs text-center font-mono">
//                 ℹ️ Admin & TPO accounts are created manually via DB seed
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
