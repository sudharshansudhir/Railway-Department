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

      <div className="min-h-screen bg-slate-100 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ================= HEADER ================= */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

  {/* LEFT */}

  <div className="flex items-start gap-4">

    <Shield className="text-indigo-600 mt-1" size={30} />

    <div>

      <h2 className="text-4xl font-bold text-slate-800">

        {isADEE
          ? "ADEE/TRD Dashboard"
          : "Sr.DEE/TRD/SA Dashboard"}

      </h2>

      <p className="text-gray-500">

        {isADEE
          ? "Visibility across assigned depots"
          : "Global visibility across all depots"}

      </p>

    </div>

  </div>

  {/* RIGHT */}

  {!isADEE && (

    <button
      onClick={() => navigate("/admin/register")}
      className="bg-indigo-600 hover:bg-indigo-700
      text-white rounded-xl
      px-6 py-3
      flex items-center gap-2
      shadow-lg transition"
    >

      <UserPlus size={20} />

      Add User

    </button>

  )}


</div>
           {/* ================= TOP ROW ================= */}

<div className="space-y-4">

  {/* ---------- Row 1 ---------- */}

  <div className="flex flex-wrap gap-4">

    <div className="flex-1 min-w-[220px]">
      <StatCard
        icon={<UserCog />}
        label="SSE/TRD"
        value={managers.length}
      />
    </div>

    <div className="flex-1 min-w-[220px]">
      <StatCard
        icon={<Train />}
        label="Drivers"
        value={drivers.length}
      />
    </div>

    {!isADEE && (
      <div className="flex-1 min-w-[220px]">
        <StatCard
          icon={<Users />}
          label="Mini Admins"
          value={miniAdmins.length}
        />
      </div>
    )}

    <div className="flex-1 min-w-[220px]">
      <StatCard
        icon={<AlertTriangle />}
        label="Overdues"
        value={totalOverdues}
      />
    </div>

  </div>

  {/* ---------- Row 2 ---------- */}

  <div className="flex flex-wrap gap-4">

    <div className="flex-1 min-w-[220px]">
      <StatCard
        icon={<ClipboardList />}
        label="Training Due"
        value={trainingOverdues}
      />
    </div>

    <div className="flex-1 min-w-[220px]">
      <StatCard
        icon={<Shield />}
        label="LR Due"
        value={lrOverdues}
      />
    </div>

    <div className="flex-1 min-w-[220px]">
      <StatCard
        icon={<AlertTriangle />}
        label="High Issues"
        value={issueTotal}
      />
    </div>

    <div className="flex-1 min-w-[220px]">
      <StatCard
        icon={<ClipboardList />}
        label="Abnormalities"
        value={abnormalityTotal}
      />
    </div>

  </div>

</div>
{/* ================= SECOND ROW ================= */}




{/* </div> */}
      

          {/* ================= FILTER ================= */}
          <div className="bg-white p-4 rounded-xl shadow flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <Filter size={18} />
              Filter by Depot
            </div>

            <select
              value={depot}
              onChange={e => setDepot(e.target.value)}
              className="px-4 py-2 border rounded-lg
                         focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Depots</option>
              {depots.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
            <IssueDashboard selectedDepot={depot}/>
<AbnormalityDashboard
    selectedDepot={depot}
/>

          <Section
  title="Overdue Records"
  icon={<AlertTriangle className="text-red-600" />}
>
  <Table
    headers={[
      "Driver",
      "PF No",
      "Depot",
      "Category",
      "Item",
      "Due Date",
      "Overdue",
      "Action"
    ]}
    loading={loadingOverdues}
    emptyText="No overdue records"
  >
    {overdues.map((record, index) => (
      <tr
        key={`${record.driverId}-${index}`}
        className="hover:bg-slate-50"
      >
        <td className="px-4 py-3">
          {record.driverName}
        </td>

        <td className="px-4 py-3">
          {record.pfNo}
        </td>

        <td className="px-4 py-3">
          <Badge>{record.depotName}</Badge>
        </td>

        <td className="px-4 py-3">
          {record.category}
        </td>

        <td className="px-4 py-3">
          {record.item}
        </td>

        <td className="px-4 py-3">
          {new Date(record.dueDate).toLocaleDateString()}
        </td>

        <td className="px-4 py-3">
          <span className="text-red-600 font-semibold">
            {record.overdueDays} Days
          </span>
        </td>

        <td className="px-4 py-3">
          <button
            onClick={() =>
              navigate(`/admin/user/${record.driverId}`)
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Eye size={14} />
            View
          </button>
        </td>
      </tr>
    ))}
  </Table>
</Section>

          {/* ================= MINI ADMINS (NEW) ================= */}
          {!isADEE  && <Section title="Mini Admins (ADEE)" icon={<Users />}>
            <Table
              headers={["Name", "PF No", "Depot", "Actions"]}
              loading={loading}
              emptyText="No mini admins found"
            >
              {miniAdmins.map(m => (
                <tr key={m._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{m.name}</td>
                  <td className="px-4 py-3">{m.pfNo || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge>{m.assignedDepots.join("/")}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewMiniAdminDetails(m._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => setEditUserId(m._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
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
                <tr key={m._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{m.name}</td>
                  <td className="px-4 py-3">{m.pfNo || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge>SSE/TRD/{m.depotName}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewManagerDetails(m._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => setEditUserId(m._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
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
                <tr key={d._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{d.pfNo}</td>
                  <td className="px-4 py-3">{d.name}</td>
                  <td className="px-4 py-3">
                    <Badge>{d.depotName}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewDriverDetails(d._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => setEditUserId(d._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
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

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white px-4 py-3 rounded-xl shadow flex items-center gap-3">
      <div className="p-2 bg-slate-100 rounded-full text-indigo-600">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-bold">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function Table({ headers, children, loading, emptyText }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            {headers.map(h => (
              <th key={h} className="px-4 py-3 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={headers.length} className="py-6 text-center">
                Loading...
              </td>
            </tr>
          )}
          {!loading && children.length === 0 && (
            <tr>
              <td colSpan={headers.length} className="py-6 text-center">
                {emptyText}
              </td>
            </tr>
          )}
          {!loading && children}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">
      {children}
    </span>
  );
}