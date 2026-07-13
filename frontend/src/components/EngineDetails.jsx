// import { Settings } from "lucide-react";

import { Settings, Pencil, Trash2 } from "lucide-react";

export default function EngineDetails({
  engine,
  canEdit,
  canDelete,
  onEdit,
  onDelete
}) {

  if (!engine) return null;

  const Section = ({ title, children }) => (
    <div className="mb-8">

      <div className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg mb-4">
        {title}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {children}
      </div>

    </div>
  );

  const Field = ({ label, value }) => (
    <div>

      <label className="block text-sm font-semibold text-gray-600 mb-1">
        {label}
      </label>

      <div className="border rounded-lg bg-slate-50 px-4 py-2 min-h-[42px]">
        {value || "-"}
      </div>

    </div>
  );

  return (

    <div className="bg-white rounded-xl shadow p-6">

      <div className="flex items-center justify-between mb-8">

  <div className="flex items-center gap-3">

    <Settings className="text-indigo-600"/>

    <div>

      <h2 className="text-2xl font-bold">
        {engine.towerCarNumber}
      </h2>

      <p className="text-gray-500">
        Depot : {engine.depot}
      </p>

    </div>

  </div>

  <div className="flex gap-3">

    {canEdit && (

      <button
        onClick={onEdit}
        className="flex items-center gap-2
                   bg-amber-500
                   hover:bg-amber-600
                   text-white
                   px-4
                   py-2
                   rounded-lg"
      >
        <Pencil size={16}/>
        Edit
      </button>

    )}

    {canDelete && (

      <button
        onClick={onDelete}
        className="flex items-center gap-2
                   bg-red-600
                   hover:bg-red-700
                   text-white
                   px-4
                   py-2
                   rounded-lg"
      >
        <Trash2 size={16}/>
        Delete
      </button>

    )}

  </div>

</div>

      {/* ===================================== */}

      <Section title="Tower Car Information">

        <Field label="Tower Car Number" value={engine.towerCarNumber}/>

        <Field label="Depot" value={engine.depot}/>

        <Field label="Type" value={engine.towerCar?.type}/>

        <Field label="Make" value={engine.towerCar?.make}/>

        <Field
          label="DOC"
          value={
            engine.towerCar?.doc
            ? engine.towerCar.doc.substring(0,10)
            : ""
          }
        />

      </Section>

      {/* ===================================== */}

      <Section title="Brake Power Certificate">

        <Field
          label="Issue Date"
          value={
            engine.brakePower?.issueDate
            ? engine.brakePower.issueDate.substring(0,10)
            : ""
          }
        />

        <Field
          label="Due Date"
          value={
            engine.brakePower?.dueDate
            ? engine.brakePower.dueDate.substring(0,10)
            : ""
          }
        />

      </Section>

      {/* ===================================== */}

      <Section title="Engine">

        <Field label="Make" value={engine.engine?.make}/>

        <Field label="B Check Date" value={engine.engine?.bCheckDate?.substring?.(0,10)}/>

        <Field label="B Check Hours" value={engine.engine?.bCheckHours}/>

        <Field label="B Due Date" value={engine.engine?.bCheckDueDate?.substring?.(0,10)}/>

        <Field label="B Due Hours" value={engine.engine?.bCheckDueHours}/>

        <Field label="C Check Date" value={engine.engine?.cCheckDate?.substring?.(0,10)}/>

        <Field label="C Check Hours" value={engine.engine?.cCheckHours}/>

        <Field label="C Due Date" value={engine.engine?.cCheckDueDate?.substring?.(0,10)}/>

        <Field label="C Due Hours" value={engine.engine?.cCheckDueHours}/>

        <Field label="D Check Date" value={engine.engine?.dCheckDate?.substring?.(0,10)}/>

        <Field label="D Check Hours" value={engine.engine?.dCheckHours}/>

        <Field label="D Due Date" value={engine.engine?.dCheckDueDate?.substring?.(0,10)}/>

        <Field label="D Due Hours" value={engine.engine?.dCheckDueHours}/>

        <Field label="POH Date" value={engine.engine?.pohDate?.substring?.(0,10)}/>

        <Field label="POH Due Date" value={engine.engine?.pohDueDate?.substring?.(0,10)}/>

        <Field label="Remarks" value={engine.engine?.pohRemarks}/>

      </Section>

      {/* ===================================== */}

      <Section title="Ultrasonic Testing">

        <Field
          label="Done Date"
          value={engine.ultrasonicTesting?.doneDate?.substring?.(0,10)}
        />

        <Field
          label="Due Date"
          value={engine.ultrasonicTesting?.dueDate?.substring?.(0,10)}
        />

      </Section>

      {/* ===================================== */}

      <Section title="Hydraulic Oil Replacement">

        <Field
          label="Change Date"
          value={engine.hydraulicReplacement?.changeDate?.substring?.(0,10)}
        />

        <Field
          label="Current Hours"
          value={engine.hydraulicReplacement?.currentHours}
        />

        <Field
          label="Due Hours"
          value={engine.hydraulicReplacement?.dueHours}
        />

      </Section>

      {/* ===================================== */}

      <Section title="Starting Battery">

        <Field label="Make" value={engine.startingBattery?.make}/>

        <Field
          label="Commission Date"
          value={engine.startingBattery?.commissionDate?.substring?.(0,10)}
        />

        <Field
          label="Due Date"
          value={engine.startingBattery?.dueDate?.substring?.(0,10)}
        />

      </Section>

      {/* ===================================== */}

      <Section title="Lighting Battery">

        <Field label="Make" value={engine.lightingBattery?.make}/>

        <Field
          label="Commission Date"
          value={engine.lightingBattery?.commissionDate?.substring?.(0,10)}
        />

        <Field
          label="Due Date"
          value={engine.lightingBattery?.dueDate?.substring?.(0,10)}
        />

      </Section>

      {/* ===================================== */}

      <Section title="Generator">

        <Field label="Make" value={engine.generator?.make}/>

        <Field
          label="Service Date"
          value={engine.generator?.serviceDate?.substring?.(0,10)}
        />

        <Field
          label="Service Hours"
          value={engine.generator?.serviceHours}
        />

        <Field
          label="Due Hours"
          value={engine.generator?.dueHours}
        />

      </Section>

      {/* ===================================== */}

      <div>

        <div className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg mb-4">

          Failure History

        </div>

        {engine.failures?.length ? (

          engine.failures.map((item,index)=>(

            <div
              key={index}
              className="border rounded-lg p-4 mb-3 grid md:grid-cols-3 gap-4"
            >

              <Field
                label="Component"
                value={item.component}
              />

              <Field
                label="Description"
                value={item.description}
              />

              <Field
                label="Failure Date"
                value={
                  item.failureDate
                  ? item.failureDate.substring(0,10)
                  : ""
                }
              />

            </div>

          ))

        ) : (

          <div className="text-gray-500">

            No failures recorded.

          </div>

        )}

      </div>

    </div>

  );

}