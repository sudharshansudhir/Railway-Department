import { useState, useEffect } from "react";

export default function LRDetails() {
  const [lrData, setLrData] = useState([]);
  const [form, setForm] = useState({
    section: "",
    done: "",
    due: "",
    schedule: ""
  });
  const [editIndex, setEditIndex] = useState(null);

  // Load saved LR data
  useEffect(() => {
    const saved = localStorage.getItem("driverLRDetails");
    if (saved) setLrData(JSON.parse(saved));
  }, []);

  const saveToStorage = (data) => {
    localStorage.setItem("driverLRDetails", JSON.stringify(data));
  };

  const saveLR = () => {
    let updated;

    if (editIndex !== null) {
      // ✅ EDIT EXISTING ROW
      updated = lrData.map((item, index) =>
        index === editIndex ? form : item
      );
      setEditIndex(null);
    } else {
      // ✅ ADD NEW ROW (KEEP OLD ONES)
      updated = [...lrData, form];
    }

    setLrData(updated);
    saveToStorage(updated);
    setForm({ section: "", done: "", due: "", schedule: "" });
  };

  const editLR = (index) => {
    setForm(lrData[index]);
    setEditIndex(index);
  };

  const deleteLR = (index) => {
    const updated = lrData.filter((_, i) => i !== index);
    setLrData(updated);
    saveToStorage(updated);
  };

  return (
    <div className="dark-page">
      <div className="form-card yellow-card wide">
        <h2>LR Details</h2>

        {/* FORM */}
        <label>Section (eg: CBE–ED)</label>
        <input
          value={form.section}
          onChange={e => setForm({ ...form, section: e.target.value })}
        />

        <label>Done Date</label>
        <input
          type="date"
          value={form.done}
          onChange={e => setForm({ ...form, done: e.target.value })}
        />

        <label>Due Date</label>
        <input
          type="date"
          value={form.due}
          onChange={e => setForm({ ...form, due: e.target.value })}
        />

        <label>Schedule (Months)</label>
        <input
          value={form.schedule}
          onChange={e => setForm({ ...form, schedule: e.target.value })}
        />

        <button onClick={saveLR}>
          {editIndex !== null ? "Update" : "Add"}
        </button>

        {/* TABLE VIEW */}
        {lrData.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Section</th>
                <th>Done Date</th>
                <th>Due Date</th>
                <th>Schedule</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {lrData.map((row, index) => (
                <tr key={index}>
                  <td>{row.section}</td>
                  <td>{row.done}</td>
                  <td>{row.due}</td>
                  <td>{row.schedule}</td>
                  <td>
                    <button onClick={() => editLR(index)}>Edit</button>
                    <button onClick={() => deleteLR(index)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
