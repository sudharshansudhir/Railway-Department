import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";
import {
  User,
  BadgeIndianRupee,
  Calendar,
  IdCard,
  Building2
} from "lucide-react";

export default function DriverProfile() {
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    hrmsId: "",
    designation: "",
    basicPay: "",
    dateOfAppointment: "",
    dateOfEntryAsTWD: ""
  });

  const [saving, setSaving] = useState(false);

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    api.get("/driver/profile").then(res => {
      setUser(res.data.user);

      const p = res.data.profile || {};

      setForm({
        hrmsId: p.hrmsId || "",
        designation: p.designation || "",
        basicPay: p.basicPay || "",
        dateOfAppointment: p.dateOfAppointment?.substring(0, 10) || "",
        dateOfEntryAsTWD: p.dateOfEntryAsTWD?.substring(0, 10) || ""
      });
    });
  }, []);

  /* ================= SAVE ================= */

  const save = async () => {
    if (!form.hrmsId || !form.designation || !form.basicPay) {
      Swal.fire(
        "Missing Data",
        "HRMS ID, Designation & Basic Pay are mandatory",
        "warning"
      );
      return;
    }

    try {
      setSaving(true);
      await api.put("/driver/profile/bio", form);

      Swal.fire({
        icon: "success",
        title: "Bio Data Updated",
        timer: 1300,
        showConfirmButton: false
      });
    } catch {
      Swal.fire("Error", "Unable to save bio data", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-bold mb-4">Driver Bio Data</h2>

          {/* ================= READ-ONLY USER INFO ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

            <ReadOnly
              label="Driver Name"
              value={user.name}
              icon={<User />}
            />

            <ReadOnly
              label="PF Number"
              value={user.pfNo}
              icon={<IdCard />}
            />

            <ReadOnly
              label="Depot"
              value={user.depotName}
              icon={<Building2 />}
            />
          </div>

          {/* ================= EDITABLE PROFILE ================= */}

          <Input
            label="HRMS ID"
            icon={<IdCard />}
            value={form.hrmsId}
            onChange={v => setForm({ ...form, hrmsId: v })}
          />

          <Input
            label="Designation"
            icon={<User />}
            value={form.designation}
            onChange={v => setForm({ ...form, designation: v })}
          />

          <Input
            label="Basic Pay"
            type="number"
            icon={<BadgeIndianRupee />}
            value={form.basicPay}
            onChange={v => setForm({ ...form, basicPay: v })}
          />

          <DateInput
            label="Date of Appointment"
            value={form.dateOfAppointment}
            onChange={v => setForm({ ...form, dateOfAppointment: v })}
          />

          <DateInput
            label="Date of Entry as TWD"
            value={form.dateOfEntryAsTWD}
            onChange={v => setForm({ ...form, dateOfEntryAsTWD: v })}
          />

          <button
            onClick={save}
            disabled={saving}
            className="w-full mt-4 bg-green-600 text-white py-2 rounded"
          >
            {saving ? "Saving..." : "Save Bio Data"}
          </button>

        </div>
      </div>
    </>
  );
}

/* ================= UI COMPONENTS ================= */

function ReadOnly({ label, value, icon }) {
  return (
    <div className="bg-slate-50 border rounded-lg p-3">
      <p className="text-xs text-gray-500 flex items-center gap-1">
        {icon} {label}
      </p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function Input({ label, value, onChange, icon, type = "text" }) {
  return (
    <div className="mb-4">
      <label className="text-sm font-semibold">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-gray-400">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-10 p-2 border rounded"
        />
      </div>
    </div>
  );
}

function DateInput({ label, value, onChange }) {
  return (
    <div className="mb-4">
      <label className="text-sm font-semibold">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-gray-400">
          <Calendar />
        </span>
        <input
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-10 p-2 border rounded"
        />
      </div>
    </div>
  );
}
