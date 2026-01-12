import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

import DriverDashboard from "./pages/DriverDashboard";
import DailyActivity from "./pages/DailyActivity";
import DriverProfile from "./pages/DriverProfile";
import DriverHealth from "./pages/DriverHealth";
import DriverLR from "./pages/DriverLR";

import DepotManagerDashboard from "./pages/DepotManagerDashboard";
import DriverDetails from "./pages/DriverDetails";

import AdminDashboard from "./pages/AdminDashboard";
import AdminCircularUpload from "./pages/AdminCircularUpload";
import AdminReportDownload from "./pages/AdminReportDownload";

import CircularList from "./pages/CircularList";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRegister from "./pages/AdminRegister";

export default function App() {
  return (
    <Routes>

      {/* ================= LOGIN ================= */}
      <Route path="/" element={<Login />} />

      {/* ================= DRIVER ================= */}
      <Route
        path="/driver"
        element={
          <ProtectedRoute role="DRIVER">
            <DriverDashboard />
          </ProtectedRoute>
        }
      />

      <Route
  path="/admin/register"
  element={<AdminRegister />}
/>


      <Route
        path="/driver/daily"
        element={
          <ProtectedRoute role="DRIVER">
            <DailyActivity />
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver/profile"
        element={
          <ProtectedRoute role="DRIVER">
            <DriverProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver/health"
        element={
          <ProtectedRoute role="DRIVER">
            <DriverHealth />
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver/lr"
        element={
          <ProtectedRoute role="DRIVER">
            <DriverLR />
          </ProtectedRoute>
        }
      />

      {/* ================= DEPOT MANAGER ================= */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute role="DEPOT_MANAGER">
            <DepotManagerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/driver/:driverId"
        element={
          <ProtectedRoute role="DEPOT_MANAGER">
            <DriverDetails />
          </ProtectedRoute>
        }
      />

      {/* ================= SUPER ADMIN ================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="SUPER_ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/circular-upload"
        element={
          <ProtectedRoute role="SUPER_ADMIN">
            <AdminCircularUpload />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/report-download"
        element={
          <ProtectedRoute role="SUPER_ADMIN">
            <AdminReportDownload />
          </ProtectedRoute>
        }
      />

      {/* ================= CIRCULARS (ALL ROLES) ================= */}
      <Route
        path="/circulars"
        element={
          <ProtectedRoute>
            <CircularList />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}
