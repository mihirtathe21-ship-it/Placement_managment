import { useState, useEffect } from "react";
import {
  Briefcase, FileText, CheckCircle2, AlertCircle, User,
  MapPin, Calendar, Hash, Download, Sparkles,
  Brain, Code2, BookOpen, FileSearch, PenTool, Trophy,
  ChevronRight, TrendingUp, Award, Clock, GraduationCap,
  Mail, Phone, Linkedin, Github, Globe, Star, Bell,
  Layers, Target, Zap, Shield, Activity, BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import api from "../../api";
import toast from "react-hot-toast";

const BASE_URL = "http://localhost:5000";

const getPhotoUrl = (photo) => {
  if (!photo) return "";
  if (photo.startsWith("http")) return photo;
  return `${BASE_URL}${photo}`;
};

const formatDob = (dob) => {
  if (!dob) return null;
  return new Date(dob).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

// Mini prepare feature list shown as teaser on dashboard
const PREPARE_FEATURES = [
  { icon: Brain,      label: "Aptitude Practice", color: "from-blue-500 to-blue-600", bg: "bg-blue-50", desc: "100+ tests" },
  { icon: Code2,      label: "Coding Practice",   color: "from-violet-500 to-violet-600", bg: "bg-violet-50", desc: "200+ problems" },
  { icon: BookOpen,   label: "Tech Courses",      color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50", desc: "30+ courses" },
  { icon: FileSearch, label: "ATS Resume Score",  color: "from-orange-500 to-orange-600", bg: "bg-orange-50", desc: "AI powered" },
  { icon: PenTool,    label: "Resume Builder",    color: "from-rose-500 to-rose-600", bg: "bg-rose-50", desc: "Professional" },
  { icon: Trophy,     label: "Interview Prep",    color: "from-amber-500 to-amber-600", bg: "bg-amber-50", desc: "Mock interviews" },
];

export default function StudentDashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs]       = useState([]);
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);

  const [profile, setProfile] = useState({
    prn:     user?.prn     || "",
    dob:     user?.dob     || "",
    address: user?.address || "",
    resume:  null,
    photo:   null,
  });

  const [preview, setPreview] = useState(getPhotoUrl(user?.photo));

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        prn:     user.prn     || "",
        dob:     user.dob     || "",
        address: user.address || "",
      }));
      setPreview(getPhotoUrl(user.photo));
    }
  }, [user]);

  useEffect(() => {
    Promise.all([
      api.get("/jobs", { params: { status: "active", limit: 5 } }),
      api.get("/applications/my"),
    ])
      .then(([j, a]) => { setJobs(j.data.jobs); setApps(a.data.applications); })
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => {
        setLoading(false);
        setTimeout(() => setAnimateStats(true), 100);
      });
  }, []);

  const counts = apps.reduce((a, x) => {
    a[x.status] = (a[x.status] || 0) + 1;
    return a;
  }, {});

  const cgpaColor = !user?.cgpa ? "text-gray-400"
    : user.cgpa >= 8 ? "text-green-600"
    : user.cgpa >= 6 ? "text-yellow-600"
    : "text-red-600";

  const getCgpaGrade = (cgpa) => {
    if (!cgpa) return "N/A";
    if (cgpa >= 8.5) return "Excellent";
    if (cgpa >= 7.5) return "Very Good";
    if (cgpa >= 6.5) return "Good";
    if (cgpa >= 5.5) return "Average";
    return "Needs Improvement";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "prn") {
      const val = value.replace(/\D/g, "");
      if (val.length <= 9) setProfile((prev) => ({ ...prev, prn: val }));
      return;
    }
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;
    if (name === "photo") {
      if (file.size > 2 * 1024 * 1024) return toast.error("Image must be < 2MB");
      setPreview(URL.createObjectURL(file));
    }
    setProfile((prev) => ({ ...prev, [name]: file }));
  };

  const handleSave = async () => {
    if (!/^[0-9]{9}$/.test(profile.prn)) return toast.error("PRN must be exactly 9 digits");
    if (!profile.dob) return toast.error("Please enter your date of birth");
    const age = new Date().getFullYear() - new Date(profile.dob).getFullYear();
    if (age < 16) return toast.error("Minimum age is 16");
    try {
      const formData = new FormData();
      if (profile.prn)     formData.append("prn",     profile.prn);
      if (profile.dob)     formData.append("dob",     profile.dob);
      if (profile.address) formData.append("address", profile.address);
      if (profile.photo)   formData.append("photo",   profile.photo);
      if (profile.resume)  formData.append("resume",  profile.resume);
      const res = await api.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.user) updateUser(res.data.user);
      toast.success("Profile updated successfully");
      setShowEdit(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  const getProfileCompletion = () => {
    const fields = ["prn", "dob", "address"];
    let filled = fields.filter((f) => profile[f]).length;
    if (preview) filled++;
    return Math.round((filled / 4) * 100);
  };

  const stats = [
    { label: "Total Applications", val: apps.length, icon: FileText, color: "blue", trend: "+12%", bgGradient: "from-blue-500 to-blue-600" },
    { label: "Shortlisted", val: counts.shortlisted || 0, icon: AlertCircle, color: "orange", trend: "+5%", bgGradient: "from-orange-500 to-orange-600" },
    { label: "Selected", val: counts.selected || 0, icon: CheckCircle2, color: "green", trend: "+8%", bgGradient: "from-green-500 to-green-600" },
    { label: "Active Drives", val: jobs.length, icon: Briefcase, color: "purple", trend: "+3", bgGradient: "from-purple-500 to-purple-600" },
  ];

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 min-h-screen">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto p-6 space-y-8">
          {/* Welcome Header with Animation */}
          <div className="animate-fadeInDown">
            <div className="backdrop-blur-lg bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-md opacity-60"></div>
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-blue-400 to-purple-500">
                      {preview ? (
                        <img src={preview} className="w-full h-full object-cover" alt="Profile"
                          onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user?.name?.split(" ")[0]}</span>
                    </h1>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <p className="text-gray-600 flex items-center gap-1">
                        <GraduationCap size={14} /> {user?.branch} • {user?.passingYear}
                      </p>
                      <span className="text-gray-300">|</span>
                      <p className="text-gray-600">Roll: {user?.rollNumber}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowEdit(!showEdit)}
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <User size={16} />
                      {showEdit ? "Close" : "Edit Profile"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  </button>
                </div>
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <div className="relative bg-white rounded-xl px-6 py-3 text-center shadow-lg border border-gray-100">
                    <p className={`text-2xl font-bold ${cgpaColor} transition-all duration-300 group-hover:scale-110`}>
                      {user?.cgpa ?? "-"}
                    </p>
                    <p className="text-xs text-gray-500">CGPA</p>
                    <p className="text-xs text-gray-400 mt-1">{getCgpaGrade(user?.cgpa)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Modal Overlay */}
          {showEdit && (
            <div className="animate-fadeInUp">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <h2 className="font-semibold text-white text-lg flex items-center gap-2">
                    <User size={20} /> Edit Profile
                  </h2>
                </div>
                <div className="p-6">
                  {/* Profile Completion Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700 font-medium">Profile Completion</span>
                      <span className="text-blue-600 font-bold">{getProfileCompletion()}%</span>
                    </div>
                    <div className="relative bg-gray-200 h-3 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${getProfileCompletion()}%` }}
                      />
                      <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-5">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">PRN Number</label>
                        <input 
                          name="prn" 
                          value={profile.prn} 
                          onChange={handleChange}
                          placeholder="Enter 9-digit PRN" 
                          className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Date of Birth</label>
                        <input 
                          type="date" 
                          name="dob" 
                          value={profile.dob} 
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Address</label>
                        <textarea 
                          name="address" 
                          value={profile.address} 
                          onChange={handleChange}
                          rows={3} 
                          className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                          placeholder="Your complete address"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Resume (PDF)</label>
                        <label className="flex justify-between items-center border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
                          <span className="text-sm text-gray-600 truncate max-w-[200px] group-hover:text-blue-600">
                            {profile.resume ? profile.resume.name : "📄 Upload Resume"}
                          </span>
                          <span className="text-blue-600 text-sm font-medium px-3 py-1 bg-blue-50 rounded-lg">Browse</span>
                          <input type="file" name="resume" accept="application/pdf"
                            onChange={handleFile} className="hidden" />
                        </label>
                        {!profile.resume && user?.resume && (
                          <a href={`${BASE_URL}${user.resume}`} target="_blank" rel="noreferrer"
                            className="text-blue-600 text-sm mt-2 inline-flex items-center gap-1 hover:underline">
                            <Download size={14} /> View Current Resume
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-5">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                        <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-gray-100 to-gray-200">
                          {preview ? (
                            <img src={preview} className="w-full h-full object-cover" alt="Profile"
                              onError={(e) => { e.target.style.display = "none"; }} />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              <User size={40} />
                            </div>
                          )}
                        </div>
                      </div>
                      <label className="text-blue-600 cursor-pointer text-sm font-semibold hover:text-blue-700 transition-colors inline-flex items-center gap-2">
                        <Camera size={16} />
                        Upload Photo
                        <input type="file" name="photo" accept="image/*" onChange={handleFile} className="hidden" />
                      </label>
                      <button 
                        onClick={handleSave}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        Save Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Information Card */}
          {(user?.prn || user?.dob || user?.address || user?.resume || user?.photo) && (
            <div className="animate-fadeInUp animation-delay-200">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                  <h2 className="font-semibold text-white text-lg flex items-center gap-2">
                    <User size={20} /> Profile Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-shrink-0 flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 shadow-lg bg-gradient-to-br from-blue-400 to-purple-500">
                          {preview ? (
                            <img src={preview} className="w-full h-full object-cover" alt="Profile"
                              onError={(e) => { e.target.style.display = "none"; }} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-3xl">
                              {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-800">{user?.name}</p>
                        <span className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-3 py-1 rounded-full capitalize font-medium">
                          {user?.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user?.prn && (
                        <div className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 hover:shadow-md transition-all hover:scale-105">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Hash size={18} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">PRN</p>
                              <p className="text-sm font-semibold text-gray-800">{user.prn}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {user?.dob && (
                        <div className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 hover:shadow-md transition-all hover:scale-105">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Calendar size={18} className="text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Date of Birth</p>
                              <p className="text-sm font-semibold text-gray-800">{formatDob(user.dob)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {user?.branch && (
                        <div className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 hover:shadow-md transition-all hover:scale-105">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                              <GraduationCap size={18} className="text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Branch</p>
                              <p className="text-sm font-semibold text-gray-800">{user.branch}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {user?.email && (
                        <div className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 hover:shadow-md transition-all hover:scale-105">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                              <Mail size={18} className="text-amber-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                              <p className="text-sm font-semibold text-gray-800 break-all">{user.email}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {user?.address && (
                        <div className="sm:col-span-2 group bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 hover:shadow-md transition-all">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-rose-100 rounded-lg">
                              <MapPin size={18} className="text-rose-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Address</p>
                              <p className="text-sm font-semibold text-gray-800">{user.address}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {user?.resume && (
                        <div className="sm:col-span-2 group bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 hover:shadow-md transition-all">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                              <FileText size={18} className="text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Resume</p>
                              <a href={`${BASE_URL}${user.resume}`} target="_blank" rel="noreferrer"
                                className="text-sm font-semibold text-blue-600 inline-flex items-center gap-1 hover:gap-2 transition-all">
                                View / Download Resume <Download size={14} />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards with Animation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div 
                key={stat.label} 
                className={`group animate-fadeInUp animation-delay-${idx * 100}`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.bgGradient} opacity-10 rounded-bl-full`}></div>
                  <div className="p-6 relative">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.bgGradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <p className="text-3xl font-bold text-gray-800">
                          {loading ? "-" : animateStats ? stat.val : 0}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                          <TrendingUp size={12} />
                          {stat.trend}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity and Updates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Applications */}
            <div className="animate-fadeInUp animation-delay-300">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <h2 className="font-semibold text-white text-lg flex items-center gap-2">
                    <Activity size={20} /> Recent Activity
                  </h2>
                </div>
                <div className="p-6">
                  {apps.length > 0 ? (
                    <div className="space-y-4">
                      {apps.slice(0, 3).map((app, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                          <div className={`w-2 h-2 rounded-full ${
                            app.status === 'selected' ? 'bg-green-500' :
                            app.status === 'shortlisted' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{app.jobTitle}</p>
                            <p className="text-xs text-gray-500">Applied on {new Date(app.appliedDate).toLocaleDateString()}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            app.status === 'selected' ? 'bg-green-100 text-green-700' :
                            app.status === 'shortlisted' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No applications yet</p>
                      <button className="mt-4 text-blue-600 font-semibold text-sm hover:underline">
                        Browse Jobs →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Prepare Feature Cards */}
            <div className="animate-fadeInUp animation-delay-400">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                  <h2 className="font-semibold text-white text-lg flex items-center gap-2">
                    <Sparkles size={20} /> Get Ready for Placements
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-3">
                    {PREPARE_FEATURES.map((feature) => (
                      <button
                        key={feature.label}
                        className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 text-left hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 ${feature.bg} rounded-lg group-hover:scale-110 transition-transform`}>
                            <feature.icon className={`w-5 h-5 text-${feature.color.split('-')[1]}-600`} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{feature.label}</p>
                            <p className="text-xs text-gray-500">{feature.desc}</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .animation-delay-100 {
          animation-delay: 100ms;
        }
      `}</style>
    </DashboardLayout>
  );
}

// Missing Camera icon import
const Camera = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);