import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import DriverDashboard from "./pages/DriverDashboard";
import BioData from "./pages/BioData";
import Checks from "./pages/Checks";
import LRDetails from "./pages/LRDetails";
import DailyActivity from "./pages/DailyActivity";
import DailyActivityHistory from "./pages/DailyActivityHistory";
import DepotManagerDashboard from "./pages/DepotManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/driver" element={<DriverDashboard />} />
      <Route path="/driver/biodata" element={<BioData />} />
      <Route path="/driver/checks" element={<Checks />} />
      <Route path="/driver/lr" element={<LRDetails />} />
      <Route path="/driver/daily" element={<DailyActivity />} />
      <Route path="/driver/daily-history" element={<DailyActivityHistory />} />

      <Route path="/manager" element={<DepotManagerDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}
