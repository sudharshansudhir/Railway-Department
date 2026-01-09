import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";
import { FileText, Calendar, AlertTriangle, Layers } from "lucide-react";

export default function DriverLR() {
  const [lr, setLr] = useState({
    section: "",
    doneDate: "",
    dueDate: "",
    schedule: ""
  });

  const [saving, setSaving] = useState(false);

  /* ================= LOAD LR ================= */
  useEffect(() => {
    api.get("/driver/profile").then(res => {
      setLr(res.data.profile?.lrDetails || {});
    });
  }, []);

  /* ================= SAVE ================= */
  const save = async () => {
    if (!lr.section || !lr.doneDate || !lr.dueDate) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "LR Section, Done Date and Due Date are mandatory",
      });
      return;
    }

    try {
      setSaving(true);

      await api.put("/driver/profile/lr", {
        lrDetails: lr
      });

      Swal.fire({
        icon: "success",
        title: "LR Details Saved",
        text: "Road Learning compliance updated successfully",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire("Error", err.response?.data?.msg || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const isOverdue =
    lr.dueDate && new Date(lr.dueDate) < new Date();

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 px-4 py-6">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">

          {/* HEADER */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <div className="p-3 rounded-full bg-indigo-100">
                <FileText className="text-indigo-700" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              LR (Road Learning) Details
            </h2>
            <p className="text-sm text-gray-500">
              Mandatory road learning compliance
            </p>
          </div>

          {/* STATUS */}
          {lr.dueDate && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center gap-3
                ${
                  isOverdue
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
            >
              <AlertTriangle />
              <p className="text-sm font-medium">
                {isOverdue
                  ? "LR overdue. Driver not eligible for duty."
                  : `LR valid till ${lr.dueDate.substring(0, 10)}`}
              </p>
            </div>
          )}

          {/* FORM */}
          <div className="space-y-5">

            {/* LR SECTION */}
            <InputField
              label="LR Section"
              icon={<Layers />}
              placeholder="Section / Route Name"
              value={lr.section || ""}
              onChange={v => setLr({ ...lr, section: v })}
            />

            <DateField
              label="LR Done Date"
              icon={<Calendar />}
              value={lr.doneDate?.substring(0, 10) || ""}
              onChange={v => setLr({ ...lr, doneDate: v })}
            />

            <DateField
              label="LR Due Date"
              icon={<Calendar />}
              value={lr.dueDate?.substring(0, 10) || ""}
              onChange={v => setLr({ ...lr, dueDate: v })}
            />

            <InputField
              label="Schedule"
              placeholder="Annual / 6 Months"
              value={lr.schedule || ""}
              onChange={v => setLr({ ...lr, schedule: v })}
            />

            <button
              onClick={save}
              disabled={saving}
              className={`w-full py-2.5 rounded-xl font-semibold text-white transition
                ${
                  saving
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
            >
              {saving ? "Saving..." : "Save LR Details"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ================= INPUTS ================= */

function InputField({ label, value, onChange, placeholder, icon }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-gray-400">
          {icon}
        </span>
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm"
        />
      </div>
    </div>
  );
}

function DateField({ label, icon, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-gray-400">
          {icon}
        </span>
        <input
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm"
        />
      </div>
    </div>
  );
}
