import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import api from "../../api";
import toast from "react-hot-toast";

const STATUS = {
  applied: {
    text: "text-blue-700",
    bg: "bg-blue-100 border-blue-200",
  },
  shortlisted: {
    text: "text-yellow-700",
    bg: "bg-yellow-100 border-yellow-200",
  },
  interview: {
    text: "text-purple-700",
    bg: "bg-purple-100 border-purple-200",
  },
  selected: {
    text: "text-green-700",
    bg: "bg-green-100 border-green-200",
  },
  rejected: {
    text: "text-red-700",
    bg: "bg-red-100 border-red-200",
  },
};

export default function StudentDashboard() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <DashboardLayout>
      <div className="bg-gray-100 min-h-screen p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome back,{" "}
                <span className="text-blue-600">
                  {user?.name?.split(" ")[0]}
                </span>{" "}
                👋
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                {user?.branch} • {user?.passingYear} Batch • Roll:{" "}
                {user?.rollNumber}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl px-6 py-3 shadow-sm text-center">
              <p className={`text-2xl font-bold ${cgpaColor}`}>
                {user?.cgpa ?? "-"}
              </p>
              <p className="text-xs text-gray-500">CGPA</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Applied",
                val: apps.length,
                icon: FileText,
                color: "blue",
              },
              {
                label: "Shortlisted",
                val: counts.shortlisted || 0,
                icon: AlertCircle,
                color: "yellow",
              },
              {
                label: "Selected",
                val: counts.selected || 0,
                icon: CheckCircle2,
                color: "green",
              },
              {
                label: "Active Drives",
                val: jobs.length,
                icon: Briefcase,
                color: "blue",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-${s.color}-100 flex items-center justify-center mb-3`}
                >
                  <s.icon className={`w-5 h-5 text-${s.color}-600`} />
                </div>

                <p className="text-xl font-bold text-gray-800">
                  {loading ? "-" : s.val}
                </p>

                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Active Drives */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-800">
                  Active Drives
                </h2>

                <Link
                  to="/jobs"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  All jobs <ChevronRight size={16} />
                </Link>
              </div>

              {jobs.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  No active drives available
                </p>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <Link
                      key={job._id}
                      to="/jobs"
                      className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition"
                    >
                      <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-semibold">
                        {job.company?.charAt(0)}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {job.title}
                        </p>

                        <p className="text-xs text-gray-500">
                          {job.company} •{" "}
                          {job.package || job.stipend || "TBD"}
                        </p>
                      </div>

                      <ArrowUpRight
                        size={18}
                        className="text-gray-400"
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Applications */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-800">
                  My Applications
                </h2>

                <Link
                  to="/applications"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  View all <ChevronRight size={16} />
                </Link>
              </div>

              {apps.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  No applications yet
                </p>
              ) : (
                <div className="space-y-3">
                  {apps.slice(0, 5).map((app) => {
                    const s = STATUS[app.status];

                    return (
                      <div
                        key={app._id}
                        className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center font-semibold text-gray-700">
                          {app.job?.company?.charAt(0)}
                        </div>

                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {app.job?.title}
                          </p>

                          <p className="text-xs text-gray-500">
                            {app.job?.company}
                          </p>
                        </div>

                        <span
                          className={`text-xs px-3 py-1 rounded-lg border font-medium ${s?.bg} ${s?.text}`}
                        >
                          {app.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Profile */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-800 mb-4">
              Profile Information
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Branch", val: user?.branch || "-" },
                { label: "Passing Year", val: user?.passingYear || "-" },
                { label: "CGPA", val: user?.cgpa ?? "-" },
                { label: "Roll Number", val: user?.rollNumber || "-" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white border border-gray-200 rounded-lg p-3"
                >
                  <p className="text-xs text-gray-500">
                    {item.label}
                  </p>

                  <p className="text-sm font-semibold text-gray-800">
                    {item.val}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}