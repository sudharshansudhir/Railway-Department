import { useState, useEffect } from "react";
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
  FileText,
  CheckSquare
} from "lucide-react";

import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const PDFJS_WORKER_URL =
  "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const role = localStorage.getItem("role");

  const [viewCircular, setViewCircular] = useState(null);

  useEffect(() => {
    if (role === "SUPER_ADMIN") return;

    const checkNewCircular = async () => {
      try {
        const res = await api.get("/admin/circulars");
        if (!res.data.length) return;

        const latest = res.data[0];
        const lastSeen = localStorage.getItem("lastSeenCircularId");
        if (lastSeen === latest._id) return;

        const result = await Swal.fire({
          icon: "info",
          title: "New Circular Published",
          html: `
            <p class="mb-2"><strong>${latest.title}</strong></p>
            <p>Please view and acknowledge the circular.</p>
          `,
          showCancelButton: true,
          showDenyButton: true,
          confirmButtonText: "View",
          denyButtonText: "Download",
          cancelButtonText: "Later",
          confirmButtonColor: "#4f46e5",
          denyButtonColor: "#059669",
          cancelButtonColor: "#6b7280"
        });

        if (result.isConfirmed) {
          setViewCircular(latest);

          await api.post(`/admin/circulars/${latest._id}/acknowledge`);
          localStorage.setItem("lastSeenCircularId", latest._id);

          Swal.fire({
            icon: "success",
            title: "Acknowledged",
            text: "Circular marked as read",
            timer: 1200,
            showConfirmButton: false
          });
        } else if (result.isDenied) {
          const link = document.createElement("a");
          link.href = latest.pdfUrl;
          link.download = latest.originalFilename || "circular.pdf";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (err) {
        console.error("Circular check failed", err);
      }
    };

    checkNewCircular();
  }, [role]);

  const logout = async () => {
    if (role === "DRIVER") {
      try {
        const res = await api.get("/driver/active-duty");
        if (res.data.active) {
          await Swal.fire({
            icon: "warning",
            title: "Active Duty In Progress",
            text: "Please complete Sign-Out to logout.",
            confirmButtonColor: "#dc2626"
          });
          navigate("/driver/daily");
          return;
        }
      } catch {
        return;
      }
    }

    const confirm = await Swal.fire({
      title: "Logout?",
      text: "You will be signed out",
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

  const NavButton = ({ to, icon, label }) => (
    <button
      onClick={() => {
        navigate(to);
        setOpen(false);
      }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition w-full
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

  const RoleButtons = () => (
    <>
      {role === "DRIVER" && (
        <>
          <NavButton to="/driver" icon={<User />} label="Dashboard" />
          <NavButton to="/driver/daily" icon={<ClipboardList />} label="Mileage Details" />
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
          <NavButton to="/admin/circular-status" icon={<CheckSquare />} label="Circular Status" />
          <NavButton to="/admin/report-download" icon={<ClipboardList />} label="Reports" />
        </>
      )}
    </>
  );

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-[1000]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            <div className="flex items-center gap-2">
              <Train className="text-indigo-600" />
              <span className="font-bold text-sm md:text-lg text-gray-800">
                Tower Wagon Driver Management system
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
              <RoleButtons />
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

            {/* Mobile Toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden bg-white border-t shadow-lg px-4 py-3 space-y-2">
            <RoleButtons />
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

      {/* PDF VIEW MODAL */}
      {viewCircular && (
        <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-2">
          <div className="bg-white w-full mx-6 max-w-5xl h-[80vh] rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 md:p-4 border-b">
              <p className="font-medium text-sm md:text-base truncate">
                {viewCircular.title}
              </p>
              <button onClick={() => setViewCircular(null)}>
                <X />
              </button>
            </div>

            <div className="h-[calc(100%-56px)]">
              <Worker workerUrl={PDFJS_WORKER_URL}>
                <Viewer
                  fileUrl={viewCircular.pdfUrl}
                  defaultScale={SpecialZoomLevel.PageFit}
                />
              </Worker>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
