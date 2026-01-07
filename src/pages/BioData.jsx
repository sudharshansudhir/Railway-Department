import { useState, useEffect } from "react";

export default function BioData() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({});
  const [photo, setPhoto] = useState(null);

  // Load saved data on page open
  useEffect(() => {
    const saved = localStorage.getItem("driverBioData");
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  const saveData = () => {
    const finalData = { ...form, photo };
    localStorage.setItem("driverBioData", JSON.stringify(finalData));
    setData(finalData);
  };

  // 👉 IF DATA EXISTS → SHOW CARD
  if (data) {
  return (
    <div className="dark-page">
      <div className="bio-card">
        <img src={data.photo} alt="profile" className="bio-photo" />

        <p><strong>Driver Name:</strong> {data.name}</p>
        <p><strong>PF No:</strong> {data.pf}</p>
        <p><strong>Designation:</strong> {data.desg}</p>
        <p><strong>Basic Pay:</strong> {data.pay}</p>
        <p><strong>Date of Entry:</strong> {data.entry}</p>
        <p><strong>Date of Appointment:</strong> {data.appointment}</p>

        {/* ACTION BUTTONS */}
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => {
              // Show form again
              localStorage.removeItem("driverBioData");
              setData(null);
            }}
            style={{ marginRight: "10px" }}
          >
            Edit Bio Data
          </button>

          <button
            onClick={() => {
              // Full logout
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}


  // 👉 ELSE → SHOW FORM
  return (
    <div className="dark-page">
      <div className="form-card yellow-card biodata-card">
        <h2>Driver Bio Data</h2>

        <div className="photo-upload">
          {photo ? <img src={photo} alt="profile" /> : <span>+</span>}
          <input
            type="file"
            onChange={(e) =>
              setPhoto(URL.createObjectURL(e.target.files[0]))
            }
          />
        </div>

        <label>Driver Name</label>
        <input onChange={e => setForm({ ...form, name: e.target.value })} />

        <label>PF Number</label>
        <input onChange={e => setForm({ ...form, pf: e.target.value })} />

        <label>Designation</label>
        <input onChange={e => setForm({ ...form, desg: e.target.value })} />

        <label>Basic Pay</label>
        <input onChange={e => setForm({ ...form, pay: e.target.value })} />

        <label>Date of Entry</label>
        <input type="date"
          onChange={e => setForm({ ...form, entry: e.target.value })} />

        <label>Date of Appointment</label>
        <input type="date"
          onChange={e => setForm({ ...form, appointment: e.target.value })} />
          <button
  onClick={() => {
    localStorage.clear();
    window.location.href = "/";
  }}
  style={{ marginTop: "20px" }}
>
  Logout
</button>


        <button onClick={saveData}>Save</button>
      </div>
    </div>
  );
}
