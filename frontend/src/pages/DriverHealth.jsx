import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";
import { HeartPulse, Calendar, ClipboardCheck } from "lucide-react";
import Footer from "../components/Footer";

/* 🔥 PREDEFINED TRAININGS */
const TRAINING_KEYS = ["PME", "GRS_RC", "TR4", "OC"];
const calculateSchedule = (start, end) => {
  if (!start || !end) return "";

  const startDate = new Date(start);
  const endDate = new Date(end);

  console.log(startDate,endDate)
  const months =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());

  if (months === 12) return "1 year";
  if (months === 24) return "2 Years";
  if (months % 12 === 0) return `${months / 12} Years`;

  return `${months} Months`;
};


export default function DriverHealth() {

  const [trainings, setTrainings] = useState({
    PME: { doneDate: "", dueDate: "", schedule: "" },
    GRS_RC: { doneDate: "", dueDate: "", schedule: "" },
    TR4: { doneDate: "", dueDate: "", schedule: "" },
    OC: { doneDate: "", dueDate: "", schedule: "" }
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD EXISTING DATA ================= */
  useEffect(() => {
    api.get("/driver/profile")
      .then(res => {
        const existing = res.data?.profile?.trainings;

        if (existing) {
          const formatted = {};
          TRAINING_KEYS.forEach(key => {
            formatted[key] = {
              doneDate: existing[key]?.doneDate
                ? existing[key].doneDate.substring(0, 10)
                : "",
              dueDate: existing[key]?.dueDate
                ? existing[key].dueDate.substring(0, 10)
                : "",
              schedule: existing[key]?.schedule || ""
            };
          });
          setTrainings(formatted);
        }
      })
      .catch(() => {
        Swal.fire("Error", "Unable to load training data", "error");
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= SAVE ================= */
  const save = async () => {
    for (const key of TRAINING_KEYS) {
      const t = trainings[key];
      if ((t.doneDate || t.dueDate || t.schedule) &&
          (!t.doneDate || !t.dueDate)) {
        Swal.fire({
          icon: "warning",
          title: "Incomplete Details",
          text: `${key} training requires Done Date & Due Date`,
        });
        return;
      }
    }

    try {
      setSaving(true);

      await api.put("/driver/profile/training", {
        trainings
      });

      Swal.fire({
        icon: "success",
        title: "Training Updated",
        text: "All training details saved successfully",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire("Error", "Unable to save training details", "error");
    } finally {
      setSaving(false);
    }
  };

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
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">

          {/* HEADER */}
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-2">
              <div className="p-3 rounded-full bg-emerald-100">
                <HeartPulse className="text-emerald-700" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Health / Training Details
            </h2>
            <p className="text-sm text-gray-500">
              Maintain mandatory training compliance
            </p>
          </div>

          {/* TRAINING SECTIONS */}
          <div className="space-y-8">
            {TRAINING_KEYS.map(key => (
              <TrainingSection
                key={key}
                title={key.replace("_", " ")}
                data={trainings[key]}
                onChange={v =>
                  setTrainings({
                    ...trainings,
                    [key]: v
                  })
                }
              />
            ))}
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={save}
            disabled={saving}
            className={`w-full mt-8 py-2.5 rounded-xl font-semibold text-white transition
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
      <Footer/>
    </>
  );
}

/* ================= TRAINING SECTION ================= */

function TrainingSection({ title, data, onChange }) {
  const isOverdue =
    data.dueDate && new Date(data.dueDate) < new Date();

  return (
    <div className="border rounded-xl p-5 bg-slate-50">

      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
        <ClipboardCheck />
        {title}
      </h3>

      {data.dueDate && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm
            ${
              isOverdue
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
        >
          {isOverdue
            ? "Training overdue"
            : `Valid till ${data.dueDate}`}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <DateField
  label="Done Date"
  value={data.doneDate}
  onChange={v => {
    const schedule = calculateSchedule(v, data.dueDate);
    onChange({ ...data, doneDate: v, schedule });
  }}
/>


 
<DateField
  label="Next Due Date"
  value={data.dueDate}
  onChange={v => {
    const schedule = calculateSchedule(data.doneDate, v);
    onChange({ ...data, dueDate: v, schedule });
  }}
/>


       <InputField
  label="Schedule"
  placeholder="Auto calculated"
  value={data.schedule}
  disabled
/>


      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function InputField({ label, value, onChange, placeholder, disabled }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={e => onChange?.(e.target.value)}
        className="w-full px-4 py-2.5 border rounded-lg text-sm
                   disabled:bg-gray-100 disabled:cursor-not-allowed
                   focus:ring-2 focus:ring-emerald-600 focus:outline-none"
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
