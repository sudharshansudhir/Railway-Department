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
  Pencil
} from "lucide-react";
import Footer from "../components/Footer";
import UserDetailModal from "../components/UserDetailModal";
import EditUserModal from "../components/EditUserModal";

export default function AdminDashboard() {
  const [depot, setDepot] = useState("");
  const [depots, setDepots] = useState([]);
  const [managers, setManagers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedManagerId, setSelectedManagerId] = useState(null);
  const [editUserId, setEditUserId] = useState(null);

  const navigate = useNavigate();

  /* ================= LOAD DEPOTS ================= */
  const loadDepots = async () => {
    try {
      const res = await api.get("/admin/depots");
      setDepots(res.data);
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
      setManagers(res.data.managers);
      setDrivers(res.data.drivers);
    } catch {
      Swal.fire("Error", "Unable to fetch admin data", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VIEW USER DETAILS ================= */
  const viewDriverDetails = (userId) => {
    // Navigate to dedicated detail page for drivers (comprehensive view)
    navigate(`/admin/user/${userId}`);
  };

  const viewManagerDetails = (userId) => {
    // Open modal for managers (compact view)
    setSelectedManagerId(userId);
  };

  useEffect(() => {
    loadDepots();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [depot]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ================= HEADER ================= */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Shield className="text-indigo-600" />
                Sr.DEE/TRD/SA Dashboard
              </h2>
              <p className="text-sm text-gray-500">
                Global visibility across all depots
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <StatCard
                icon={<UserCog />}
                label="Managers"
                value={managers.length}
              />
              <StatCard
                icon={<Train />}
                label="Drivers"
                value={drivers.length}
              />

              <button
                onClick={() => navigate("/admin/register")}
                className="flex items-center gap-2 px-4 py-2
                           bg-indigo-600 text-white rounded-xl
                           hover:bg-indigo-700 transition shadow text-sm"
              >
                <UserPlus size={18} />
                Add User
              </button>
            </div>
          </div>

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

          {/* ================= MANAGERS ================= */}
          <Section title="Depot Managers" icon={<Users />}>
            <Table headers={["Name", "PF No", "Depot", "Actions"]} loading={loading} emptyText="No managers found">
              {managers.map(m => (
                <tr key={m._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{m.name}</td>
                  <td className="px-4 py-3">{m.pfNo || "-"}</td>
                  <td className="px-4 py-3"><Badge>{m.depotName}</Badge></td>
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
                  <td className="px-4 py-3"><Badge>{d.depotName}</Badge></td>
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

      {/* Manager Detail Modal */}
      {selectedManagerId && (
        <UserDetailModal
          userId={selectedManagerId}
          onClose={() => setSelectedManagerId(null)}
          isAdmin={true}
        />
      )}

      {/* Edit User Modal */}
      {editUserId && (
        <EditUserModal
          userId={editUserId}
          onClose={() => setEditUserId(null)}
          onSuccess={() => loadUsers()}
        />
      )}

      <Footer/>
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
            <tr><td colSpan={headers.length} className="py-6 text-center">Loading...</td></tr>
          )}
          {!loading && children.length === 0 && (
            <tr><td colSpan={headers.length} className="py-6 text-center">{emptyText}</td></tr>
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
