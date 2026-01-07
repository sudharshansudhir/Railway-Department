import { useState, useEffect } from "react";

const CHECK_LIST = ["PME", "GRS", "TR-4", "OC Done"];

export default function Checks() {
  const [checksData, setChecksData] = useState({});
  const [currentCheck, setCurrentCheck] = useState("PME");
  const [form, setForm] = useState({
    done: "",
    due: "",
    schedule: ""
  });
  const [editMode, setEditMode] = useState(false);

  // Load from localStorage on page open
  useEffect(() => {
    const saved = localStorage.getItem("driverChecks");
    if (saved) {
      setChecksData(JSON.parse(saved));
    }
  }, []);

  // Save one check temporarily
  const saveCurrentCheck = () => {
    setChecksData(prev => ({
      ...prev,
      [currentCheck]: { ...form }
    }));
    setForm({ done: "", due: "", schedule: "" });
  };

  // Check if all 4 are filled
  const allChecksFilled = CHECK_LIST.every(
    check => checksData[check]
  );

  // Final save (after all 4)
  const finalSave = () => {
    if (!allChecksFilled) {
      alert("All 4 checks must be entered");
      return;
    }
    localStorage.setItem("driverChecks", JSON.stringify(checksData));
    setEditMode(false);
  };

  // Edit a specific check
  const editCheck = (checkName) => {
    setCurrentCheck(checkName);
    setForm(checksData[checkName]);
    setEditMode(true);
  };

  /* =========================
     VIEW MODE (TABLE)
     ========================= */
  if (allChecksFilled && !editMode) {
    return (
      <div className="dark-page">
        <div className="checks-card">
          <h2>Checks Status</h2>

          <table>
            <thead>
              <tr>
                <th>Check</th>
                <th>Done Date</th>
                <th>Due Date</th>
                <th>Schedule (Years)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {CHECK_LIST.map(check => (
                <tr key={check}>
                  <td>{check}</td>
                  <td>{checksData[check].done}</td>
                  <td>{checksData[check].due}</td>
                  <td>{checksData[check].schedule}</td>
                  <td>
                    <button onClick={() => editCheck(check)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={() => setEditMode(true)}>
            Edit Checks
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     ENTRY / EDIT MODE (FORM)
     ========================= */
  return (
    <div className="dark-page">
      <div className="form-card yellow-card tall-form">
        <h2>Enter Mandatory Checks</h2>

        <label>Check Name</label>
        <select
          value={currentCheck}
          onChange={e => setCurrentCheck(e.target.value)}
        >
          {CHECK_LIST.map(check => (
            <option key={check}>{check}</option>
          ))}
        </select>

        <label>Done Date</label>
        <input
          type="date"
          value={form.done}
          onChange={e =>
            setForm({ ...form, done: e.target.value })
          }
        />

        <label>Due Date</label>
        <input
          type="date"
          value={form.due}
          onChange={e =>
            setForm({ ...form, due: e.target.value })
          }
        />

        <label>Schedule (Years)</label>
        <input
          placeholder="Eg: 1 / 2 / 5"
          value={form.schedule}
          onChange={e =>
            setForm({ ...form, schedule: e.target.value })
          }
        />

        <button onClick={saveCurrentCheck}>
          Save {currentCheck}
        </button>

        <p style={{ marginTop: 10 }}>
          Filled: {Object.keys(checksData).length} / 4
        </p>

        {allChecksFilled && (
          <button onClick={finalSave} style={{ marginTop: 15 }}>
            Final Save All Checks
          </button>
        )}
      </div>
    </div>
  );
}
