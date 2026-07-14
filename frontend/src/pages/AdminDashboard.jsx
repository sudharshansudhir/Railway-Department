import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";
import {
  Shield,
  Users,
  Train,
  UserCog,
  Filter,
  UserPlus,
  Eye,
  Pencil,
  AlertTriangle,
  ClipboardList
} from "lucide-react";
import Footer from "../components/Footer";
import UserDetailModal from "../components/UserDetailModal";
import EditUserModal from "../components/EditUserModal";
import IssueDashboard from "./IssueDashboard";
import AbnormalityDashboard from "../components/AbnormalityDashboard";

export default function AdminDashboard() {
  const [depot, setDepot] = useState("");
  const [issues, setIssues] = useState([]);
const [abnormalities, setAbnormalities] = useState([]);
  const [depots, setDepots] = useState([]);
const [showIssues, setShowIssues] = useState(false);

const [showOverdues, setShowOverdues] = useState(false);

const [showAbnormalities, setShowAbnormalities] = useState(false);
  const [managers, setManagers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [miniAdmins, setMiniAdmins] = useState([]); // ✅ NEW
const [overdues, setOverdues] = useState([]);
const [loadingOverdues, setLoadingOverdues] = useState(true);
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem("role");
  const isADEE = role === "ADEE";

  const [selectedManagerId, setSelectedManagerId] = useState(null);
  const [editUserId, setEditUserId] = useState(null);

  const navigate = useNavigate();

  /* ================= OVERDUE SUMMARY ================= */

const totalOverdues = overdues.length;

const trainingOverdues = overdues.filter(
  item => item.category === "Training Overdue"
).length;

const lrOverdues = overdues.filter(
  item => item.category === "LR Overdue"
).length;

const circularPending = drivers.filter(
  d => !d.lastAcknowledgedCircularId
).length;

const overdueDrivers = new Set(
  overdues.map(item => item.driverId)
).size;
/* ================= ISSUES SUMMARY ================= */

const issueTotal = issues.length;

const issuePending =
  issues.filter(i => i.status === "Pending").length;

const issueResolved =
  issues.filter(i => i.status === "Resolved").length;

/* ================= ABNORMALITY SUMMARY ================= */

const abnormalityTotal = abnormalities.length;

const abnormalityPending =
  abnormalities.filter(a => a.status === "Pending").length;

const abnormalityResolved =
  abnormalities.filter(
    a => a.status === "Action Taken"
  ).length;

  /* ================= LOAD DEPOTS ================= */
  const loadDepots = async () => {
    try {
      const res = await api.get("/admin/depots");
      setDepots(Array.isArray(res.data) ? res.data : []);
    } catch {
      Swal.fire("Error", "Failed to load depots", "error");
    }
  };

  /* ================= LOAD USERS ================= */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/admin/users${depot ? `?depot=${depot}` : ""}`
      );
      // console.log(res)

      setManagers(res.data.managers || []);
      setDrivers(res.data.drivers || []);
      setMiniAdmins(res.data.mini || []); // ✅ NEW

    } catch {
      Swal.fire("Error", "Unable to fetch admin data", "error");
    } finally {
      setLoading(false);
    }
  };
const loadOverdues = async () => {
  try {

    setLoadingOverdues(true);

    const res = await api.get(
      `/admin/overdue-records${depot ? `?depot=${depot}` : ""}`
    );

    setOverdues(res.data);

  } catch (err) {

    console.log(err);

  } finally {

    setLoadingOverdues(false);

  }
};

const loadIssues = async () => {
  try {
    const res = await api.get(
      `/issues${depot ? `?depot=${depot}` : ""}`
    );

    setIssues(res.data);

  } catch (err) {
    console.log(err);
  }
};

const loadAbnormalities = async () => {
  try {
    const res = await api.get(
      `/abnormalities${depot ? `?depot=${depot}` : ""}`
    );

    setAbnormalities(res.data);

  } catch (err) {
    console.log(err);
  }
};

  const viewDriverDetails = (userId) => {
    navigate(`/admin/user/${userId}`);
  };

  const viewManagerDetails = (userId) => {
    setSelectedManagerId(userId);
  };

  const viewMiniAdminDetails = (userId) => { // ✅ NEW
    setSelectedManagerId(userId);
  };

  useEffect(() => {
    loadDepots();
  }, []);

  useEffect(() => {
    loadUsers();
  loadOverdues();

  loadIssues();

  loadAbnormalities();
  }, [depot]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#F8FAFC] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* ================= HEADER ================= */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">

            {/* LEFT */}
            <div className="flex items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-100 rounded-xl text-[#0b659a] flex-shrink-0">
                  <Shield size={28} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                    {isADEE ? "ADEE/TRD Dashboard" : "Sr.DEE/TRD/SA Dashboard"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    {isADEE ? "Visibility across assigned depots" : "Global visibility across all depots"}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            {!isADEE && (
              <button
                onClick={() => navigate("/admin/register")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                <UserPlus size={18} />
                Add User
              </button>
            )}
          </div>
            {/* ================= STAT CARDS GRID ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={<UserCog />}
                label="SSE / TRD"
                value={managers.length}
              />
              <StatCard
                icon={<Train />}
                label="Drivers"
                value={drivers.length}
              />
              {!isADEE && (
                <StatCard
                  icon={<Users />}
                  label="Mini Admins"
                  value={miniAdmins.length}
                />
              )}
              <StatCard
                icon={<ClipboardList />}
                label="Training Due"
                value={trainingOverdues}
              />
              <StatCard
                icon={<Shield />}
                label="LR Due"
                value={lrOverdues}
              />
              <StatCard
                icon={<AlertTriangle />}
                label="Circular Pending"
                value={circularPending}
              />
              <StatCard
                icon={<AlertTriangle />}
                label="TW High Issues"
                value={issueTotal}
                colorClass="bg-amber-50 text-amber-600"
              />
              <StatCard
                icon={<AlertTriangle />}
                label="Track Abnormalities"
                value={abnormalityTotal}
                colorClass="bg-red-50 text-red-600"
              />
            </div>




{/* </div> */}
      

          {/* ================= FILTER ================= */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3 text-slate-700 font-bold">
              <div className="p-2 bg-slate-100 rounded-lg text-[#0b659a]">
                <Filter size={20} />
              </div>
              <span className="text-base">Filter by Depot</span>
            </div>

            <select
              value={depot}
              onChange={e => setDepot(e.target.value)}
              className="w-full sm:w-64 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="">All Depots</option>
              {depots.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#0b659a] group/card">
              <button
                onClick={() => setShowIssues(!showIssues)}
                className="w-full flex items-center justify-between px-6 py-5 bg-white transition-colors duration-300 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-amber-50 group-hover/card:bg-[#0b659a] rounded-xl text-amber-600 group-hover/card:text-white transition-colors duration-300">
                    <AlertTriangle size={20} />
                  </div>
                  <span className="text-lg font-bold text-slate-800 transition-colors duration-300">TW High Issues</span>
                </div>
                <span className={`text-slate-400 transition-transform duration-300 ${showIssues ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>
              {showIssues && (
                <div className="p-6 border-t border-slate-100 bg-slate-50/30">
                  <IssueDashboard selectedDepot={depot} />
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#0b659a] group/card">
              <button
                onClick={() => setShowAbnormalities(!showAbnormalities)}
                className="w-full flex items-center justify-between px-6 py-5 bg-white transition-colors duration-300 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-red-50 group-hover/card:bg-[#0b659a] rounded-xl text-red-600 group-hover/card:text-white transition-colors duration-300">
                    <AlertTriangle size={20} />
                  </div>
                  <span className="text-lg font-bold text-slate-800 transition-colors duration-300">Track Abnormalities</span>
                </div>
                <span className={`text-slate-400 transition-transform duration-300 ${showAbnormalities ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>
              {showAbnormalities && (
                <div className="p-6 border-t border-slate-100 bg-slate-50/30">
                  <AbnormalityDashboard selectedDepot={depot} />
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#0b659a] group/card">
              <button
                onClick={() => setShowOverdues(!showOverdues)}
                className="w-full flex items-center justify-between px-6 py-5 bg-white transition-colors duration-300 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-indigo-50 group-hover/card:bg-[#0b659a] rounded-xl text-indigo-600 group-hover/card:text-white transition-colors duration-300">
                    <ClipboardList size={20} />
                  </div>
                  <span className="text-lg font-bold text-slate-800 transition-colors duration-300">Overdue Records</span>
                </div>
                <span className={`text-slate-400 transition-transform duration-300 ${showOverdues ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>
              {showOverdues && (
                <div className="p-6 border-t border-slate-100 bg-slate-50/30">
                  <Section title="Overdue Records Details" icon={<ClipboardList />}>
                    <Table
                      headers={["Driver", "PF No", "Depot", "Category", "Item", "Due Date", "Overdue", "Action"]}
                      loading={loadingOverdues}
                      emptyText="No overdue records"
                    >
                      {overdues.map((record, index) => (
                        <tr key={`${record.driverId}-${index}`} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-5 py-4 font-medium text-slate-800">{record.driverName}</td>
                          <td className="px-5 py-4 text-slate-600">{record.pfNo}</td>
                          <td className="px-5 py-4"><Badge>{record.depotName}</Badge></td>
                          <td className="px-5 py-4 text-slate-600">{record.category}</td>
                          <td className="px-5 py-4 text-slate-600">{record.item}</td>
                          <td className="px-5 py-4 text-slate-600">{new Date(record.dueDate).toLocaleDateString()}</td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
                              {record.overdueDays} Days
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => navigate(`/admin/user/${record.driverId}`)}
                              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"
                            >
                              <Eye size={14} />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </Table>
                  </Section>
                </div>
              )}
            </div>

          {/* ================= MINI ADMINS (NEW) ================= */}
          {!isADEE  && <Section title="Mini Admins (ADEE)" icon={<Users />}>
            <Table
              headers={["Name", "PF No", "Depot", "Actions"]}
              loading={loading}
              emptyText="No mini admins found"
            >
              {miniAdmins.map(m => (
                <tr key={m._id} className="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0">
                  <td className="px-5 py-4 font-medium text-slate-800">{m.name}</td>
                  <td className="px-5 py-4 text-slate-600">{m.pfNo || "-"}</td>
                  <td className="px-5 py-4">
                    <Badge>{m.assignedDepots.join("/")}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewMiniAdminDetails(m._id)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => setEditUserId(m._id)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </Section> }
          

          {/* ================= MANAGERS ================= */}
          <Section title="SSE/TRD" icon={<Users />}>
            <Table headers={["Name", "PF No", "Depot", "Actions"]} loading={loading} emptyText="No managers found">
              {managers.map(m => (
                <tr key={m._id} className="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0">
                  <td className="px-5 py-4 font-medium text-slate-800">{m.name}</td>
                  <td className="px-5 py-4 text-slate-600">{m.pfNo || "-"}</td>
                  <td className="px-5 py-4">
                    <Badge>SSE/TRD/{m.depotName}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewManagerDetails(m._id)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => setEditUserId(m._id)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </Section>

          {/* ================= DRIVERS ================= */}
          <Section title="Drivers" icon={<Train />}>
            <Table headers={["PF No", "Name", "Depot", "Actions"]} loading={loading} emptyText="No drivers found">
              {drivers.map(d => (
                <tr key={d._id} className="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0">
                  <td className="px-5 py-4 text-slate-600">{d.pfNo}</td>
                  <td className="px-5 py-4 font-medium text-slate-800">{d.name}</td>
                  <td className="px-5 py-4">
                    <Badge>{d.depotName}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewDriverDetails(d._id)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => setEditUserId(d._id)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shadow-sm"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </Section>

        </div>
      </div>

      {selectedManagerId && (
        <UserDetailModal
          userId={selectedManagerId}
          onClose={() => setSelectedManagerId(null)}
          isAdmin={true}
        />
      )}

      {editUserId && (
        <EditUserModal
          userId={editUserId}
          onClose={() => setEditUserId(null)}
          onSuccess={() => loadUsers()}
        />
      )}

      <Footer />
    </>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ icon, label, value, colorClass }) {
  const iconStyle = colorClass || "bg-slate-100 text-[#0b659a]";
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#0b659a] hover:-translate-y-1 group transition-all duration-300 flex items-center gap-5">
      <div className={`p-4 ${iconStyle} group-hover:bg-[#0b659a] group-hover:text-white rounded-2xl flex-shrink-0 transition-colors duration-300`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500 tracking-wide mb-1 uppercase transition-colors duration-300">{label}</p>
        <p className="text-3xl font-bold text-slate-800 transition-colors duration-300">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6 flex flex-col group/section transition-all duration-300 hover:shadow-md hover:border-[#0b659a] hover:-translate-y-1">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 bg-white transition-colors duration-300">
        <div className="p-2.5 bg-slate-100 group-hover/section:bg-[#0b659a] group-hover/section:text-white rounded-xl text-[#0b659a] transition-colors duration-300">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-800 transition-colors duration-300">
          {title}
        </h3>
      </div>
      <div className="p-6 bg-slate-50/30 flex-1">
        {children}
      </div>
    </div>
  );
}

function Table({ headers, children, loading, emptyText }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              {headers.map(h => (
                <th key={h} className="px-5 py-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={headers.length} className="py-8 text-center text-slate-500 font-medium">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && (!children || (Array.isArray(children) ? children.length === 0 : false)) && (
              <tr>
                <td colSpan={headers.length} className="py-8 text-center text-slate-500 font-medium">
                  {emptyText}
                </td>
              </tr>
            )}
            {!loading && children}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg inline-flex items-center justify-center whitespace-nowrap">
      {children}
    </span>
  );
}