import { useState, useEffect } from "react";
import {
  Briefcase,
  FileText,
  CheckCircle2,
  AlertCircle,
  User,
  MapPin,
  Calendar,
  Hash,
  Download,
} from "lucide-react";
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

export default function StudentDashboard() {
  const { user, updateUser } = useAuth();

  const [jobs, setJobs]         = useState([]);
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  const [profile, setProfile] = useState({
    prn:     user?.prn     || "",
    dob:     user?.dob     || "",
    address: user?.address || "",
    resume:  null,
    photo:   null,
  });

  const [preview, setPreview] = useState(getPhotoUrl(user?.photo));

  // Sync form + preview whenever user changes (after save)
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
      .then(([j, a]) => {
        setJobs(j.data.jobs);
        setApps(a.data.applications);
      })
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const counts = apps.reduce((a, x) => {
    a[x.status] = (a[x.status] || 0) + 1;
    return a;
  }, {});

  const cgpaColor =
    !user?.cgpa
      ? "text-gray-400"
      : user.cgpa >= 8
      ? "text-green-600"
      : user.cgpa >= 6
      ? "text-yellow-600"
      : "text-red-600";

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

  // Format DOB for display
  const formatDob = (dob) => {
    if (!dob) return null;
    return new Date(dob).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <div className="bg-gray-100 min-h-screen p-6">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* ── HEADER ─────────────────────────────────────────────────────── */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200 flex-shrink-0 bg-blue-100">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" alt="Profile"
                    onError={(e) => { e.target.style.display = "none"; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold text-lg">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Welcome back, <span className="text-blue-600">{user?.name?.split(" ")[0]}</span> 👋
                </h1>
                <p className="text-gray-500 text-sm">
                  {user?.branch} • {user?.passingYear} • Roll: {user?.rollNumber}
                </p>
              </div>

              <button
                onClick={() => setShowEdit(!showEdit)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                {showEdit ? "Close" : "Edit Profile"}
              </button>
            </div>

            <div className="bg-white border rounded-xl px-6 py-3 text-center shadow-sm">
              <p className={`text-xl font-bold ${cgpaColor}`}>{user?.cgpa ?? "-"}</p>
              <p className="text-xs text-gray-500">CGPA</p>
            </div>
          </div>

          {/* ── EDIT PROFILE PANEL ─────────────────────────────────────────── */}
          {showEdit && (
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <User size={18} /> Edit Profile
              </h2>

              <div className="mb-6">
                <div className="flex justify-between text-xs mb-1 text-gray-500">
                  <span>Profile Completion</span>
                  <span>{getProfileCompletion()}%</span>
                </div>
                <div className="bg-gray-200 h-2 rounded-full">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProfileCompletion()}%` }}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* LEFT */}
                <div className="space-y-5">
                  <div>
                    <label className="text-sm text-gray-600">PRN</label>
                    <input name="prn" value={profile.prn} onChange={handleChange}
                      placeholder="Enter 9-digit PRN"
                      className="w-full border rounded-lg p-3 mt-1" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Date of Birth</label>
                    <input type="date" name="dob" value={profile.dob} onChange={handleChange}
                      className="w-full border rounded-lg p-3 mt-1" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Address</label>
                    <textarea name="address" value={profile.address} onChange={handleChange}
                      rows={3} className="w-full border rounded-lg p-3 mt-1 resize-none" />
                  </div>

                  {/* Resume */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Resume (PDF)</label>
                    <label className="flex justify-between items-center border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                      <span className="text-sm text-gray-500 truncate max-w-[180px]">
                        {profile.resume ? profile.resume.name : "Upload Resume"}
                      </span>
                      <span className="text-blue-600 text-sm font-medium">Browse</span>
                      <input type="file" name="resume" accept="application/pdf"
                        onChange={handleFile} className="hidden" />
                    </label>
                    {!profile.resume && user?.resume && (
                      <a href={`${BASE_URL}${user.resume}`} target="_blank" rel="noreferrer"
                        className="text-blue-600 text-sm mt-2 underline block">
                        View Current Resume
                      </a>
                    )}
                    {profile.resume && (
                      <button onClick={() => window.open(URL.createObjectURL(profile.resume))}
                        className="text-blue-600 text-sm mt-2 underline">
                        Preview Selected Resume
                      </button>
                    )}
                  </div>
                </div>

                {/* RIGHT — photo */}
                <div className="flex flex-col items-center gap-5">
                  <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-blue-100 shadow bg-gray-100">
                    {preview ? (
                      <img src={preview} className="w-full h-full object-cover" alt="Profile"
                        onError={(e) => { e.target.style.display = "none"; }} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        No Photo
                      </div>
                    )}
                  </div>
                  <label className="text-blue-600 cursor-pointer text-sm font-medium hover:underline">
                    Upload Photo
                    <input type="file" name="photo" accept="image/*"
                      onChange={handleFile} className="hidden" />
                  </label>
                  <button onClick={handleSave}
                    className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Save Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── PROFILE INFO CARD (shows saved data) ───────────────────────── */}
          {(user?.prn || user?.dob || user?.address || user?.resume || user?.photo) && (
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <User size={18} /> My Profile
              </h2>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Photo */}
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-100 shadow bg-gray-100">
                    {preview ? (
                      <img src={preview} className="w-full h-full object-cover" alt="Profile"
                        onError={(e) => { e.target.style.display = "none"; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold text-2xl bg-blue-50">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">
                    {user?.role}
                  </span>
                </div>

                {/* Info grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {user?.prn && (
                    <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                      <Hash size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">PRN</p>
                        <p className="text-sm font-medium text-gray-800">{user.prn}</p>
                      </div>
                    </div>
                  )}

                  {user?.dob && (
                    <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                      <Calendar size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Date of Birth</p>
                        <p className="text-sm font-medium text-gray-800">{formatDob(user.dob)}</p>
                      </div>
                    </div>
                  )}

                  {user?.branch && (
                    <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                      <Briefcase size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Branch</p>
                        <p className="text-sm font-medium text-gray-800">{user.branch}</p>
                      </div>
                    </div>
                  )}

                  {user?.email && (
                    <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                      <FileText size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Email</p>
                        <p className="text-sm font-medium text-gray-800 break-all">{user.email}</p>
                      </div>
                    </div>
                  )}

                  {user?.address && (
                    <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3 sm:col-span-2">
                      <MapPin size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Address</p>
                        <p className="text-sm font-medium text-gray-800">{user.address}</p>
                      </div>
                    </div>
                  )}

                  {user?.resume && (
                    <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3 sm:col-span-2">
                      <Download size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Resume</p>
                        <a
                          href={`${BASE_URL}${user.resume}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-blue-600 underline hover:text-blue-800"
                        >
                          View / Download Resume
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── STATS ──────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Applied",       val: apps.length,             icon: FileText,     color: "blue"   },
              { label: "Shortlisted",   val: counts.shortlisted || 0, icon: AlertCircle,  color: "yellow" },
              { label: "Selected",      val: counts.selected    || 0, icon: CheckCircle2, color: "green"  },
              { label: "Active Drives", val: jobs.length,             icon: Briefcase,    color: "blue"   },
            ].map((s) => (
              <div key={s.label} className="bg-white border rounded-xl p-5 shadow-sm">
                <div className={`w-10 h-10 bg-${s.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                  <s.icon className={`w-5 h-5 text-${s.color}-600`} />
                </div>
                <p className="text-xl font-bold">{loading ? "-" : s.val}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}