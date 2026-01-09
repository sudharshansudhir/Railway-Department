import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";
import { HeartPulse, Calendar, ClipboardCheck } from "lucide-react";

export default function DriverHealth() {
  const [training, setTraining] = useState({
    section: "",
    doneDate: "",
    dueDate: "",
    schedule: ""
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD EXISTING DATA ================= */
  useEffect(() => {
    api.get("/driver/profile")
      .then(res => {
        const existingTraining = res.data?.profile?.training;

        if (existingTraining) {
          setTraining({
            section: existingTraining.section || "",
            doneDate: existingTraining.doneDate
              ? existingTraining.doneDate.substring(0, 10)
              : "",
            dueDate: existingTraining.dueDate
              ? existingTraining.dueDate.substring(0, 10)
              : "",
            schedule: existingTraining.schedule || ""
          });
        }
      })
      .catch(() => {
        Swal.fire("Error", "Unable to load training data", "error");
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= SAVE ================= */
  const save = async () => {
    if (!training.section || !training.doneDate || !training.dueDate) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Details",
        text: "Section, Done Date & Due Date are mandatory",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    try {
      setSaving(true);

      await api.put("/driver/profile/training", {
        training: {
          ...training
        }
      });

      Swal.fire({
        icon: "success",
        title: "Training Updated",
        text: "Training details saved successfully",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: "Unable to save training details",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setSaving(false);
    }
  };

  const isOverdue =
    training.dueDate &&
    new Date(training.dueDate) < new Date();

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Loading training details...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 px-4 py-6">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">

          {/* HEADER */}
          <div className="mb-6 text-center">
            <div className="flex justify-center mb-2">
              <div className="p-3 rounded-full bg-emerald-100">
                <HeartPulse className="text-emerald-700" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Health / Training Details
            </h2>
            <p className="text-sm text-gray-500">
              View & update mandatory training compliance
            </p>
          </div>

          {/* STATUS */}
          {training.dueDate && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center gap-3
                ${
                  isOverdue
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
            >
              <ClipboardCheck />
              <p className="text-sm font-medium">
                {isOverdue
                  ? "Training overdue. Immediate action required."
                  : `Training valid till ${training.dueDate}`}
              </p>
            </div>
          )}

          {/* FORM */}
          <div className="space-y-5">

            <InputField
              label="Type of Training"
              placeholder="Diesel / Electric / EMU"
              value={training.section}
              onChange={v => setTraining({ ...training, section: v })}
            />

            <DateField
              label="Training Done Date"
              value={training.doneDate}
              onChange={v => setTraining({ ...training, doneDate: v })}
            />

            <DateField
              label="Next Due Date"
              value={training.dueDate}
              onChange={v => setTraining({ ...training, dueDate: v })}
            />

            <InputField
              label="Schedule"
              placeholder="Annual / 2 Years"
              value={training.schedule}
              onChange={v => setTraining({ ...training, schedule: v })}
            />

            <button
              onClick={save}
              disabled={saving}
              className={`w-full py-2.5 rounded-xl font-semibold text-white transition
                ${
                  saving
                    ? "bg-emerald-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
            >
              {saving ? "Saving..." : "Save Training Details"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ================= UI COMPONENTS ================= */

function InputField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 border rounded-lg text-sm
                   focus:ring-2 focus:ring-emerald-600 focus:outline-none"
      />
    </div>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
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
