import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState([]);
  const [managers, setManagers] = useState([]);

  const [circulars, setCirculars] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    // ACTIVE USERS
    const activeUsers =
      JSON.parse(localStorage.getItem("activeUsers")) || [];

    setDrivers(activeUsers.filter((u) => u.role === "driver"));
    setManagers(activeUsers.filter((u) => u.role === "manager"));

    // CIRCULARS
    const storedCirculars =
      JSON.parse(localStorage.getItem("circulars")) || [];
    setCirculars(storedCirculars);
  }, []);

  // 📢 PUBLISH CIRCULAR
  const publishCircular = () => {
    if (!title || !message) {
      alert("Title and message required");
      return;
    }

    let fileUrl = null;
    let fileName = null;

    if (file) {
      fileUrl = URL.createObjectURL(file);
      fileName = file.name;
    }

    const newCircular = {
      id: Date.now(),
      title,
      message,
      fileUrl,
      fileName,
      readBy: []
    };

    const updated = [...circulars, newCircular];
    localStorage.setItem("circulars", JSON.stringify(updated));
    setCirculars(updated);

    setTitle("");
    setMessage("");
    setFile(null);
  };

  // 🧹 CLEAR ALL CIRCULARS
  const clearCirculars = () => {
    if (!window.confirm("Clear all circular history?")) return;
    localStorage.removeItem("circulars");
    setCirculars([]);
  };

  return (
    <div className="dark-page">
      <div className="checks-card wide">

        <h2>Super Admin Dashboard</h2>

        {/* ===== ACTIVE DRIVERS ===== */}
        <h3>Logged-in Drivers</h3>
        <table>
          <thead>
            <tr>
              <th>PF No</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {drivers.length === 0 && (
              <tr><td colSpan="2">No drivers online</td></tr>
            )}
            {drivers.map((d, i) => (
              <tr key={i}>
                <td>{d.pfNo}</td>
                <td>{d.name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== ACTIVE MANAGERS ===== */}
        <h3 style={{ marginTop: "30px" }}>Logged-in Depot Managers</h3>
        <table>
          <thead>
            <tr>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {managers.length === 0 && (
              <tr><td>No managers online</td></tr>
            )}
            {managers.map((m, i) => (
              <tr key={i}>
                <td>{m.email}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== PUBLISH CIRCULAR ===== */}
        <h3 style={{ marginTop: "40px" }}>Publish Circular</h3>

        <input
          placeholder="Circular Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Circular Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows="4"
          style={{ width: "100%", marginTop: "10px" }}
        />

        {/* FILE UPLOAD */}
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          style={{ marginTop: "10px" }}
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={publishCircular} style={{ marginTop: "15px" }}>
          Publish Circular
        </button>

        {/* ===== VIEW CIRCULARS ===== */}
        <h3 style={{ marginTop: "40px" }}>All Circulars</h3>

        {circulars.length === 0 && <p>No circulars published</p>}

        {circulars.map((c) => (
          <div
            key={c.id}
            style={{
              background: "#fff",
              padding: "15px",
              borderRadius: "10px",
              marginTop: "10px"
            }}
          >
            <strong>{c.title}</strong>
            <p>{c.message}</p>

            {c.fileUrl && (
              <a
                href={c.fileUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: "block", marginTop: "5px" }}
              >
                📎 {c.fileName}
              </a>
            )}

            <small>Read by: {c.readBy.length}</small>
          </div>
        ))}

        <button
          onClick={clearCirculars}
          style={{ marginTop: "20px", background: "crimson", color: "#fff" }}
        >
          Clear Circular History
        </button>

        <button onClick={() => navigate("/")} style={{ marginTop: "20px" }}>
          Logout
        </button>

      </div>
    </div>
  );
}
