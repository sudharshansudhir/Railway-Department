import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";
import { FileText, Calendar, Layers } from "lucide-react";
import Footer from "../components/Footer";

export default function DriverLR() {

  const [lrList, setLrList] = useState([]);
  const [lr, setLr] = useState({
    section: "",
    doneDate: "",
    dueDate: "",
    schedule: ""
  });
  const [saving, setSaving] = useState(false);

  /* ================= LOAD LR HISTORY ================= */
  useEffect(() => {
    api.get("/driver/profile").then(res => {
      setLrList(res.data.profile?.lrDetails || []);
    });
  }, []);

  /* ================= SAVE NEW LR ================= */
  const save = async () => {
    if (!lr.section || !lr.doneDate || !lr.dueDate) {
      Swal.fire("Missing Info", "Section, Done & Due Date required", "warning");
      return;
    }

    try {
      setSaving(true);

      const res = await api.put("/driver/profile/lr", {
        lrDetails: lr
      });

      setLrList(res.data.lrDetails);
      setLr({ section: "", doneDate: "", dueDate: "", schedule: "" });

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
            <Input label="Section" value={lr.section} onChange={v => setLr({ ...lr, section: v })} />
            <Date label="Done Date" value={lr.doneDate} onChange={v => setLr({ ...lr, doneDate: v })} />
            <Date label="Due Date" value={lr.dueDate} onChange={v => setLr({ ...lr, dueDate: v })} />
            <Input label="Schedule" value={lr.schedule} onChange={v => setLr({ ...lr, schedule: v })} />

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
      <Footer/>
    </>
  );
}

/* ================= UI ================= */

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border px-4 py-2 rounded-lg"
      />
    </div>
  );
}

function Date({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-semibold flex gap-1 items-center">
        <Calendar size={14} /> {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border px-4 py-2 rounded-lg"
      />
    </div>
  );
}
