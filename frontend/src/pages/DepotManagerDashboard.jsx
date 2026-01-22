import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";
import {
  Users,
  Search,
  Eye,
  Train
} from "lucide-react";
import Footer from "../components/Footer";

export default function DepotManagerDashboard() {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    api.get("/depot/drivers")
      .then(res => setDrivers(res.data))
      .catch(() =>
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load drivers",
        })
      )
      .finally(() => setLoading(false));
  }, []);

  const filteredDrivers = drivers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.pfNo.includes(search)
  );

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                SSE/TRD Dashboard
              </h2>
              <p className="text-sm text-gray-500">
                Manage drivers under your depot
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow">
              <Users className="text-blue-600" />
              <span className="font-semibold text-gray-700">
                Total Drivers: {drivers.length}
              </span>
            </div>
          </div>

          {/* SEARCH */}
          <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
            <Search className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by PF No or Name"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full focus:outline-none text-sm"
            />
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-gray-700 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left">PF No</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Depot</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-gray-500">
                        Loading drivers...
                      </td>
                    </tr>
                  )}

                  {!loading && filteredDrivers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-gray-500">
                        No drivers found
                      </td>
                    </tr>
                  )}

                  {filteredDrivers.map(d => (
                    <tr
                      key={d._id}
                      className="border-t hover:bg-slate-50 transition"
                    >
                      <td className="px-4 py-3 font-medium">
                        {d.pfNo}
                      </td>
                      <td className="px-4 py-3">
                        {d.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                          <Train size={14} />
                          {d.depotName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() =>
                            navigate(`/manager/driver/${d._id}`)
                          }
                          className="inline-flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
      <Footer/>
    </>
  );
}
