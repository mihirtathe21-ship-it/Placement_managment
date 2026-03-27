import { useState, useEffect } from "react";
import {
  Briefcase,
  FileText,
  CheckCircle2,
  AlertCircle,
  User,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import api from "../../api";
import toast from "react-hot-toast";

export default function StudentDashboard() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  const [profile, setProfile] = useState({
    prn: user?.prn || "",
    dob: user?.dob || "",
    address: user?.address || "",
    resume: null,
    photo: null,
  });

  const [preview, setPreview] = useState(user?.photo || "");

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

  // INPUT CHANGE (PRN FIXED)
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 🔥 PRN: only numbers, max 9 digits
    if (name === "prn") {
      const val = value.replace(/\D/g, "");
      if (val.length <= 9) {
        setProfile({ ...profile, prn: val });
      }
      return;
    }

    setProfile({ ...profile, [name]: value });
  };

  // FILE UPLOAD
  const handleFile = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (name === "photo") {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error("Image must be < 2MB");
      }
      setPreview(URL.createObjectURL(file));
    }

    setProfile({ ...profile, [name]: file });
  };

  // SAVE PROFILE (PRN VALIDATION FIXED)
  const handleSave = async () => {
    if (!/^[0-9]{9}$/.test(profile.prn)) {
      return toast.error("PRN must be exactly 9 digits");
    }

    const age =
      new Date().getFullYear() - new Date(profile.dob).getFullYear();

    if (age < 16) {
      return toast.error("Minimum age is 16");
    }

    try {
      const formData = new FormData();
      Object.keys(profile).forEach((key) => {
        if (profile[key]) formData.append(key, profile[key]);
      });

      await api.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile updated successfully");
    } catch {
      toast.error("Update failed");
    }
  };

  const getProfileCompletion = () => {
    const fields = ["prn", "dob", "address"];
    let filled = fields.filter((f) => profile[f]).length;
    if (preview) filled++;
    return Math.round((filled / 4) * 100);
  };

  return (
    <DashboardLayout>
      <div className="bg-gray-100 min-h-screen p-6">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Welcome back,{" "}
                  <span className="text-blue-600">
                    {user?.name?.split(" ")[0]}
                  </span>{" "}
                  👋
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
              <p className={`text-xl font-bold ${cgpaColor}`}>
                {user?.cgpa ?? "-"}
              </p>
              <p className="text-xs text-gray-500">CGPA</p>
            </div>
          </div>

          {/* EDIT PROFILE */}
          {showEdit && (
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <User size={18} /> Edit Profile
              </h2>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-xs mb-1 text-gray-500">
                  <span>Profile Completion</span>
                  <span>{getProfileCompletion()}%</span>
                </div>
                <div className="bg-gray-200 h-2 rounded-full">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${getProfileCompletion()}%` }}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">

                {/* LEFT */}
                <div className="space-y-5">

                  <div>
                    <label className="text-sm text-gray-600">PRN</label>
                    <input
                      name="prn"
                      value={profile.prn}
                      onChange={handleChange}
                      placeholder="Enter 9-digit PRN"
                      className="w-full border rounded-lg p-3 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">DOB</label>
                    <input
                      type="date"
                      name="dob"
                      value={profile.dob}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-3 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Address</label>
                    <textarea
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-3 mt-1"
                    />
                  </div>

                  {/* Resume */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">
                      Resume (PDF)
                    </label>

                    <label className="flex justify-between items-center border rounded-lg p-3 cursor-pointer">
                      <span className="text-sm text-gray-500">
                        {profile.resume ? profile.resume.name : "Upload Resume"}
                      </span>
                      <span className="text-blue-600 text-sm">Browse</span>

                      <input
                        type="file"
                        name="resume"
                        accept="application/pdf"
                        onChange={handleFile}
                        className="hidden"
                      />
                    </label>

                    {profile.resume && (
                      <button
                        onClick={() =>
                          window.open(URL.createObjectURL(profile.resume))
                        }
                        className="text-blue-600 text-sm mt-2 underline"
                      >
                        View Resume
                      </button>
                    )}
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col items-center gap-5">

                  <div className="w-32 h-32 rounded-full overflow-hidden border">
                    {preview ? (
                      <img
                        src={preview}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No Photo
                      </div>
                    )}
                  </div>

                  <label className="text-blue-600 cursor-pointer">
                    Upload Photo
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handleFile}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                  >
                    Save Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Applied", val: apps.length, icon: FileText, color: "blue" },
              { label: "Shortlisted", val: counts.shortlisted || 0, icon: AlertCircle, color: "yellow" },
              { label: "Selected", val: counts.selected || 0, icon: CheckCircle2, color: "green" },
              { label: "Active Drives", val: jobs.length, icon: Briefcase, color: "blue" },
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