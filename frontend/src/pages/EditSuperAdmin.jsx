import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import Swal from "sweetalert2";

import {
  User,
  IdCard,
  Building2,
  MapPinned,
  Save
} from "lucide-react";

export default function EditSuperAdmin() {

  const navigate = useNavigate();
  const location = useLocation();

  // Data received from MasterDashboard
  const admin = location.state;

  const [loading, setLoading] = useState(false);

const [depotInput, setDepotInput] = useState("");
  const [assignedDepots, setAssignedDepots] = useState([]);

  const [form, setForm] = useState({

    name: "",

    pfNo: "",

    division: ""

  });

  /* ==========================================
      LOAD SUPER ADMIN DETAILS
  ========================================== */

  useEffect(() => {

    if (!admin) {

      Swal.fire({

        icon: "error",

        title: "Invalid Access",

        text: "No Super Admin selected."

      });

      navigate("/master");

      return;

    }

    setForm({

      name: admin.name || "",

      pfNo: admin.pfNo || "",

      division: admin.division || ""

    });

    setAssignedDepots(

      admin.assignedDepots || []

    );

  }, []);

  /* ==========================================
      LOAD DEPOTS
  ========================================== */


  /* ==========================================
      UPDATE
  ========================================== */

  const updateSuperAdmin = async () => {

    if (

      !form.name ||

      !form.division

    ) {

      Swal.fire(

        "Missing Data",

        "Please fill all fields.",

        "warning"

      );

      return;

    }

    if (

      assignedDepots.length === 0

    ) {

      Swal.fire(

        "Missing Depots",

        "Select at least one depot.",

        "warning"

      );

      return;

    }

    try {

      setLoading(true);

      await api.put(

        `/master/super-admin/${admin._id}`,

        {

          name: form.name,

          division: form.division,

          assignedDepots

        }

      );

      Swal.fire({

        icon: "success",

        title: "Updated Successfully",

        timer: 1200,

        showConfirmButton: false

      });

      navigate("/master");

    }

    catch (err) {

      Swal.fire(

        "Error",

        err.response?.data?.msg ||

        "Update Failed",

        "error"

      );

    }

    finally {

      setLoading(false);

    }

  };

  const addDepot = () => {

  const depot = depotInput.trim().toUpperCase();

  if (!depot) return;

  if (assignedDepots.includes(depot)) {

    Swal.fire(
      "Duplicate",
      "Depot already exists",
      "warning"
    );

    return;
  }

  setAssignedDepots([
    ...assignedDepots,
    depot
  ]);

  setDepotInput("");

};

const removeDepot = (depot) => {

  setAssignedDepots(

    assignedDepots.filter(

      d => d !== depot

    )

  );

};
    /* ==========================================
      UI
  ========================================== */

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 px-4 py-6">

        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">

          <BackButton />

          <div className="text-center mb-6">

            <div className="flex justify-center mb-2">

              <div className="p-3 rounded-full bg-indigo-100">

                <User className="text-indigo-700" />

              </div>

            </div>

            <h2 className="text-2xl font-bold text-gray-800">

              Edit Super Admin

            </h2>

            <p className="text-sm text-gray-500">

              Update Division & Assigned Depots

            </p>

          </div>

          <div className="space-y-5">

            {/* PF NUMBER */}

            <Input

              label="PF Number"

              icon={<IdCard />}

              value={form.pfNo}

              readOnly

            />

            {/* NAME */}

            <Input

              label="Full Name"

              icon={<User />}

              value={form.name}

              onChange={(v)=>

                setForm({

                  ...form,

                  name:v

                })

              }

            />

            {/* DIVISION */}

            <Input

              label="Division"

              icon={<Building2 />}

              value={form.division}

              onChange={(v)=>

                setForm({

                  ...form,

                  division:v

                })

              }

            />

            {/* DEPOTS */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-1">

                Assigned Depots

              </label>

              <div className="relative">

                <span className="absolute left-3 top-3 text-gray-400">

                  {/* <MapPinned size={18} /> */}

                </span>

            <div>

{/* <label className="block text-sm font-semibold text-gray-700 mb-2">

Assigned Depots

</label> */}

<div className="flex gap-2">

<input

value={depotInput}

onChange={(e)=>setDepotInput(e.target.value)}

onKeyDown={(e)=>{

if(e.key==="Enter"){

e.preventDefault();

addDepot();

}

}}

placeholder="Type depot and press Enter"

className="flex-1 border rounded-lg px-3 py-2"

/>

<button

type="button"

onClick={addDepot}

className="bg-indigo-600 text-white px-4 rounded-lg"

>

Add

</button>

</div>

<div className="flex flex-wrap gap-2 mt-4">

{

assignedDepots.map(depot=>(

<div

key={depot}

className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center gap-2"

>

{depot}

<button

type="button"

onClick={()=>removeDepot(depot)}

className="text-red-600 font-bold"

>

×

</button>

</div>

))

}

</div>

</div>

              </div>

              <p className="text-xs text-gray-400 mt-1">

                Hold Ctrl (Windows) or Cmd (Mac) to select multiple depots.

              </p>

            </div>
                        {/* PASSWORD INFO */}

            <div className="bg-slate-50 rounded-xl p-3 text-sm">

              <p>

                🔐 PF Number cannot be changed.

              </p>

              <p className="text-gray-500 mt-1">

                Updating the division or assigned depots will immediately affect
                what this Super Admin can access.

              </p>

            </div>

            {/* ACTION BUTTONS */}

            <div className="flex justify-end gap-3 pt-2">

              <button

                onClick={() => navigate("/master")}

                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"

              >

                Cancel

              </button>

              <button

                onClick={updateSuperAdmin}

                disabled={loading}

                className={`px-6 py-2.5 rounded-xl text-white flex items-center gap-2 transition
                  ${
                    loading
                      ? "bg-indigo-300 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}

              >

                <Save size={18} />

                {loading ? "Updating..." : "Update Super Admin"}

              </button>

            </div>

          </div>

        </div>

      </div>

      <Footer />

    </>
  );

}
/* =====================================================
   REUSABLE INPUT COMPONENT
===================================================== */

function Input({
  label,
  value,
  onChange,
  icon,
  readOnly = false
}) {
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
          readOnly={readOnly}
          onChange={(e) =>
            onChange && onChange(e.target.value)
          }
          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm transition
          ${
            readOnly
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
          }`}
        />

      </div>
    </div>
  );
}

/* =====================================================
   REUSABLE SELECT COMPONENT
===================================================== */

function Select({
  label,
  value,
  onChange,
  options,
  icon
}) {
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
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
        >

          {options.map((option) => (

            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>

          ))}

        </select>

      </div>

    </div>
  );
}