/**
 * AdminCircularStatus Page
 *
 * Allows Super Admin to view circular acknowledgement status across all users.
 * Shows:
 * - List of all circulars
 * - For selected circular: all users with their acknowledgement status
 * - Summary statistics
 *
 * @module pages/AdminCircularStatus
 */

import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";
import {
  FileText,
  CheckCircle,
  XCircle,
  Users,
  Train,
  UserCog,
  Filter,
  RefreshCw,
  AlertTriangle,
  Building2,
  Loader2
} from "lucide-react";
import Footer from "../components/Footer";

export default function AdminCircularStatus() {
  const [circulars, setCirculars] = useState([]);
  const [selectedCircular, setSelectedCircular] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCirculars, setLoadingCirculars] = useState(true);
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDepot, setFilterDepot] = useState("");

  // Load all circulars
  useEffect(() => {
    const loadCirculars = async () => {
      try {
        setLoadingCirculars(true);
        const res = await api.get("/admin/circulars");
        setCirculars(res.data);
        // Auto-select latest circular
        if (res.data.length > 0) {
          setSelectedCircular(res.data[0]._id);
        }
      } catch (err) {
        Swal.fire("Error", "Failed to load circulars", "error");
      } finally {
        setLoadingCirculars(false);
      }
    };
    loadCirculars();
  }, []);

  // Load acknowledgement report when circular is selected
  useEffect(() => {
    if (!selectedCircular) return;

    const loadReport = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/circulars/acknowledgement-report", {
          params: { circularId: selectedCircular }
        });
        setReport(res.data);
      } catch (err) {
        Swal.fire("Error", "Failed to load acknowledgement report", "error");
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [selectedCircular]);

  // Filter users based on criteria
  const filteredUsers = report?.users?.filter(user => {
    if (filterRole && user.role !== filterRole) return false;
    if (filterStatus === "acknowledged" && !user.acknowledged) return false;
    if (filterStatus === "pending" && user.acknowledged) return false;
    if (filterDepot && user.depotName !== filterDepot) return false;
    return true;
  }) || [];

  // Get unique depots from users
  const uniqueDepots = [...new Set(report?.users?.map(u => u.depotName).filter(Boolean))].sort();

  // Refresh report
  const refreshReport = async () => {
    if (!selectedCircular) return;
    try {
      setLoading(true);
      const res = await api.get("/admin/circulars/acknowledgement-report", {
        params: { circularId: selectedCircular }
      });
      setReport(res.data);
      Swal.fire({
        icon: "success",
        title: "Refreshed",
        timer: 1000,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire("Error", "Failed to refresh", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="text-indigo-600" />
                Circular Acknowledgement Status
              </h2>
              <p className="text-sm text-gray-500">
                Monitor who has read and acknowledged circulars
              </p>
            </div>

            <button
              onClick={refreshReport}
              disabled={loading || !selectedCircular}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* CIRCULAR SELECTOR */}
          <div className="bg-white p-4 rounded-xl shadow">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Circular
            </label>
            {loadingCirculars ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 size={18} className="animate-spin" />
                Loading circulars...
              </div>
            ) : circulars.length === 0 ? (
              <div className="text-amber-600 flex items-center gap-2">
                <AlertTriangle size={18} />
                No circulars found. Upload a circular first.
              </div>
            ) : (
              <select
                value={selectedCircular}
                onChange={(e) => setSelectedCircular(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {circulars.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title} ({new Date(c.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* SUMMARY CARDS */}
         {report && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <SummaryCard
      icon={<Users />}
      label="Total Users"
      value={report.summary.total}
      color="slate"
    />
    <SummaryCard
      icon={<CheckCircle />}
      label="Acknowledged"
      value={report.summary.acknowledged}
      color="emerald"
    />
    <SummaryCard
      icon={<XCircle />}
      label="Pending"
      value={report.summary.pending}
      color="red"
    />
    <SummaryCard
      icon={<FileText />}
      label="Completion"
      value={`${report.summary.percentComplete}%`}
      color="indigo"
    />
  </div>
)}


          {/* FILTERS */}
          {report && report.users.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <Filter size={18} />
                Filters:
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
              >
                <option value="">All Roles</option>
                <option value="DRIVER">Drivers (TWD)</option>
                <option value="DEPOT_MANAGER">SSE/TRD</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
              >
                <option value="">All Status</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="pending">Pending</option>
              </select>

              <select
                value={filterDepot}
                onChange={(e) => setFilterDepot(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
              >
                <option value="">All Depots</option>
                {uniqueDepots.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              {(filterRole || filterStatus || filterDepot) && (
                <button
                  onClick={() => {
                    setFilterRole("");
                    setFilterStatus("");
                    setFilterDepot("");
                  }}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* USERS TABLE */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                <Loader2 size={32} className="animate-spin mb-3" />
                <p>Loading acknowledgement data...</p>
              </div>
            ) : !report || report.users.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <FileText size={48} className="mx-auto mb-3 opacity-50" />
                <p>No users found or no circular selected</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">PF No</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left">Depot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="border-t hover:bg-slate-50">
                        <td className="px-4 py-3">
                          {user.acknowledged ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                              <CheckCircle size={14} />
                              Acknowledged
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                              <XCircle size={14} />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium">{user.name}</td>
                        <td className="px-4 py-3">{user.pfNo}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                            user.role === "DRIVER"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}>
                            {user.role === "DRIVER" ? <Train size={12} /> : <UserCog size={12} />}
                            {user.role === "DRIVER" ? "TWD" : "SSE/TRD"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <Building2 size={14} />
                            {user.depotName || "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    No users match the selected filters
                  </div>
                )}

                {filteredUsers.length > 0 && (
                  <div className="px-4 py-3 bg-slate-50 text-sm text-gray-600 border-t">
                    Showing {filteredUsers.length} of {report.users.length} users
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}

/* ================= COMPONENTS ================= */

function SummaryCard({ icon, label, value, color }) {
  const colorClasses = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    indigo: "bg-indigo-100 text-indigo-700"
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
      <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

