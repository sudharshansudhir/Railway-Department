/**
 * AdminUserDetail Page
 *
 * Displays comprehensive user details for Super Admin.
 * Supports both DRIVER and DEPOT_MANAGER roles with dynamic rendering.
 *
 * Features:
 * - Profile information
 * - Training/LR status (for drivers)
 * - Duty logs summary
 * - T-Card history with date-based navigation
 * - Circular acknowledgement status
 * - Edit user capability
 *
 * @module pages/AdminUserDetail
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EditUserModal from "../components/EditUserModal";
import Swal from "sweetalert2";
import {
  User,
  Train,
  Building2,
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Activity,
  BookOpen,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil
} from "lucide-react";

export default function AdminUserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // T-Card date navigation state
  const [tcardSelectedDate, setTcardSelectedDate] = useState("");
  const [tcardAvailableDates, setTcardAvailableDates] = useState([]);
  const [tcardData, setTcardData] = useState([]);
  const [tcardLoading, setTcardLoading] = useState(false);
  const [tcardTotalCount, setTcardTotalCount] = useState(0);

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  // Load T-Card data when user is loaded (for drivers only)
  useEffect(() => {
    if (user?.role === "DRIVER") {
      loadTCardDates();
    }
  }, [user]);

  // Load T-Card for selected date
  useEffect(() => {
    if (tcardSelectedDate && user?.role === "DRIVER") {
      loadTCardByDate(tcardSelectedDate);
    }
  }, [tcardSelectedDate]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/users/${userId}`);
      setUser(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load user details", "error");
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  // Load available T-Card dates and auto-select the latest
  const loadTCardDates = async () => {
    try {
      setTcardLoading(true);
      const res = await api.get(`/admin/users/${userId}/tcards`);
      const { tcards, availableDates, totalCount } = res.data;

      setTcardAvailableDates(availableDates || []);
      setTcardTotalCount(totalCount || 0);

      // Auto-select the latest date if available
      if (availableDates && availableDates.length > 0) {
        setTcardSelectedDate(availableDates[0]);
        setTcardData(tcards || []);
      }
    } catch (err) {
      console.error("Failed to load T-Card dates:", err);
    } finally {
      setTcardLoading(false);
    }
  };

  // Load T-Card for a specific date
  const loadTCardByDate = async (date) => {
    try {
      setTcardLoading(true);
      const res = await api.get(`/admin/users/${userId}/tcards`, {
        params: { date }
      });
      setTcardData(res.data.tcards || []);
    } catch (err) {
      console.error("Failed to load T-Card for date:", err);
      Swal.fire("Error", "Failed to load T-Card for selected date", "error");
    } finally {
      setTcardLoading(false);
    }
  };

  // Navigate to previous date
  const goToPreviousDate = () => {
    const currentIndex = tcardAvailableDates.indexOf(tcardSelectedDate);
    if (currentIndex < tcardAvailableDates.length - 1) {
      setTcardSelectedDate(tcardAvailableDates[currentIndex + 1]);
    }
  };

  // Navigate to next date
  const goToNextDate = () => {
    const currentIndex = tcardAvailableDates.indexOf(tcardSelectedDate);
    if (currentIndex > 0) {
      setTcardSelectedDate(tcardAvailableDates[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading user details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
          <p className="text-gray-600">User not found</p>
        </div>
      </>
    );
  }

  const isDriver = user.role === "DRIVER";
  const isManager = user.role === "DEPOT_MANAGER";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-100 px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header with Back and Edit buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-medium"
            >
              <Pencil size={18} />
              Edit User
            </button>
          </div>

          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="p-4 bg-indigo-100 rounded-full">
                {isDriver ? (
                  <Train className="text-indigo-600" size={32} />
                ) : (
                  <User className="text-indigo-600" size={32} />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Badge color="indigo">{user.role.replace("_", " ")}</Badge>
                  <span className="text-gray-500 text-sm flex items-center gap-1">
                    <Building2 size={14} />
                    {user.depotName}
                  </span>
                  <span className="text-gray-500 text-sm">PF: {user.pfNo}</span>
                </div>
              </div>

              {/* Circular Status */}
              <div className={`px-4 py-2 rounded-lg ${
                user.circularStatus?.acknowledged
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}>
                <div className="flex items-center gap-2">
                  {user.circularStatus?.acknowledged ? (
                    <>
                      <CheckCircle size={18} />
                      <span className="text-sm font-medium">Circular Acknowledged</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={18} />
                      <span className="text-sm font-medium">Pending Acknowledgement</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats (for Drivers) */}
          {isDriver && user.summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                icon={<Activity />}
                label="Total Duty Logs"
                value={user.summary.totalDutyLogs}
              />
              <StatCard
                icon={<MapPin />}
                label="Total KM"
                value={user.summary.totalKm?.toLocaleString() || 0}
              />
              <StatCard
                icon={<Clock />}
                label="Total Hours"
                value={user.summary.totalHours?.toFixed(1) || 0}
              />
              <StatCard
                icon={<ClipboardCheck />}
                label="T-Cards"
                value={user.summary.totalTCards}
              />
            </div>
          )}

          {/* Summary Stats (for Managers) */}
          {isManager && user.summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                icon={<Train />}
                label="Drivers in Depot"
                value={user.summary.driversInDepot}
              />
              <StatCard
                icon={<Building2 />}
                label="Depot"
                value={user.depotName}
                isText
              />
            </div>
          )}

          {/* Driver Profile Details */}
          {isDriver && user.profile && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen size={20} />
                Profile Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoItem label="HRMS ID" value={user.profile.hrmsId} />
                <InfoItem label="Designation" value={user.profile.designation} />
                <InfoItem label="Basic Pay" value={`₹${user.profile.basicPay?.toLocaleString() || "-"}`} />
                <InfoItem
                  label="Date of Appointment"
                  value={user.profile.dateOfAppointment
                    ? new Date(user.profile.dateOfAppointment).toLocaleDateString()
                    : "-"}
                />
                <InfoItem
                  label="Entry as TWD"
                  value={user.profile.dateOfEntryAsTWD
                    ? new Date(user.profile.dateOfEntryAsTWD).toLocaleDateString()
                    : "-"}
                />
              </div>
            </div>
          )}

          {/* Training Status */}
          {isDriver && user.profile?.trainings && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileCheck size={20} />
                Training Status
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(user.profile.trainings).map(([key, training]) => (
                  <TrainingCard key={key} name={key} training={training} />
                ))}
              </div>
            </div>
          )}

          {/* LR Details */}
          {isDriver && user.profile?.lrDetails?.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={20} />
                LR Details ({user.profile.lrDetails.length} sections)
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Section</th>
                      <th className="px-4 py-2 text-left">Done Date</th>
                      <th className="px-4 py-2 text-left">Due Date</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.profile.lrDetails.map((lr, idx) => {
                      const isOverdue = new Date(lr.dueDate) < new Date();
                      return (
                        <tr key={idx} className="border-t">
                          <td className="px-4 py-2 font-medium">{lr.section}</td>
                          <td className="px-4 py-2">
                            {lr.doneDate ? new Date(lr.doneDate).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-4 py-2">
                            {lr.dueDate ? new Date(lr.dueDate).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-4 py-2">
                            {isOverdue ? (
                              <span className="inline-flex items-center gap-1 text-red-600">
                                <XCircle size={14} /> Overdue
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-600">
                                <CheckCircle size={14} /> Valid
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Duty Logs */}
          {isDriver && user.logs?.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Activity size={20} />
                Daily Duty Logs ({user.logs.length} records)
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Sign ON</th>
                      <th className="px-4 py-2 text-left">Sign OFF</th>
                      <th className="px-4 py-2 text-center">KM</th>
                      <th className="px-4 py-2 text-center">Breath Analyser</th>
                      <th className="px-4 py-2 text-center">Hours</th>
                      <th className="px-4 py-2 text-center">Mileage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.logs.map((log, idx) => (
                      <tr key={idx} className="border-t hover:bg-slate-50">
                        <td className="px-4 py-2">
                          {new Date(log.logDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">
                          <div className="font-medium">{log.fromStation || "-"}</div>
                          {log.signInTime && (
                            <span className="text-xs text-gray-500">
                              {new Date(log.signInTime).toLocaleTimeString()}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <div className="font-medium">{log.toStation || "-"}</div>
                          {log.signOutTime && (
                            <span className="text-xs text-gray-500">
                              {new Date(log.signOutTime).toLocaleTimeString()}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">{log.km || "-"}</td>
                        <td className="px-4 py-2 text-center">
                          {log.breathAnalyserDone ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600">
                              <CheckCircle size={14} /> Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-600">
                              <AlertTriangle size={14} /> No
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">{log.hours?.toFixed(1) || "-"}</td>
                        <td className="px-4 py-2 text-center font-semibold text-indigo-600">
                          {log.mileage || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* T-Card Safety Checklists with Date Navigation */}
          {isDriver && (
            <div className="bg-white rounded-xl shadow-md p-6">
              {/* Header with Date Navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <ClipboardCheck size={20} />
                  Tower Car Daily Checklists
                  {tcardTotalCount > 0 && (
                    <span className="text-sm font-normal text-gray-500">
                      ({tcardTotalCount} total records)
                    </span>
                  )}
                </h2>

                {/* Date Navigation Controls */}
                {tcardAvailableDates.length > 0 && (
                  <div className="flex items-center gap-2">
                    {/* Previous Date Button */}
                    <button
                      onClick={goToPreviousDate}
                      disabled={tcardAvailableDates.indexOf(tcardSelectedDate) >= tcardAvailableDates.length - 1 || tcardLoading}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      title="Previous Date"
                    >
                      <ChevronLeft size={18} className="text-gray-600" />
                    </button>

                    {/* Date Picker */}
                    <div className="relative">
                      <CalendarDays size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                      <input
                        type="date"
                        value={tcardSelectedDate}
                        onChange={(e) => setTcardSelectedDate(e.target.value)}
                        className="pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none min-w-[160px]"
                      />
                    </div>

                    {/* Next Date Button */}
                    <button
                      onClick={goToNextDate}
                      disabled={tcardAvailableDates.indexOf(tcardSelectedDate) <= 0 || tcardLoading}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      title="Next Date"
                    >
                      <ChevronRight size={18} className="text-gray-600" />
                    </button>
                  </div>
                )}
              </div>

              {/* Loading State */}
              {tcardLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-indigo-600" />
                  <span className="ml-3 text-gray-500">Loading checklist...</span>
                </div>
              )}

              {/* T-Card Content */}
              {!tcardLoading && tcardData.length > 0 && (
                <div className="space-y-4">
                  {tcardData.map((card) => (
                    <div key={card._id} className="border rounded-xl p-4 bg-slate-50">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-gray-800">
                          Date: {new Date(card.date).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-lg">
                          T-Car No: {card.tCarNo}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {card.items?.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm p-2 bg-white rounded-lg">
                            <span className={item.checked ? "text-emerald-500" : "text-red-500"}>
                              {item.checked ? "✓" : "✗"}
                            </span>
                            <div>
                              <p className={item.checked ? "text-gray-700" : "text-red-700 font-medium"}>
                                {item.description}
                              </p>
                              {item.remarks && (
                                <p className="text-xs text-gray-400">
                                  Remarks: {item.remarks}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Data for Selected Date */}
              {!tcardLoading && tcardSelectedDate && tcardData.length === 0 && tcardAvailableDates.length > 0 && (
                <div className="text-center py-8 bg-slate-50 rounded-xl">
                  <CalendarDays size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No checklist found for selected date</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try selecting a different date from the dropdown
                  </p>
                </div>
              )}

              {/* No T-Cards at All */}
              {!tcardLoading && tcardAvailableDates.length === 0 && (
                <div className="text-center py-8 bg-slate-50 rounded-xl">
                  <ClipboardCheck size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No T-Card submissions available</p>
                  <p className="text-sm text-gray-400 mt-1">
                    This driver has not submitted any checklists yet
                  </p>
                </div>
              )}
            </div>
          )}

          {/* No Duty Logs Message */}
          {isDriver && (!user.logs || user.logs.length === 0) && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Activity size={20} />
                Duty Logs
              </h2>
              <p className="text-gray-500 text-center py-4">No duty logs available</p>
            </div>
          )}

        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <EditUserModal
          userId={userId}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => loadUserDetails()}
        />
      )}

      <Footer />
    </>
  );
}

/* ========== HELPER COMPONENTS ========== */

function Badge({ children, color = "gray" }) {
  const colors = {
    gray: "bg-gray-100 text-gray-700",
    indigo: "bg-indigo-100 text-indigo-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700"
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

function StatCard({ icon, label, value, isText = false }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className={`font-bold ${isText ? "text-sm" : "text-lg"}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || "-"}</p>
    </div>
  );
}

function TrainingCard({ name, training }) {
  if (!training) return null;

  const isOverdue = training.dueDate && new Date(training.dueDate) < new Date();

  return (
    <div className={`p-4 rounded-lg border ${isOverdue ? "border-red-200 bg-red-50" : "border-gray-200"}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{name.replace("_", "/")}</h4>
        {isOverdue ? (
          <span className="text-xs text-red-600 flex items-center gap-1">
            <XCircle size={12} /> Overdue
          </span>
        ) : (
          <span className="text-xs text-emerald-600 flex items-center gap-1">
            <CheckCircle size={12} /> Valid
          </span>
        )}
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        <p>Done: {training.doneDate ? new Date(training.doneDate).toLocaleDateString() : "-"}</p>
        <p>Due: {training.dueDate ? new Date(training.dueDate).toLocaleDateString() : "-"}</p>
        <p className="text-xs text-gray-400">{training.schedule}</p>
      </div>
    </div>
  );
}

