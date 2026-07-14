import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import BackButton from "../components/BackButton";
import Footer from "../components/Footer";
import api from "../api/axios";
import EngineDetails from "../components/EngineDetails";
import Swal from "sweetalert2";
import EngineFormModal from "../components/EngineFormModal";
import {
  Settings,
  Building2,
  Train,
  Pencil,
  Trash2,
  Plus,
  Save
} from "lucide-react";

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

export default function EnginePage() {

  const role = localStorage.getItem("role");

  const depotName = localStorage.getItem("depotName");

  const [selectedDepot, setSelectedDepot] = useState(
    role === "DRIVER" || role === "DEPOT_MANAGER"
      ? depotName
      : ""
  );

  const [engineList, setEngineList] = useState([]);

  const [selectedEngine, setSelectedEngine] = useState("");

  const [engine, setEngine] = useState(null);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

const [isEdit, setIsEdit] = useState(false);

const emptyEngine = {
  depot: "",
  towerCarNumber: "",

  towerCar: {
    type: "",
    make: "",
    doc: ""
  },

  brakePower: {
    issueDate: "",
    dueDate: ""
  },

  engine: {
    make: "",
    bCheckDate: "",
    bCheckHours: "",
    bCheckDueDate: "",
    bCheckDueHours: "",

    cCheckDate: "",
    cCheckHours: "",
    cCheckDueDate: "",
    cCheckDueHours: "",

    dCheckDate: "",
    dCheckHours: "",
    dCheckDueDate: "",
    dCheckDueHours: "",

    pohDate: "",
    pohDueDate: "",
    pohRemarks: ""
  },

  ultrasonicTesting: {
    doneDate: "",
    dueDate: ""
  },

  hydraulicReplacement: {
    changeDate: "",
    currentHours: "",
    dueHours: ""
  },

  startingBattery: {
    make: "",
    commissionDate: "",
    dueDate: ""
  },

  lightingBattery: {
    make: "",
    commissionDate: "",
    dueDate: ""
  },

  generator: {
    make: "",
    serviceDate: "",
    serviceHours: "",
    dueHours: ""
  },

  failures: []
};

const [formData, setFormData] = useState(emptyEngine);

  const canEdit =
    role === "SUPER_ADMIN" ||
    role === "DEPOT_MANAGER";

  const canDelete =
    role === "SUPER_ADMIN";

  const canCreate =
    role === "SUPER_ADMIN";

      useEffect(() => {

    if (!selectedDepot) return;

    loadEngines();

  }, [selectedDepot]);

  useEffect(() => {

    if (!selectedEngine) return;

    loadEngine();

  }, [selectedEngine]);

  const loadEngines = async () => {

    try {

      const res = await api.get(
        `/engine?depot=${selectedDepot}`
      );

      setEngineList(res.data);

      if (res.data.length) {

        setSelectedEngine(res.data[0]._id);

      } else {

        setSelectedEngine("");

        setEngine(null);

      }

    } catch {

      Swal.fire(
        "Error",
        "Unable to load engines",
        "error"
      );

    }

  };

  const loadEngine = async () => {

    try {

      setLoading(true);

      const res = await api.get(
        `/engine/${selectedEngine}`
      );

      setEngine(res.data);

    } catch {

      Swal.fire(
        "Error",
        "Unable to load engine details",
        "error"
      );

    } finally {

      setLoading(false);

    }

  };

  const deleteEngine = async () => {

  const result = await Swal.fire({
    title: "Delete Engine?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete"
  });

  if (!result.isConfirmed) return;

  try {

    await api.delete(`/engine/${engine._id}`);

    Swal.fire(
      "Deleted",
      "Engine removed successfully",
      "success"
    );

    loadEngines();

  }

  catch(err){

    Swal.fire(
      "Error",
      err.response?.data?.msg ||
      "Delete failed",
      "error"
    );

  }

};

    return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 px-4 py-6">

        <div className="max-w-7xl mx-auto">

          {/* HEADER */}

          <div className="flex items-center justify-between mb-6">

            <div className="flex items-center gap-3">

              {role === "DRIVER" && <BackButton />}

              <Settings
                className="text-indigo-600"
                size={32}
              />

              <div>

                <h2 className="text-2xl font-bold">

                  Engine Management

                </h2>

                <p className="text-gray-500 text-sm">

                  View and manage Tower Car engine records

                </p>

              </div>

            </div>

            {canCreate && (

              <button
  onClick={() => {
    setIsEdit(false);
    setFormData(emptyEngine);
    setShowModal(true);
  }}
  className="flex items-center gap-2
             bg-indigo-600
             text-white
             px-4
             py-2
             rounded-lg
             hover:bg-indigo-700"
>
  <Plus size={18}/>
  New Engine
</button>

            )}

          </div>

          {/* FILTERS */}

          <div className="bg-white rounded-xl shadow p-5 mb-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* DEPOT */}

              <div>

                <label className="block text-sm font-semibold mb-2">

                  Depot

                </label>

               <select
  value={selectedDepot}
  onChange={(e) => setSelectedDepot(e.target.value)}
  className="w-full border rounded-lg px-4 py-2"
>

                  <option value="">

                    Select Depot

                  </option>

                  {DEPOTS.map(depot=>(

                    <option
                      key={depot}
                      value={depot}
                    >

                      {depot}

                    </option>

                  ))}

                </select>

              </div>

              {/* TOWER CAR */}

              <div>

                <label className="block text-sm font-semibold mb-2">

                  Tower Car

                </label>

                <select

                  value={selectedEngine}

                  onChange={(e)=>setSelectedEngine(e.target.value)}

                  className="w-full border rounded-lg px-4 py-2"

                >

                  <option value="">

                    Select Tower Car

                  </option>

                  {engineList.map(item=>(

                    <option

                      key={item._id}

                      value={item._id}

                    >

                      {item.towerCarNumber}

                    </option>

                  ))}

                </select>

              </div>

            </div>

          </div>
                    {loading && (

            <div className="bg-white rounded-xl shadow p-12 text-center">

              Loading Engine...

            </div>

          )}

{!loading && engine && (
    <EngineDetails
  engine={engine}
  canEdit={
    role === "SUPER_ADMIN" ||
    (role === "DEPOT_MANAGER" &&
      engine?.depot === depotName)
  }
  canDelete={role === "SUPER_ADMIN"}
  onEdit={() => {
    setIsEdit(true);
    setFormData(engine);
    setShowModal(true);
  }}
  onDelete={deleteEngine}
/>
)}
        </div>

      </div>

<EngineFormModal
    open={showModal}
    onClose={() => setShowModal(false)}
    formData={formData}
    setFormData={setFormData}
    isEdit={isEdit}
   refresh={() => {
  loadEngines();

  setShowModal(false);
}}
/>
      <Footer/>

    </>
  );

}