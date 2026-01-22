import { useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";
import {
  UserPlus,
  IdCard,
  User,
  Train,
  Shield
} from "lucide-react";
import Footer from "../components/Footer";

export default function AdminRegister() {
  const [form, setForm] = useState({
    name: "",
    pfNo: "",
    role: "DRIVER",
    depotName: ""
  });

  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.name || !form.pfNo || !form.depotName) {
      Swal.fire("Missing Data", "All fields are required", "warning");
      return;
    }

    try {
      setLoading(true);

      await api.post("/admin/register", form);

      Swal.fire({
        icon: "success",
        title: "User Created",
        text: `Password is same as PF No (${form.pfNo})`,
      });

      setForm({
        name: "",
        pfNo: "",
        role: "DRIVER",
        depotName: ""
      });

    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.msg || "Registration failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 px-4 py-6">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">

          {/* HEADER */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <div className="p-3 rounded-full bg-indigo-100">
                <UserPlus className="text-indigo-700" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Register Driver / Manager
            </h2>
            <p className="text-sm text-gray-500">
              Super Admin Access Only
            </p>
          </div>

          {/* FORM */}
          <div className="space-y-5">

            <Input
              label="PF Number"
              icon={<IdCard />}
              value={form.pfNo}
              onChange={v => setForm({ ...form, pfNo: v })}
            />

            <Input
              label="Full Name"
              icon={<User />}
              value={form.name}
              onChange={v => setForm({ ...form, name: v })}
            />

            <Select
              label="Role"
              icon={<Shield />}
              value={form.role}
              onChange={v => setForm({ ...form, role: v })}
              options={[
                { value: "DRIVER", label: "Driver" },
                { value: "DEPOT_MANAGER", label: "Depot Manager" }
              ]}
            />

            <Input
              label="Depot Name"
              icon={<Train />}
              value={form.depotName}
              onChange={v => setForm({ ...form, depotName: v })}
            />

            <div className="bg-slate-50 text-sm p-3 rounded-xl">
              🔐 Default password will be <b>PF Number</b>
            </div>

            <button
              onClick={submit}
              disabled={loading}
              className={`w-full py-2.5 rounded-xl font-semibold text-white transition
                ${
                  loading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
            >
              {loading ? "Creating..." : "Register User"}
            </button>

          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}

/* ================= UI COMPONENTS ================= */

function Input({ label, value, onChange, icon }) {
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
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm"
        />
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options, icon }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-gray-400">
          {icon}
        </span>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm bg-white"
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
