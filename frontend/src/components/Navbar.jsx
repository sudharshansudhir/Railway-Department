import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/axios";
import {
  Menu,
  X,
  LogOut,
  Train,
  User,
  ClipboardList,
  Shield,
  Users,
  FileText
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const role = localStorage.getItem("role");

  /* ================= LOGOUT SAFETY ================= */

const logout = async () => {
  if (role === "DRIVER") {
    try {
      const res = await api.get("/driver/active-duty");

      if (res.data.active) {
        await Swal.fire({
          icon: "warning",
          title: "Active Duty In Progress",
          text: "Please complete Sign-Out (KM / Hours / Mileage) to logout.",
          confirmButtonColor: "#dc2626"
        });

        // 🔁 FORCE REDIRECT TO DAILY ACTIVITY
        navigate("/driver/daily");
        return;
      }
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text: "Unable to verify duty status. Logout blocked for safety.",
      });
      return;
    }
  }

  const confirm = await Swal.fire({
    title: "Logout?",
    text: "You will be signed out of the system",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Logout",
  });

  if (confirm.isConfirmed) {
    localStorage.clear();
    navigate("/");
  }
};


  /* ================= NAV BUTTON ================= */

  const NavButton = ({ to, icon, label }) => (
    <button
      onClick={() => {
        navigate(to);
        setOpen(false);
      }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition
        ${
          location.pathname === to
            ? "bg-indigo-600 text-white"
            : "text-gray-700 hover:bg-slate-100"
        }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">

        {/* TOP BAR */}
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <div
            className="flex items-center gap-2 "
          >
            <Train className="text-indigo-600" />
            <span className="font-bold text-lg text-gray-800">
              Tower Wagon Driver Management system
            </span>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-2">

            {/* DRIVER */}
            {role === "DRIVER" && (
              <>
                <NavButton to="/driver" icon={<User size={18} />} label="Dashboard" />
                <NavButton to="/driver/daily" icon={<ClipboardList size={18} />} label="Mileage Details" />
                <NavButton to="/circulars" icon={<FileText size={18} />} label="Circulars" />
              </>
            )}

            {/* DEPOT MANAGER */}
            {role === "DEPOT_MANAGER" && (
              <>
                <NavButton to="/manager" icon={<Users size={18} />} label="Drivers" />
                <NavButton to="/circulars" icon={<FileText size={18} />} label="Circulars" />
              </>
            )}

            {/* SUPER ADMIN */}
            {role === "SUPER_ADMIN" && (
              <>
                <NavButton to="/admin" icon={<Shield size={18} />} label="Dashboard" />
                <NavButton to="/admin/circular-upload" icon={<FileText size={18} />} label="Upload Circular" />
                <NavButton to="/admin/report-download" icon={<ClipboardList size={18} />} label="Reports" />
                <NavButton to="/circulars" icon={<FileText size={18} />} label="View Circulars" />
              </>
            )}

            {/* LOGOUT */}
            <button
              onClick={logout}
              className="ml-4 flex items-center gap-2 px-3 py-2 rounded-lg
                         text-sm font-medium bg-red-50 text-red-600
                         hover:bg-red-100 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-white border-t px-4 py-3 space-y-2">

          {role === "DRIVER" && (
            <>
              <NavButton to="/driver" icon={<User />} label="Dashboard" />
              <NavButton to="/driver/daily" icon={<ClipboardList />} label="Daily Activity" />
              <NavButton to="/circulars" icon={<FileText />} label="Circulars" />
            </>
          )}

          {role === "DEPOT_MANAGER" && (
            <>
              <NavButton to="/manager" icon={<Users />} label="Drivers" />
              <NavButton to="/circulars" icon={<FileText />} label="Circulars" />
            </>
          )}

          {role === "SUPER_ADMIN" && (
            <>
              <NavButton to="/admin" icon={<Shield />} label="Dashboard" />
              <NavButton to="/admin/circular-upload" icon={<FileText />} label="Upload Circular" />
              <NavButton to="/admin/report-download" icon={<ClipboardList />} label="Reports" />
              <NavButton to="/circulars" icon={<FileText />} label="View Circulars" />
            </>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                       text-sm font-medium bg-red-50 text-red-600
                       hover:bg-red-100 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
