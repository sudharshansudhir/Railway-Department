import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Swal from "sweetalert2";

import {
  Building2,
  ShieldCheck,
  Users,
  UserCog,
  Train,
  Plus,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

export default function MasterDashboard() {

  const navigate = useNavigate();

  const [summary, setSummary] = useState({});

  const [superAdmins, setSuperAdmins] = useState([]);

  /* ==========================================
      EDIT
  ========================================== */

  const editAdmin = (admin) => {

    navigate("/master/edit", {

      state: admin

    });

  };

  /* ==========================================
      LOAD DASHBOARD
  ========================================== */

  const loadDashboard = async () => {

    try {

      const summaryRes = await api.get("/master/summary");

      setSummary(summaryRes.data);

      const adminRes = await api.get("/master/super-admins");

      setSuperAdmins(adminRes.data);

    }

    catch (err) {

      console.log(err);

    }

  };

  useEffect(() => {

    loadDashboard();

  }, []);

  /* ==========================================
      SWITCH TO SUPER ADMIN
  ========================================== */

  const switchDashboard = async (id) => {

    try {

      const res = await api.post(

        `/master/switch/${id}`

      );

      localStorage.setItem(

        "masterToken",

        localStorage.getItem("token")

      );

      localStorage.setItem(

        "token",

        res.data.token

      );

      localStorage.setItem(

        "role",

        "SUPER_ADMIN"

      );

      localStorage.setItem(

        "division",

        res.data.superAdmin.division

      );

      localStorage.setItem(

        "assignedDepots",

        JSON.stringify(

          res.data.superAdmin.assignedDepots || []

        )

      );

      localStorage.setItem(

        "isImpersonating",

        "true"

      );

      Swal.fire({

        icon: "success",

        title: "Dashboard Switched",

        timer: 1000,

        showConfirmButton: false

      });

      navigate("/admin");

    }

    catch (err) {

      Swal.fire(

        "Error",

        err.response?.data?.msg ||

        "Failed",

        "error"

      );

    }

  };

  /* ==========================================
      DELETE
  ========================================== */

  const deleteAdmin = async (id) => {

    const confirm = await Swal.fire({

      title: "Delete?",

      text: "This Super Admin will be removed.",

      icon: "warning",

      showCancelButton: true

    });

    if (!confirm.isConfirmed) return;

    try {

      await api.delete(

        `/master/super-admin/${id}`

      );

      Swal.fire(

        "Deleted",

        "Success",

        "success"

      );

      loadDashboard();

    }

    catch (err) {

      Swal.fire(

        "Error",

        err.response?.data?.msg ||

        "Failed",

        "error"

      );

    }

  };

  return (

    <>

      <Navbar />

      <div className="min-h-screen bg-slate-100 px-4 md:px-6 py-6">

        <div className="max-w-7xl mx-auto">

          {/* ======================================
                  HEADER
          ======================================= */}

          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 mb-6">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

              <div className="flex items-center gap-4">

                <div className="bg-blue-100 rounded-2xl p-4">

                  <ShieldCheck

                    className="text-blue-700"

                    size={34}

                  />

                </div>

                <div>

                  <h1 className="text-3xl font-bold text-slate-800">

                    Master Admin Dashboard

                  </h1>

                  <p className="text-slate-500 mt-1">

                    Manage Divisions & Super Admins

                  </p>

                </div>

              </div>

              <button

                onClick={() => navigate("/master/register")}

                className="flex items-center justify-center gap-2
                           bg-blue-600 hover:bg-blue-700
                           text-white px-6 py-3 rounded-xl
                           font-semibold transition"

              >

                <Plus size={20} />

                Add Super Admin

              </button>

            </div>

          </div>

          {/* ======================================
                  SUMMARY CARDS
          ======================================= */}

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-8">

            <SummaryCard

              title="Divisions"

              value={summary.totalDivisions}

              icon={<Building2 size={28} />}

              color="blue"

            />

            <SummaryCard

              title="Super Admins"

              value={summary.totalSuperAdmins}

              icon={<ShieldCheck size={28} />}

              color="green"

            />

            <SummaryCard

              title="ADEE"

              value={summary.totalADEE}

              icon={<UserCog size={28} />}

              color="purple"

            />

            <SummaryCard

              title="Managers"

              value={summary.totalManagers}

              icon={<Users size={28} />}

              color="amber"

            />

            <SummaryCard

              title="Drivers"

              value={summary.totalDrivers}

              icon={<Train size={28} />}

              color="red"

            />

          </div>

          {/* ======================================
                SUPER ADMIN TABLE
          ======================================= */}

          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">

            <div className="px-6 py-4 border-b bg-slate-50">

              <h2 className="text-xl font-bold">

                Super Admin List

              </h2>

              <p className="text-sm text-slate-500">

                View, Edit or Switch into Division Dashboards

              </p>

            </div>
                      {/* ===========================
                  DESKTOP TABLE
          ============================ */}

          <div className="hidden lg:block overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-100">

                <tr>

                  <th className="px-6 py-4 text-left font-semibold">
                    Division
                  </th>

                  <th className="px-6 py-4 text-left font-semibold">
                    Super Admin
                  </th>

                  <th className="px-6 py-4 text-left font-semibold">
                    PF Number
                  </th>

                  <th className="px-6 py-4 text-left font-semibold">
                    Assigned Depots
                  </th>

                  <th className="px-6 py-4 text-center font-semibold">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {superAdmins.map((admin) => (

                  <tr
                    key={admin._id}
                    className="border-b hover:bg-slate-50 transition"
                  >

                    <td className="px-6 py-5 font-semibold">
                      {admin.division}
                    </td>

                    <td className="px-6 py-5">
                      {admin.name}
                    </td>

                    <td className="px-6 py-5">
                      {admin.pfNo}
                    </td>

                    <td className="px-6 py-5">

                      <div className="flex flex-wrap gap-2">

                        {admin.assignedDepots.map((depot) => (

                          <span
                            key={depot}
                            className="bg-blue-100 text-blue-700
                                       px-3 py-1 rounded-full
                                       text-xs font-semibold"
                          >
                            {depot}
                          </span>

                        ))}

                      </div>

                    </td>

                    <td className="px-6 py-5">

                      <div className="flex justify-center gap-3">

                        <button
                          onClick={() => switchDashboard(admin._id)}
                          className="flex items-center gap-2
                                     bg-blue-600 hover:bg-blue-700
                                     text-white px-4 py-2 rounded-lg"
                        >
                          <Eye size={16}/>
                          View
                        </button>

                        <button
                          onClick={() => editAdmin(admin)}
                          className="flex items-center gap-2
                                     bg-green-600 hover:bg-green-700
                                     text-white px-4 py-2 rounded-lg"
                        >
                          <Pencil size={16}/>
                          Edit
                        </button>

                        <button
                          onClick={() => deleteAdmin(admin._id)}
                          className="flex items-center gap-2
                                     bg-red-600 hover:bg-red-700
                                     text-white px-4 py-2 rounded-lg"
                        >
                          <Trash2 size={16}/>
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* ===========================
                MOBILE CARDS
          ============================ */}

          <div className="lg:hidden p-4 space-y-4">

            {superAdmins.map((admin) => (

              <div
                key={admin._id}
                className="border rounded-2xl p-5 shadow-sm bg-white"
              >

                <div className="space-y-2">

                  <h3 className="text-lg font-bold">
                    {admin.division}
                  </h3>

                  <p>
                    <span className="font-semibold">
                      Super Admin :
                    </span>{" "}
                    {admin.name}
                  </p>

                  <p>
                    <span className="font-semibold">
                      PF :
                    </span>{" "}
                    {admin.pfNo}
                  </p>

                  <div>

                    <p className="font-semibold mb-2">
                      Assigned Depots
                    </p>

                    <div className="flex flex-wrap gap-2">

                      {admin.assignedDepots.map((depot) => (

                        <span
                          key={depot}
                          className="bg-blue-100 text-blue-700
                                     px-3 py-1 rounded-full text-xs"
                        >
                          {depot}
                        </span>

                      ))}

                    </div>

                  </div>

                </div>

                <div className="grid grid-cols-3 gap-3 mt-5">

                  <button
                    onClick={() => switchDashboard(admin._id)}
                    className="bg-blue-600 text-white py-2 rounded-lg"
                  >
                    View
                  </button>

                  <button
                    onClick={() => editAdmin(admin)}
                    className="bg-green-600 text-white py-2 rounded-lg"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteAdmin(admin._id)}
                    className="bg-red-600 text-white py-2 rounded-lg"
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>

    <Footer />

    </>

  );

}

/* =====================================
        SUMMARY CARD
===================================== */

function SummaryCard({

  title,

  value,

  icon,

  color

}) {

  const colors = {

    blue: "bg-blue-100 text-blue-700",

    green: "bg-green-100 text-green-700",

    purple: "bg-purple-100 text-purple-700",

    amber: "bg-amber-100 text-amber-700",

    red: "bg-red-100 text-red-700"

  };

  return (

    <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-500 font-medium">
            {title}
          </p>

          <h2 className="text-4xl font-bold mt-2 text-slate-800">
            {value || 0}
          </h2>

        </div>

        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center ${colors[color]}`}
        >
          {icon}
        </div>

      </div>

    </div>

  );

}