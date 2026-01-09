import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";
import {
  Shield,
  Users,
  Train,
  UserCog,
  Filter
} from "lucide-react";

export default function AdminDashboard() {
  const [depot, setDepot] = useState("");
  const [managers, setManagers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/admin/users${depot ? `?depot=${depot}` : ""}`
      );
      setManagers(res.data.managers);
      setDrivers(res.data.drivers);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Load Failed",
        text: "Unable to fetch admin data",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [depot]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* HEADER */}
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

            {/* STATS */}
            <div className="flex gap-3">
              <StatCard
                icon={<UserCog />}
                label="Managers"
                value={managers.length}
                color="blue"
              />
              <StatCard
                icon={<Train />}
                label="Drivers"
                value={drivers.length}
                color="emerald"
              />
            </div>
          </div>

          {/* FILTER */}
          <div className="bg-white p-4 rounded-xl shadow flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <Filter size={18} />
              Filter by Depot
            </div>

            <select
              value={depot}
              onChange={e => setDepot(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Depots</option>
              <option value="CBE">CBE</option>
              <option value="PTJ">PTJ</option>
              <option value="MTP">MTP</option>
            </select>
          </div>

          {/* MANAGERS */}
          <Section title="Depot Managers" icon={<Users />}>
            <Table
              headers={["Name", "PF No", "Depot"]}
              loading={loading}
              emptyText="No managers found"
            >
              {managers.map(m => (
                <tr key={m._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{m.name || "-"}</td>
                  <td className="px-4 py-3">{m.pfNo || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge>{m.depotName}</Badge>
                  </td>
                </tr>
              ))}
            </Table>
          </Section>

          {/* DRIVERS */}
          <Section title="Drivers" icon={<Train />}>
            <Table
              headers={["PF No", "Name", "Depot"]}
              loading={loading}
              emptyText="No drivers found"
            >
              {drivers.map(d => (
                <tr key={d._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{d.pfNo}</td>
                  <td className="px-4 py-3">{d.name}</td>
                  <td className="px-4 py-3">
                    <Badge>{d.depotName}</Badge>
                  </td>
                </tr>
              ))}
            </Table>
          </Section>

        </div>
      </div>
    </>
  );
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white px-4 py-3 rounded-xl shadow flex items-center gap-3">
      <div className="p-2 bg-slate-100 rounded-full text-indigo-600">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        {icon}
        {title}
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
              <th
                key={h}
                className="px-4 py-3 text-left font-semibold text-gray-700"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={headers.length} className="py-6 text-center text-gray-500">
                Loading...
              </td>
            </tr>
          )}

          {!loading && children.length === 0 && (
            <tr>
              <td colSpan={headers.length} className="py-6 text-center text-gray-500">
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
    <span className="inline-block px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">
      {children}
    </span>
  );
}
