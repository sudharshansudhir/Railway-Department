import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import {
  User,
  HeartPulse,
  FileText,
  ClipboardList,
  AlertTriangle,
  CheckSquare,
  ScrollText
} from "lucide-react";
import Swal from "sweetalert2";
import Footer from "../components/Footer";

export default function DriverDashboard() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);

  /* ================= T-CARD TEMPLATE ================= */
  const checklistTemplate = [
    "Check Diesel level",
    "Drain water sediments fuel filter",
    "Check engine oil level and top up if necessary",
    "Check fuel, oil, water and exhaust leak",
    "Check air cleaner oil level",
    "Check air line leak",
    "Fill radiator tank with treated water if necessary",
    "Clean compressor breather",
    "Drain air receiver tank and close drain cock",
    "Clean crank case breather",
    "Start engine and note oil pressure",
    "Record oil pressure and brake pressure"
  ];

  /* ================= T-CARD POPUP ================= */
  const openTCardPopup = async () => {
    const items = checklistTemplate.map(d => ({
      description: d,
      checked: false,
      remarks: ""
    }));

    let tCarNo = "";

    const { value } = await Swal.fire({
      title: "Daily T-Card Checklist",
      width: 900,
      showCancelButton: true,
      confirmButtonText: "Submit Checklist",
      html: `
        <input id="tcar" class="swal2-input"
          placeholder="T Car No (e.g. PTJ / SR 210067)" />

        <div style="text-align:left; max-height:400px; overflow:auto;">
          ${items
            .map(
              (i, idx) => `
            <div style="margin-bottom:12px;">
              <input type="checkbox" id="chk${idx}" />
              <b>${i.description}</b><br/>
              <input id="rem${idx}" class="swal2-input"
                placeholder="Remarks (optional)" />
            </div>
          `
            )
            .join("")}
        </div>
      `,
      preConfirm: () => {
        tCarNo = document.getElementById("tcar").value.trim();

        if (!tCarNo) {
          Swal.showValidationMessage("T Car No is required");
          return;
        }

        return items.map((i, idx) => ({
          description: i.description,
          checked: document.getElementById(`chk${idx}`).checked,
          remarks: document.getElementById(`rem${idx}`).value
        }));
      }
    });

    if (!value) return;

    /* ================= API SAVE ================= */
    try {
      await api.post("/driver/tcard", {
        tCarNo,
        items: value
      });

      await Swal.fire({
        icon: "success",
        title: "Checklist Saved",
        text: "Daily T-Card checklist submitted successfully",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text:
          err.response?.data?.msg ||
          "Unable to save checklist. Please try again."
      });
    }
  };

  /* ================= ALERTS ================= */
  useEffect(() => {
    api.get("/driver/alerts").then(res => setAlerts(res.data));
  }, []);

  /* ================= DUTY STATUS ================= */
  useEffect(() => {
    api.get("/driver/duty-status").then(res => {
      if (res.data.status === "INCOMPLETE") {
        Swal.fire({
          icon: "warning",
          title: "Previous Duty Not Completed",
          text: "Please complete sign-out or contact supervisor.",
          confirmButtonColor: "#dc2626"
        });
      }

      if (res.data.status === "COMPLETED") {
        Swal.fire({
          icon: "success",
          title: "Duty Completed",
          text: "Yesterday’s duty was completed successfully.",
          timer: 1400,
          showConfirmButton: false
        });
      }
    });
  }, []);

  const hasTrainingAlert = alerts.some(a => a.type === "TRAINING");
  const hasLRAlert = alerts.some(a => a.type === "LR");

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 px-4 py-6">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-2xl font-bold mb-1">
            Tower Wagon Driver Dashboard
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Duty, compliance & safety checklist overview
          </p>

          {/* STATUS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatusCard
              title="Training"
              status={hasTrainingAlert ? "Overdue" : "Valid"}
              color={hasTrainingAlert ? "red" : "green"}
            />
            <StatusCard
              title="LR"
              status={hasLRAlert ? "Overdue" : "Valid"}
              color={hasLRAlert ? "red" : "green"}
            />
            <div className="bg-white p-4 rounded-xl shadow flex gap-3 items-center">
              <AlertTriangle className="text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Alerts</p>
                <p className="font-semibold">
                  {alerts.length || "No"} Active
                </p>
              </div>
            </div>
          </div>

          {/* CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            <Card title="Bio Data" icon={<User />} onClick={() => navigate("/driver/profile")} />
            <Card title="Health / Training" icon={<HeartPulse />} onClick={() => navigate("/driver/health")} />
            <Card title="LR Details" icon={<FileText />} onClick={() => navigate("/driver/lr")} />
            <Card title="Mileage Details" icon={<ClipboardList />} onClick={() => navigate("/driver/daily")} />

            <Card
              title="Daily T-Card Checklist"
              icon={<CheckSquare />}
              onClick={openTCardPopup}
            />

            <Card
              title="Circulars"
              icon={<ScrollText />}
              onClick={() => navigate("/circulars")}
            />
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}

/* ================= COMPONENTS ================= */

function StatusCard({ title, status, color }) {
  return (
    <div className={`bg-white p-4 rounded-xl shadow border-l-4 border-${color}-600`}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`font-semibold text-${color}-700`}>{status}</p>
    </div>
  );
}

function Card({ title, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white p-6 rounded-2xl shadow
                 hover:shadow-xl hover:-translate-y-1 transition"
    >
      <div className="w-12 h-12 bg-blue-100 text-blue-700
                      flex items-center justify-center rounded-xl">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
    </div>
  );
}
