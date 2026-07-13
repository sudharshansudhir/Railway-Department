import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";
import { Calendar, Layers } from "lucide-react";
import Footer from "../components/Footer";

/* ================= SCHEDULE CALCULATOR ================= */
const calculateSchedule = (start, end) => {
  if (!start || !end) return "";

  const startDate = new Date(start);
  const endDate = new Date(end);

  // ❌ End date must be after start date
  if (endDate <= startDate) {
    return "";
  }

  let months =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());

  // Adjust if end day is earlier than start day
  if (endDate.getDate() < startDate.getDate()) {
    months--;
  }

  if (months < 1) return "1 Month";

  if (months === 12) return "1 Year";

  if (months === 24) return "2 Years";

  if (months % 12 === 0) {
    return `${months / 12} Years`;
  }

  return `${months} Months`;
};


export default function DriverLR() {
  const [lrList, setLrList] = useState([]);
  
  const DEPOTS = [
  "PTJ",
  "PGT",
  "POY",
  "ED",
  "CBE",
  "MTP",
  "SA",
  "JTJ",
  "KRR",
  "TPJ",
  "DG",
  "MTDM",
  "VRI",
  "DPJ"
];

const [lr, setLr] = useState({
  startDepot: "",
  endDepot: "",
  doneDate: "",
  dueDate: ""
});
  const [saving, setSaving] = useState(false);

  /* ================= LOAD LR HISTORY ================= */
useEffect(() => {

  const loadLR = async () => {

    try {

      const res = await api.get("/driver/profile");

      const lrData = res.data.profile?.lrDetails || [];

      setLrList(lrData);

      const today = new Date();
      today.setHours(0,0,0,0);

      const overdue = [];

      const warning = [];

      lrData.forEach(item => {

        if (!item.dueDate) return;

        const due = new Date(item.dueDate);

        due.setHours(0,0,0,0);

        const diffDays = Math.ceil(
          (due - today) /
          (1000 * 60 * 60 * 24)
        );

        if (diffDays < 0) {

          overdue.push({
            ...item,
            days: Math.abs(diffDays)
          });

        }

        else if (diffDays <= 3) {

          warning.push({
            ...item,
            days: diffDays
          });

        }

      });

      // -----------------------
      // OVERDUE ALERT
      // -----------------------

      if (overdue.length > 0) {

        Swal.fire({

          icon:"error",

          title:"⚠️ LR Overdue",

          html:`

            <div style="text-align:left">

            ${overdue.map(lr=>`

              <p>

              <b>${lr.section}</b><br>

              Overdue by
              <b>${lr.days} day(s)</b><br>

              Due Date :
              ${lr.dueDate.substring(0,10)}

              </p>

              <hr>

            `).join("")}

            </div>

          `,

          confirmButtonColor:"#dc2626"

        });

      }

      // -----------------------
      // WARNING ALERT
      // -----------------------

      else if (warning.length > 0) {

        Swal.fire({

          icon:"warning",

          title:"⚠️ LR Expiring Soon",

          html:`

            <div style="text-align:left">

            ${warning.map(lr=>`

              <p>

              <b>${lr.section}</b><br>

              Expires in
              <b>${lr.days} day(s)</b><br>

              Due Date :
              ${lr.dueDate.substring(0,10)}

              </p>

              <hr>

            `).join("")}

            </div>

          `,

          confirmButtonColor:"#f59e0b"

        });

      }

    }

    catch(err){

      console.log(err);

    }

  };

  loadLR();

}, []);
  /* ================= SAVE NEW LR ================= */
  const save = async () => {
    if (
  !lr.startDepot ||
  !lr.endDepot ||
  !lr.doneDate ||
  !lr.dueDate
){
      Swal.fire("Missing Info", "Section, Done & Due Date required", "warning");
      return;
    }

    // ✅ Calculate schedule ONLY on submit
    const schedule = calculateSchedule(lr.doneDate, lr.dueDate);

    if (!schedule) {
      Swal.fire("Invalid Dates", "Due Date must be after Done Date", "warning");
      return;
    }

    try {
      setSaving(true);
const payload = {
  section: `${lr.startDepot}-${lr.endDepot}`,
  doneDate: lr.doneDate,
  dueDate: lr.dueDate,
  schedule
};

      const res = await api.put("/driver/profile/lr", {
        lrDetails: payload
      });

      setLrList(res.data.lrDetails);
      setLr({
  startDepot: "",
  endDepot: "",
  doneDate: "",
  dueDate: ""
});

      Swal.fire("Saved", "LR entry added successfully", "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.msg || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 px-4 py-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6">

          <h2 className="text-xl font-bold text-center mb-6">
            LR (Road Learning) Details
          </h2>

          {/* 🔥 EXISTING LR LIST */}
          {lrList.map((item, idx) => (
            <div
              key={idx}
              className="border rounded-xl p-4 mb-4 bg-slate-50"
            >
              <p className="font-semibold flex items-center gap-2">
                <Layers /> {item.section}
              </p>
              <p className="text-sm">
                Done: {item.doneDate?.substring(0, 10)} | Due: {item.dueDate?.substring(0, 10)}
              </p>
              <p className="text-xs text-gray-500">
                Schedule: {item.schedule || "-"}
              </p>
            </div>
          ))}

          {/* 🔥 ADD NEW LR */}
          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

  <div>
    <label className="text-sm font-semibold">
      Start station
    </label>

    <select
      value={lr.startDepot}
      onChange={(e) =>
        setLr(prev => ({
          ...prev,
          startDepot: e.target.value
        }))
      }
      className="w-full border rounded-lg px-4 py-2"
    >
      <option value="">
        Select Start station
      </option>

      {DEPOTS.map(d => (
        <option key={d}>
          {d}
        </option>
      ))}

    </select>
  </div>

  <div>

    <label className="text-sm font-semibold">
      End Station
    </label>

    <select
      value={lr.endDepot}
      onChange={(e) =>
        setLr(prev => ({
          ...prev,
          endDepot: e.target.value
        }))
      }
      className="w-full border rounded-lg px-4 py-2"
    >
      <option value="">
        Select End Station
      </option>

      {DEPOTS.map(d => (
        <option key={d}>
          {d}
        </option>
      ))}

    </select>

  </div>

</div>

            <DateField
              label="Done Date"
              value={lr.doneDate}
              onChange={v =>
                setLr(prev => ({ ...prev, doneDate: v }))
              }
            />

            <DateField
              label="Due Date"
              value={lr.dueDate}
              onChange={v =>
                setLr(prev => ({ ...prev, dueDate: v }))
              }
            />

            {/* Schedule shown ONLY after save (read-only conceptually) */}
            {/* <Input
              label="Schedule (auto on submit)"
              value=""
              disabled
            /> */}

            <button
              onClick={save}
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold"
            >
              {saving ? "Saving..." : "Add LR Entry"}
            </button>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}

/* ================= UI ================= */

function Input({ label, value, onChange, disabled }) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <input
        value={value}
        disabled={disabled}
        onChange={e => onChange?.(e.target.value)}
        className="w-full border px-4 py-2 rounded-lg
                   disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1 flex items-center gap-1">
        <Calendar size={14} /> {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 border rounded-lg text-sm
                   focus:ring-2 focus:ring-emerald-600 focus:outline-none"
      />
    </div>
  );
}
