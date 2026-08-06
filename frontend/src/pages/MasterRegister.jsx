import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import Swal from "sweetalert2";

import {
  UserPlus,
  User,
  IdCard,
  Building2,
  Train
} from "lucide-react";

export default function MasterRegister() {

  const [depots, setDepots] = useState([]);

  const [assignedDepots, setAssignedDepots] = useState([]);
const [depotInput, setDepotInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({

    name: "",

    pfNo: "",

    division: ""

  });

  /* ================================
      LOAD ALL DEPOTS
  ================================= */

  useEffect(() => {

    loadDepots();

  }, []);

  const loadDepots = async () => {

    try {

      const res = await api.get("/admin/depots");

      setDepots(res.data || []);

    }

    catch (err) {

      console.log(err);

    }

  };

  /* ================================
      REGISTER SUPER ADMIN
  ================================= */

  const registerSuperAdmin = async () => {

    if (
      !form.name ||
      !form.pfNo ||
      !form.division
    ) {

      return Swal.fire(
        "Missing",
        "Fill all fields",
        "warning"
      );

    }

    if (
      assignedDepots.length === 0
    ) {

      return Swal.fire(
        "Missing",
        "Assign at least one depot",
        "warning"
      );

    }

    try {

      setLoading(true);

      await api.post(
        "/master/create-super-admin",
        {

          ...form,

          role: "SUPER_ADMIN",

          assignedDepots

        }
      );

      Swal.fire({

        icon: "success",

        title: "Super Admin Created",

        text:
          "Default password is PF Number"

      });

      setForm({

        name: "",

        pfNo: "",

        division: ""

      });

      setAssignedDepots([]);

    }

    catch (err) {

      Swal.fire(

        "Error",

        err.response?.data?.msg ||

        "Registration failed",

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
            "Depot already added",
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

    return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 px-4 py-6">

        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">

          <BackButton />

          <div className="text-center mb-6">

            <div className="flex justify-center mb-2">

              <div className="p-3 rounded-full bg-blue-100">

                <UserPlus className="text-blue-700" />

              </div>

            </div>

            <h2 className="text-2xl font-bold">

              Create Super Admin

            </h2>

            <p className="text-gray-500 text-sm">

              Master Admin Access Only

            </p>

          </div>

          <div className="space-y-5">

            <Input

              label="PF Number"

              icon={<IdCard />}

              value={form.pfNo}

              onChange={(v)=>

                setForm({

                  ...form,

                  pfNo:v

                })

              }

            />

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
<div>

<label className="block text-sm font-semibold mb-2">

Assigned Depots

</label>

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

placeholder="Type Depot and press Enter"

className="flex-1 border rounded-lg px-3 py-2"

/>

<button

type="button"

onClick={addDepot}

className="bg-blue-600 text-white px-4 rounded-lg"

>

Add

</button>

</div>

<div className="flex flex-wrap gap-2 mt-4">

{

assignedDepots.map(depot=>(

<div

key={depot}

className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2"

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

            <div className="bg-slate-50 rounded-lg p-3 text-sm">

              🔐 Default Password :

              <b> PF Number </b>

            </div>

            <button

              onClick={registerSuperAdmin}

              disabled={loading}

              className={`

                w-full

                py-3

                rounded-lg

                font-semibold

                text-white

                transition

                ${

                  loading

                  ?

                  "bg-blue-400"

                  :

                  "bg-blue-700 hover:bg-blue-800"

                }

              `}

            >

              {

                loading

                ?

                "Creating..."

                :

                "Create Super Admin"

              }

            </button>

          </div>

        </div>

      </div>

      <Footer />

    </>
  );
  }

/* ==========================================
            REUSABLE INPUT
========================================== */

function Input({

  label,

  value,

  onChange,

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

        <input

          value={value}

          onChange={(e)=>onChange(e.target.value)}

          className="

            w-full

            pl-10

            pr-4

            py-2.5

            border

            rounded-lg

            text-sm

            focus:ring-2

            focus:ring-blue-600

            focus:outline-none

          "

        />

      </div>

    </div>

  );

}