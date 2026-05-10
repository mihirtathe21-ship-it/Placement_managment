import { useState, useEffect } from "react";
import {
  Brain, Code2, BookOpen, FileSearch, PenTool, Trophy,
  Briefcase, FileText, Star, ArrowRight,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import api from "../../api";
import toast from "react-hot-toast";

const BASE_URL = "http://localhost:5000";

const getFileUrl = (file) => {
  if (!file) return "";
  if (file.startsWith("http")) return file;
  return `${BASE_URL}${file}`;
};

const formatDob = (dob) => {
  if (!dob) return "";
  return new Date(dob).toLocaleDateString("en-IN");
};

const PREPARE_FEATURES = [
  { icon: Brain,      label: "Aptitude Practice" },
  { icon: Code2,      label: "Coding Practice"   },
  { icon: BookOpen,   label: "Tech Courses"       },
  { icon: FileSearch, label: "ATS Resume Score"   },
  { icon: PenTool,    label: "Resume Builder"     },
  { icon: Trophy,     label: "Interview Prep"     },
];

// Profile completion checker
const getCompletion = (user) => {
  const fields = [
    { key: "name",    label: "Name"    },
    { key: "email",   label: "Email"   },
    { key: "prn",     label: "PRN"     },
    { key: "dob",     label: "DOB"     },
    { key: "address", label: "Address" },
    { key: "photo",   label: "Photo"   },
    { key: "resume",  label: "Resume"  },
  ];
  const done = fields.filter((f) => !!user?.[f.key]);
  return {
    percent: Math.round((done.length / fields.length) * 100),
    missing: fields.filter((f) => !user?.[f.key]).map((f) => f.label),
  };
};

export default function StudentDashboard() {
  const { user, updateUser } = useAuth();

  const [jobs, setJobs]       = useState([]);
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  const [profile, setProfile] = useState({
    prn: "", dob: "", address: "", photo: null, resume: null,
  });
  const [preview, setPreview] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/jobs", { params: { status: "active", limit: 5 } }),
      api.get("/applications/my"),
    ])
      .then(([j, a]) => {
        setJobs(j.data.jobs || []);
        setApps(a.data.applications || []);
      })
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      setProfile({ prn: user.prn || "", dob: user.dob || "", address: user.address || "", photo: null, resume: null });
      setPreview(getFileUrl(user.photo));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handleFile = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;
    if (name === "photo") {
      if (file.size > 2 * 1024 * 1024) return toast.error("Photo must be under 2MB");
      setPreview(URL.createObjectURL(file));
    }
    if (name === "resume" && file.type !== "application/pdf")
      return toast.error("Only PDF resume allowed");
    setProfile((p) => ({ ...p, [name]: file }));
  };

  const handleSave = async () => {
    try {
      const fd = new FormData();
      fd.append("prn", profile.prn);
      fd.append("dob", profile.dob);
      fd.append("address", profile.address);
      if (profile.photo)  fd.append("photo",  profile.photo);
      if (profile.resume) fd.append("resume", profile.resume);

      const res = await api.put("/users/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser(res.data.user);
      toast.success("Profile updated successfully");
      setShowEdit(false);
      setProfile((p) => ({ ...p, photo: null, resume: null }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const counts = apps.reduce((a, x) => {
    a[x.status] = (a[x.status] || 0) + 1;
    return a;
  }, {});

  const { percent, missing } = getCompletion(user);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

        {/* HEADER */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {preview ? (
              <img src={preview} alt="profile" className="w-16 h-16 rounded-full object-cover border-2 border-[#FDE29A]" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#FDE29A] text-gray-900 flex items-center justify-center text-xl font-semibold">
                {user?.name?.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h2>
              <p className="text-gray-500 text-sm mt-0.5">{user?.branch} • {user?.passingYear}</p>
            </div>
          </div>
          <button
            onClick={() => setShowEdit(!showEdit)}
            className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showEdit ? "Close" : "Edit Profile"}
          </button>
        </div>

        {/* PROFILE COMPLETION BAR */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-900">Profile Completion</p>
            <span className={`text-sm font-bold ${percent === 100 ? "text-green-600" : "text-blue-600"}`}>
              {percent}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${percent === 100 ? "bg-green-500" : "bg-blue-600"}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          {missing.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              Complete your profile — missing:&nbsp;
              <span className="text-blue-600 font-medium">{missing.join(", ")}</span>
            </p>
          )}
          {percent === 100 && (
            <p className="text-xs text-green-600 font-medium mt-2">✓ Your profile is 100% complete!</p>
          )}
        </div>


        {/* EDIT PROFILE */}
        {showEdit && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <input type="text" name="prn" value={profile.prn} onChange={handleChange} placeholder="PRN Number"
              className="border border-gray-300 p-3 w-full rounded-lg text-gray-900 focus:outline-none focus:border-blue-400" />
            <input type="date" name="dob" value={profile.dob} onChange={handleChange}
              className="border border-gray-300 p-3 w-full rounded-lg text-gray-900 focus:outline-none focus:border-blue-400" />
            <textarea name="address" value={profile.address} onChange={handleChange} placeholder="Address"
              className="border border-gray-300 p-3 w-full rounded-lg text-gray-900 focus:outline-none focus:border-blue-400" />
            <div>
              <label className="font-semibold text-gray-900 block mb-1">Upload Photo</label>
              <input type="file" name="photo" accept="image/*" onChange={handleFile} />
            </div>
            <div>
              <label className="font-semibold text-gray-900 block mb-1">Upload Resume (PDF)</label>
              <input type="file" name="resume" accept="application/pdf" onChange={handleFile} />
            </div>
            <button onClick={handleSave}
              className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Save Profile
            </button>
          </div>
        )}

        {/* PROFILE CARD */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 grid md:grid-cols-2 gap-5">
          <div className="space-y-3">
            <p className="text-gray-900"><span className="font-semibold">Email:</span> {user?.email}</p>
            <p className="text-gray-900"><span className="font-semibold">PRN:</span> {user?.prn}</p>
            <p className="text-gray-900"><span className="font-semibold">DOB:</span> {formatDob(user?.dob)}</p>
            <p className="text-gray-900"><span className="font-semibold">Address:</span> {user?.address}</p>
          </div>
          <div>
            {user?.resume && (
              <a href={getFileUrl(user.resume)} target="_blank" rel="noreferrer"
                className="inline-block bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                View Resume
              </a>
            )}
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#FDE29A] p-5 rounded-xl">
            <h3 className="text-sm text-yellow-900 font-medium">Total Applications</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{apps.length}</p>
          </div>
          <div className="bg-white border border-gray-200 p-5 rounded-xl">
            <h3 className="text-sm text-gray-500 font-medium">Shortlisted</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{counts.shortlisted || 0}</p>
          </div>
          <div className="bg-blue-600 p-5 rounded-xl">
            <h3 className="text-sm text-blue-100 font-medium">Selected</h3>
            <p className="text-2xl font-bold text-white mt-1">{counts.selected || 0}</p>
          </div>
          <div className="bg-white border border-gray-200 p-5 rounded-xl">
            <h3 className="text-sm text-gray-500 font-medium">Active Jobs</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{jobs.length}</p>
          </div>
        </div>

        

      </div>
    </DashboardLayout>
  );
}