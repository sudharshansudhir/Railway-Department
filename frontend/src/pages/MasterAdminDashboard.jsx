import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Swal from "sweetalert2";
import api from "../api/axios";
import {
  Crown,
  UserPlus,
  IdCard,
  User,
  MapPin,
  Building2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Users
} from "lucide-react";

const DISTRICT_OPTIONS = [
  "Salem",
  "Erode",
  "Palakkad",
  "Madurai",
  "Thrissur"
];

export default function MasterAdminDashboard() {
  const navigate = useNavigate();

  const [superAdmins, setSuperAdmins] = useState([]);
  const [pfNo, setPfNo] = useState("");
  const [name, setName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [selectedDistrictNav, setSelectedDistrictNav] = useState("");
  const [loading, setLoading] = useState(false);

  const loadSuperAdmins = async () => {
    try {
      const res = await api.get("/admin/super-admins");
      setSuperAdmins(res.data);
    } catch (err) {
      console.error("Failed to load super admins:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load super admins from database.",
      });
    }
  };

  useEffect(() => {
    loadSuperAdmins();
  }, []);

  // Derived registered districts list
  const registeredDistricts = superAdmins.map((sa) => sa.districtName);

  /* ================= REGISTER SUPER ADMIN ================= */
  const handleRegisterUser = async () => {
    if (!pfNo.trim() || !name.trim() || !districtName) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in PF Number, Name, and select a District.",
        confirmButtonColor: "#0b659a"
      });
      return;
    }

    // District Validation: Check whether the selected district already has a Super Admin
    const existingSA = superAdmins.find(
      (sa) => sa.districtName?.toLowerCase() === districtName.toLowerCase()
    );

    if (existingSA) {
      Swal.fire({
        icon: "error",
        title: "District Already Assigned",
        text: "A Super Admin is already registered for this district.",
        confirmButtonColor: "#dc2626"
      });
      return;
    }

    setLoading(true);

    try {
      await api.post("/admin/register", {
        pfNo: pfNo.trim(),
        name: name.trim(),
        role: "SUPER_ADMIN",
        depotName: districtName, // Passed as depotName to match backend schema
      });

      Swal.fire({
        icon: "success",
        title: "Super Admin Registered",
        text: `Super Admin ${name} successfully assigned to ${districtName} district.`,
        timer: 2000,
        showConfirmButton: false
      });

      // Clear form
      setPfNo("");
      setName("");
      setDistrictName("");
      
      // Reload the list from the database
      loadSuperAdmins();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: err.response?.data?.msg || "Failed to register super admin.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= NAVIGATE TO SUPER ADMIN ================= */
  const handleNavigateToSuperAdmin = (district) => {
    if (!district) return;
    localStorage.setItem("active_super_admin_district", district);
    navigate("/admin");
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#F8FAFC] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* ================= HEADER ================= */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 flex-shrink-0">
                <Crown size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                    Master Admin Portal
                  </h1>
                  <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Head of Super Admins
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                  Southern Railway • Centralized Super Admin Management & District Administration
                </p>
              </div>
            </div>
          </div>

          {/* ================= STATS SUMMARY ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-slate-100 text-[#0b659a] rounded-2xl">
                <ShieldCheck size={26} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Registered Super Admins
                </p>
                <p className="text-3xl font-bold text-slate-800">{superAdmins.length}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                <MapPin size={26} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Active Admin Districts
                </p>
                <p className="text-3xl font-bold text-slate-800">{registeredDistricts.length}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Building2 size={26} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Available Districts
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  {DISTRICT_OPTIONS.length - registeredDistricts.length} / {DISTRICT_OPTIONS.length}
                </p>
              </div>
            </div>
          </div>

          {/* ================= MAIN CONTENT GRID ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* 1. REGISTER SUPER ADMIN FORM (Left Column - 5 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="p-2.5 bg-blue-50 text-[#0b659a] rounded-xl">
                    <UserPlus size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Register Super Admin</h2>
                    <p className="text-xs text-slate-500 font-medium">Create a new Super Admin for a district</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* PF NUMBER */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      PF Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400">
                        <IdCard size={18} />
                      </span>
                      <input
                        type="text"
                        placeholder="Enter PF Number"
                        value={pfNo}
                        onChange={(e) => setPfNo(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0b659a] focus:border-[#0b659a] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* NAME */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Name
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400">
                        <User size={18} />
                      </span>
                      <input
                        type="text"
                        placeholder="Enter Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0b659a] focus:border-[#0b659a] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* DISTRICT NAME DROPDOWN */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      District Name
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400">
                        <MapPin size={18} />
                      </span>
                      <select
                        value={districtName}
                        onChange={(e) => setDistrictName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0b659a] focus:border-[#0b659a] focus:outline-none transition cursor-pointer"
                      >
                        <option value="">Select District</option>
                        {DISTRICT_OPTIONS.map((district) => {
                          const isAssigned = registeredDistricts.includes(district);
                          return (
                            <option key={district} value={district}>
                              {district} {isAssigned ? "(Super Admin Assigned)" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* REGISTER USER BUTTON */}
                  <button
                    onClick={handleRegisterUser}
                    disabled={loading}
                    className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-sm flex items-center justify-center gap-2 mt-4 ${
                      loading
                        ? "bg-[#0b659a]/60 cursor-not-allowed"
                        : "bg-[#0b659a] hover:bg-[#0f82c5] active:scale-[0.99] hover:shadow-md"
                    }`}
                  >
                    <UserPlus size={18} />
                    {loading ? "Registering User..." : "Register User"}
                  </button>
                </div>
              </div>
            </div>

            {/* 2. DISTRICT DROPDOWN NAVIGATION & REGISTERED LIST (Right Column - 7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* NAVIGATE TO SUPER ADMIN DASHBOARD CARD */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <ExternalLink size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Navigate to Super Admin</h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Select a district to view its corresponding Super Admin dashboard
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-3 text-slate-400">
                      <Building2 size={18} />
                    </span>
                    <select
                      value={selectedDistrictNav}
                      onChange={(e) => {
                        setSelectedDistrictNav(e.target.value);
                        handleNavigateToSuperAdmin(e.target.value);
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0b659a] focus:border-[#0b659a] focus:outline-none transition cursor-pointer"
                    >
                      <option value="">-- Select Super Admin District --</option>
                      {superAdmins.map((sa) => (
                        <option key={sa.id} value={sa.districtName}>
                          {sa.districtName} Division ({sa.name} - {sa.pfNo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleNavigateToSuperAdmin(selectedDistrictNav)}
                    disabled={!selectedDistrictNav}
                    className={`px-6 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                      selectedDistrictNav
                        ? "bg-[#0b659a] hover:bg-[#0f82c5] text-white shadow-sm hover:shadow-md cursor-pointer"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Go to Dashboard
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>

              {/* REGISTERED SUPER ADMINS TABLE */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-100 text-[#0b659a] rounded-xl">
                      <Users size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Registered Super Admins ({superAdmins.length})
                    </h3>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-[#0b659a]/5 border-b border-[#0b659a]/10 text-[#0b659a] font-semibold">
                      <tr>
                        <th className="px-6 py-4">PF Number</th>
                        <th className="px-6 py-4">Super Admin Name</th>
                        <th className="px-6 py-4">Assigned District</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {superAdmins.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">
                            No Super Admins registered yet.
                          </td>
                        </tr>
                      ) : (
                        superAdmins.map((sa) => (
                          <tr key={sa.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4 font-mono font-medium text-slate-700">
                              {sa.pfNo}
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-800">
                              {sa.name}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0b659a] border border-blue-100">
                                <CheckCircle2 size={12} />
                                {sa.districtName}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleNavigateToSuperAdmin(sa.districtName)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-[#0b659a] rounded-lg hover:bg-[#0b659a] hover:text-white hover:border-[#0b659a] transition-all shadow-sm"
                              >
                                View District
                                <ExternalLink size={12} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}
