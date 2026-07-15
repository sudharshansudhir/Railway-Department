import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import IssueDashboard from "./IssueDashboard";
import AbnormalityDashboard from "../components/AbnormalityDashboard";
import Swal from "sweetalert2";
import {
  Users,
  Search,
  Eye,
  Train,
  AlertTriangle,
  ClipboardList,
  ShieldAlert,
  Clock,
  TriangleAlert
} from "lucide-react";
import Footer from "../components/Footer";

export default function DepotManagerDashboard() {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
const [overdues, setOverdues] = useState([]);
const [issues, setIssues] = useState([]);
const [abnormalities, setAbnormalities] = useState([]);
  const navigate = useNavigate();

  /* ================= VIEW USER DETAILS ================= */
  const viewUserDetails = (userId) => {
    // Navigate to dedicated detail page for full comprehensive view
    navigate(`/manager/driver/${userId}`);
  };

  useEffect(() => {
   Promise.all([
  api.get("/depot/drivers"),
  api.get("/admin/overdue-records"),
  api.get("/issues"),
  api.get("/abnormalities")
])
.then(([driverRes, overdueRes, issueRes, abnormalityRes]) => {

  setDrivers(driverRes.data);

  setOverdues(overdueRes.data);

  setIssues(issueRes.data);

  setAbnormalities(abnormalityRes.data);

})
.catch(() => {

  Swal.fire({
    icon: "error",
    title: "Error",
    text: "Failed to load dashboard"
  });

})
.finally(() => setLoading(false));
  }, []);

  const filteredDrivers = drivers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.pfNo.includes(search)
  );
/* ================= OVERDUE SUMMARY ================= */

const totalOverdues = overdues.length;

const trainingOverdues =
  overdues.filter(
    o => o.category === "Training Overdue"
  ).length;

const lrOverdues =
  overdues.filter(
    o => o.category === "LR Overdue"
  ).length;

/* ================= OVERDUE TABLE DATA ================= */

const trainingOverdueRecords =
  overdues.filter(
    o => o.category === "Training Overdue"
  );

const lrOverdueRecords =
  overdues.filter(
    o => o.category === "LR Overdue"
  );

  const issueTotal = issues.length;

const issuePending =
  issues.filter(i => i.status === "Pending").length;

const abnormalityTotal = abnormalities.length;

const abnormalityPending =
  abnormalities.filter(a => a.status === "Pending").length;


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
<div className="space-y-4">

  {/* First Row */}
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <div>
      <StatCard
        icon={<Users />}
        title="Drivers"
        value={drivers.length}
      />
    </div>

    <div>
      <StatCard
        icon={<ShieldAlert />}
        title="Overdues"
        value={totalOverdues}
      />
    </div>

    <div>
      <StatCard
        icon={<ClipboardList />}
        title="Training"
        value={trainingOverdues}
      />
    </div>

    <div>
      <StatCard
        icon={<AlertTriangle />}
        title="LR Due"
        value={lrOverdues}
      />
    </div>
  </div>

  {/* Second Row */}
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <div>
      <StatCard
        icon={<AlertTriangle />}
        title="High Issues"
        value={issueTotal}
      />
    </div>

    <div>
      <StatCard
        icon={<Clock />}
        title="Pending Issues"
        value={issuePending}
      />
    </div>

    <div>
      <StatCard
        icon={<TriangleAlert />}
        title="Abnormalities"
        value={abnormalityTotal}
      />
    </div>

    <div>
      <StatCard
        icon={<Clock />}
        title="Pending Abnormal"
        value={abnormalityPending}
      />
    </div>
  </div>

</div>

          {/* SEARCH */}
          <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3 w-full">
            <Search className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by PF No or Name"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full focus:outline-none text-sm min-w-0"
            />
          </div>
        <IssueDashboard />
        <AbnormalityDashboard />
<div className="space-y-8">

  {/* ================= LR DUE ================= */}

  <div className="bg-white rounded-xl shadow overflow-hidden">

    <div className="px-5 py-4 border-b">

      <h3 className="text-lg font-bold text-red-600">

        Overdue Records

      </h3>

    </div>

    <div className="p-5">

      <div className="flex items-center gap-2 mb-4">

        <ClipboardList className="text-red-600" size={22} />

        <h4 className="text-xl font-bold">

          LR Due Records

        </h4>

      </div>

      <Table

        headers={[

          "Driver",

          "PF No",

          "Category",

          "Item",

          "Due Date",

          "Overdue",

          "Action",

        ]}

        loading={loading}

        emptyText="No LR Due Records"

      >

        {lrOverdueRecords.map((record, index) => (

          <tr

            key={`${record.driverId}-${index}`}

            className="hover:bg-slate-50 border-t"

          >

            <td className="px-5 py-4 font-medium">

              {record.driverName}

            </td>

            <td className="px-5 py-4">

              {record.pfNo}

            </td>

            <td className="px-5 py-4">

              <span

                className={`px-3 py-1 rounded-full text-xs font-medium ${

                  record.category === "Training Overdue"

                    ? "bg-red-100 text-red-700"

                    : "bg-indigo-100 text-indigo-700"

                }`}

              >

                {record.category}

              </span>

            </td>

            <td className="px-5 py-4">

              {record.item}

            </td>

            <td className="px-5 py-4">

              {new Date(record.dueDate).toLocaleDateString()}

            </td>

            <td className="px-5 py-4">

              <span className="text-red-600 font-semibold">

                {record.overdueDays} Days

              </span>

            </td>

            <td className="px-5 py-4">

              <button

                onClick={() =>

                  navigate(`/manager/driver/${record.driverId}`)

                }

                className="inline-flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"

              >

                <Eye size={15} />

                View

              </button>

            </td>

          </tr>

        ))}

      </Table>

    </div>

  </div>



  {/* ================= TRAINING DUE ================= */}

  <div className="bg-white rounded-xl shadow overflow-hidden">

    <div className="p-5">

      <div className="flex items-center gap-2 mb-4">

        <ClipboardList className="text-amber-600" size={22} />

        <h4 className="text-xl font-bold">

          Training Due Records

        </h4>

      </div>

      <Table

        headers={[

          "Driver",

          "PF No",

          "Category",

          "Item",

          "Due Date",

          "Overdue",

          "Action",

        ]}

        loading={loading}

        emptyText="No Training Due Records"

      >

        {trainingOverdueRecords.map((record, index) => (

          <tr

            key={`${record.driverId}-${index}`}

            className="hover:bg-slate-50 border-t"

          >

            <td className="px-5 py-4 font-medium">

              {record.driverName}

            </td>

            <td className="px-5 py-4">

              {record.pfNo}

            </td>

            <td className="px-5 py-4">

              <span

                className={`px-3 py-1 rounded-full text-xs font-medium ${

                  record.category === "Training Overdue"

                    ? "bg-red-100 text-red-700"

                    : "bg-indigo-100 text-indigo-700"

                }`}

              >

                {record.category}

              </span>

            </td>

            <td className="px-5 py-4">

              {record.item}

            </td>

            <td className="px-5 py-4">

              {new Date(record.dueDate).toLocaleDateString()}

            </td>

            <td className="px-5 py-4">

              <span className="text-red-600 font-semibold">

                {record.overdueDays} Days

              </span>

            </td>

            <td className="px-5 py-4">

              <button

                onClick={() =>

                  navigate(`/manager/driver/${record.driverId}`)

                }

                className="inline-flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"

              >

                <Eye size={15} />

                View

              </button>

            </td>

          </tr>

        ))}

      </Table>

    </div>

  </div>

</div>


          {/* TABLE */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
               <div className="px-5 py-4 border-b">

    <h3 className="text-lg font-bold text-red-600">

       Drivers

    </h3>

  </div>
  <div className="overflow-x-auto">
             <table className="min-w-[850px] w-full text-sm">
                <thead className="bg-slate-100 text-gray-700 sticky top-0">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-left whitespace-nowrap">PF No</th>
                    <th className="px-3 sm:px-4 py-3 text-left whitespace-nowrap">Name</th>
                    <th className="px-3 sm:px-4 py-3 text-left whitespace-nowrap">Depot</th>
                    <th className="px-3 sm:px-4 py-3 text-center whitespace-nowrap">Action</th>
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
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                        {d.name}
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">
                          <Train size={14} />
                          {d.depotName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => viewUserDetails(d._id)}
                          className="inline-flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition whitespace-nowrap"
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
      </div>


      <Footer/>
    </>
  );
}
function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3 w-full">

      <div className="p-3 rounded-full bg-red-50 text-red-600">
        {icon}
      </div>

      <div>

        <p className="text-xs text-gray-500">
          {title}
        </p>

      <p className="text-xl sm:text-2xl font-bold">
          {value}
        </p>

      </div>

    </div>
  );
}

function Table({ headers, children, loading, emptyText }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">

      <div className="overflow-x-auto">

        <table className="min-w-[900px] w-full text-sm">

          <thead className="bg-slate-100">

            <tr>

              {headers.map((header) => (

                <th
                  key={header}
                  className="px-5 py-4 text-left whitespace-nowrap font-semibold"
                >
                  {header}
                </th>

              ))}

            </tr>

          </thead>

          <tbody>

            {loading && (

              <tr>

                <td
                  colSpan={headers.length}
                  className="py-8 text-center text-gray-500"
                >

                  Loading...

                </td>

              </tr>

            )}

            {!loading &&
              (!children ||
                (Array.isArray(children) && children.length === 0)) && (

                <tr>

                  <td
                    colSpan={headers.length}
                    className="py-8 text-center text-gray-500"
                  >

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