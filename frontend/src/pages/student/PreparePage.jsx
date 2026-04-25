import { useState, useEffect } from "react";
import {
  Brain, Code2, BookOpen, FileSearch, PenTool, Trophy,
  ExternalLink, Sparkles, Star, Zap, CheckCircle2, Clock,
  ChevronRight, ArrowLeft, Lock, Rocket,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

// ── Prepare feature cards ─────────────────────────────────────────────────────
const PREPARE_CARDS = [

  // ── 1. APTITUDE ────────────────────────────────────────────────────────────
  {
    id: "aptitude",
    title: "Aptitude Practice",
    desc: "Practice quantitative, logical & verbal reasoning — the backbone of every campus placement test.",
    icon: Brain,
    gradient: "from-blue-500 to-cyan-500",
    bg: "from-blue-50 to-cyan-50",
    border: "border-blue-200",
    badge: "Start Here",
    badgeColor: "bg-blue-100 text-blue-700",
    tags: ["Quantitative", "Logical", "Verbal"],
    sections: [
      {
        heading: "🎓 Campus Credentials (College Platform)",
        links: [
          {
            label: "Aptitude Practice",
            url:   "https://learn.campuscredentials.com/learn",
            desc:  "Learn & practice aptitude topics",
            highlight: true,
          },
          {
            label: "Aptitude Test",
            url:   "https://code.campuscredentials.com/",
            desc:  "Take official aptitude tests",
            highlight: false,
          },
        ],
      },
    ],
  },

  // ── 2. CODING ──────────────────────────────────────────────────────────────
  {
    id: "coding",
    title: "Coding Practice",
    desc: "Solve DSA problems and coding challenges on your official college platform and beyond.",
    icon: Code2,
    gradient: "from-violet-500 to-purple-600",
    bg: "from-violet-50 to-purple-50",
    border: "border-violet-200",
    badge: "DSA Focus",
    badgeColor: "bg-violet-100 text-violet-700",
    tags: ["DSA", "Algorithms", "OOP", "Problem Solving"],
    sections: [
      {
        heading: "🎓 CodeChef (College Platform)",
        links: [
          {
            label: "CodeChef ",
            url:   "https://codechef.com",
            desc:  "Official college coding challenges — start here",
            highlight: true,
          },
        ],
      },
      {
        heading: "🌐 Additional Platform",
        links: [
          {
            label: "Leetcode",
            url:   "https://leetcode.com",
            desc:  "Competitive programming & contests",
            highlight: false,
          },
        ],
      },
    ],
  },

  // ── 3. TECH COURSES ────────────────────────────────────────────────────────
  {
    id: "courses",
    title: "Tech Courses",
    desc: "Curated learning paths for trending technologies. Track your progress and earn badges — coming soon on PlaceNext.",
    icon: BookOpen,
    gradient: "from-emerald-500 to-teal-500",
    bg: "from-emerald-50 to-teal-50",
    border: "border-emerald-200",
    badge: "Coming Soon",
    badgeColor: "bg-emerald-100 text-emerald-700",
    tags: ["Web Dev", "AI/ML", "Cloud", "Core CS"],
    comingSoon: true,
    comingSoonFeatures: [
      "Curated roadmaps per branch",
      "Progress tracking & badges",
      "Certificate integration",
      "Recommended by your TPO",
    ],
  },

  // ── 4. ATS RESUME SCORE ────────────────────────────────────────────────────
  {
    id: "ats",
    title: "ATS Resume Score",
    desc: "Instantly check how your resume performs against ATS filters — built directly into PlaceNext.",
    icon: FileSearch,
    gradient: "from-orange-500 to-amber-500",
    bg: "from-orange-50 to-amber-50",
    border: "border-orange-200",
    badge: "Coming Soon",
    badgeColor: "bg-orange-100 text-orange-700",
    tags: ["ATS Score", "Keyword Match", "Format Check"],
    comingSoon: true,
    comingSoonFeatures: [
      "Upload resume & get instant score",
      "Keyword gap analysis",
      "Format & length suggestions",
      "Match against job descriptions",
    ],
  },

  // ── 5. RESUME BUILDER ──────────────────────────────────────────────────────
  {
    id: "resume",
    title: "Resume Builder",
    desc: "Build a professional ATS-friendly resume inside PlaceNext — with pre-filled academic info from your profile.",
    icon: PenTool,
    gradient: "from-rose-500 to-pink-500",
    bg: "from-rose-50 to-pink-50",
    border: "border-rose-200",
    badge: "Coming Soon",
    badgeColor: "bg-rose-100 text-rose-700",
    tags: ["Auto-fill Profile", "PDF Export", "ATS Friendly"],
    comingSoon: true,
    comingSoonFeatures: [
      "Auto-fill from your PlaceNext profile",
      "Multiple ATS-optimised templates",
      "One-click PDF download",
      "Share directly with recruiters",
    ],
  },

  // ── 6. INTERVIEW PREP ──────────────────────────────────────────────────────
  {
    id: "interview",
    title: "Interview Prep",
    desc: "AI-powered mock interviews, company-specific HR questions and GD topics — tailored to your branch and domain.",
    icon: Trophy,
    gradient: "from-yellow-500 to-orange-400",
    bg: "from-yellow-50 to-orange-50",
    border: "border-yellow-200",
    badge: "Coming Soon",
    badgeColor: "bg-yellow-100 text-yellow-700",
    tags: ["HR Rounds", "Technical", "Mock Interview", "GD Topics"],
    comingSoon: true,
    comingSoonFeatures: [
      "AI mock interview with feedback",
      "Company-wise HR question bank",
      "Group discussion topic practice",
      "Peer mock interview scheduling",
    ],
  },
];

const TIPS = [
  "Start DSA practice at least 3 months before placements 🚀",
  "A well-formatted 1-page resume beats a 3-page one every time 📄",
  "Solve 2 problems daily on Campus Credentials to build consistency 💡",
  "Use Campus Credentials daily — it's built for your college! 🏫",
  "Research the company thoroughly before every interview 🔍",
];

// ── Coming Soon card ──────────────────────────────────────────────────────────
function ComingSoonCard({ card }) {
  const Icon = card.icon;
  return (
    <div className={`bg-gradient-to-br ${card.bg} border ${card.border} rounded-2xl shadow-sm flex flex-col overflow-hidden opacity-90`}>
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow opacity-70`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${card.badgeColor} flex items-center gap-1`}>
            <Lock size={9} /> {card.badge}
          </span>
        </div>
        <h3 className="font-bold text-gray-800 text-base mb-1.5">{card.title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-4">{card.desc}</p>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {card.tags.map((tag) => (
            <span key={tag} className="text-[10px] bg-white/80 text-gray-500 border border-gray-200 px-2.5 py-0.5 rounded-full font-medium">
              {tag}
            </span>
          ))}
        </div>
        <div className="space-y-2">
          {card.comingSoonFeatures.map((f) => (
            <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
              <Rocket size={11} className="text-gray-400 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white/40 border-t border-white/60 px-5 py-3 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-xs text-gray-500 font-medium">Feature coming soon on PlaceNext!</span>
      </div>
    </div>
  );
}

// ── Live card ─────────────────────────────────────────────────────────────────
function LiveCard({ card }) {
  const Icon = card.icon;
  return (
    <div className={`bg-gradient-to-br ${card.bg} border ${card.border} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden`}>
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${card.badgeColor}`}>
            {card.badge}
          </span>
        </div>
        <h3 className="font-bold text-gray-800 text-base mb-1.5">{card.title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-4">{card.desc}</p>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {card.tags.map((tag) => (
            <span key={tag} className="text-[10px] bg-white/80 text-gray-600 border border-gray-200 px-2.5 py-0.5 rounded-full font-medium">
              {tag}
            </span>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {card.sections.map((section, si) => (
            <div key={si}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                {section.heading}
              </p>
              <div className="space-y-2">
                {section.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-all group/link border
                      ${link.highlight
                        ? "bg-indigo-600 border-indigo-500 hover:bg-indigo-700"
                        : "bg-white/90 hover:bg-white border-gray-200"}`}
                  >
                    <div>
                      <p className={`text-xs font-semibold transition-colors
                        ${link.highlight
                          ? "text-white"
                          : "text-gray-800 group-hover/link:text-indigo-600"}`}>
                        {link.label}
                        {link.highlight && (
                          <span className="ml-2 text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-full">
                            College
                          </span>
                        )}
                      </p>
                      <p className={`text-[10px] ${link.highlight ? "text-indigo-200" : "text-gray-400"}`}>
                        {link.desc}
                      </p>
                    </div>
                    <ExternalLink
                      size={12}
                      className={`flex-shrink-0 ml-2 transition-colors
                        ${link.highlight
                          ? "text-white/60 group-hover/link:text-white"
                          : "text-gray-400 group-hover/link:text-indigo-500"}`}
                    />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PreparePage() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const hasResume       = !!user?.resume;
  const profileComplete = !!(user?.prn && user?.dob && user?.address && user?.photo);

  return (
    <DashboardLayout>
      <div className="bg-gray-50 min-h-screen">

        {/* ── SIMPLE WHITE HEADER ───────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 px-6 py-5">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm mb-4 transition"
            >
              <ArrowLeft size={15} /> Back to Dashboard
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Prepare</h1>
                <p className="text-xs text-gray-400">Your placement preparation hub</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

          


          {/* ── CHECKLIST ────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={15} className="text-amber-500" />
              <h3 className="font-semibold text-gray-800 text-sm">Placement Season Checklist</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Resume Uploaded",  done: hasResume       },
                { label: "Profile Complete", done: profileComplete  },
                { label: "Practice DSA",     done: false            },
                { label: "Mock Interview",   done: false            },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium
                    ${item.done
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-gray-50 border-gray-200 text-gray-500"}`}
                >
                  {item.done
                    ? <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                    : <Clock        size={14} className="text-gray-400  flex-shrink-0" />}
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* ── LIVE CARDS ───────────────────────────────────────────────────── */}
          <div>
            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
              Live Now
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {PREPARE_CARDS.filter((c) => !c.comingSoon).map((card) => (
                <LiveCard key={card.id} card={card} />
              ))}
            </div>
          </div>

          {/* ── COMING SOON CARDS ────────────────────────────────────────────── */}
          <div>
            <h2 className="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
              <Lock size={14} className="text-gray-400" /> Coming Soon on PlaceNext
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              These features are being built exclusively for your college — no external websites needed.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PREPARE_CARDS.filter((c) => c.comingSoon).map((card) => (
                <ComingSoonCard key={card.id} card={card} />
              ))}
            </div>
          </div>

          {/* ── BOTTOM BANNER ────────────────────────────────────────────────── */}
          <div className="bg-gray-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5 shadow-lg">
            <div className="text-4xl">🎯</div>
            <div className="text-center sm:text-left">
              <p className="text-white font-bold text-lg">Your placement journey starts today.</p>
              <p className="text-gray-400 text-sm mt-1">
                Consistent daily practice beats last-minute cramming every single time.
              </p>
            </div>
            <button
              onClick={() => navigate("/jobs")}
              className="sm:ml-auto flex-shrink-0 bg-white text-gray-800 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition flex items-center gap-2"
            >
              Browse Active Drives <ChevronRight size={14} />
            </button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}