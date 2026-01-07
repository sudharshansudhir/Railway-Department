import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DepotManagerDashboard() {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");
  const [depotFilter, setDepotFilter] = useState("");

  // 🔔 notification states
  const [circulars, setCirculars] = useState([]);
  const [unreadCirculars, setUnreadCirculars] = useState([]);

  const navigate = useNavigate();

  // identify manager (temporary, frontend only)
  const currentUser =
    localStorage.getItem("currentUser") || "manager";

  useEffect(() => {
    // load drivers
    const storedDrivers =
      JSON.parse(localStorage.getItem("drivers")) || [];
    setDrivers(storedDrivers);

    // load circulars
    const storedCirculars =
      JSON.parse(localStorage.getItem("circulars")) || [];
    setCirculars(storedCirculars);

    // find unread circulars
    const unread = storedCirculars.filter(
      (c) => !c.readBy.includes(currentUser)
    );
    setUnreadCirculars(unread);
  }, []);

  const markAsRead = (id) => {
    const updated = circulars.map((c) =>
      c.id === id
        ? { ...c, readBy: [...c.readBy, currentUser] }
        : c
    );

    localStorage.setItem("circulars", JSON.stringify(updated));
    setCirculars(updated);

    const stillUnread = updated.filter(
      (c) => !c.readBy.includes(currentUser)
    );
    setUnreadCirculars(stillUnread);
  };

  const handleLogout = () => {
    if (unreadCirculars.length > 0) {
      alert("Please read all circulars before logout");
      return;
    }
    navigate("/");
  };

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.pfNo?.includes(search);

    const matchesDepot =
      depotFilter === "" ||
      d.depot?.toLowerCase() === depotFilter.toLowerCase();

    return matchesSearch && matchesDepot;
  });

  return (
    <div className="dark-page">
      <div className="checks-card">

        <h2>Depot Manager Dashboard</h2>

        {/* 🔔 MUST-READ CIRCULAR POPUP */}
        {unreadCirculars.length > 0 && (
          <div className="notification-popup">
            <h3>Important Circular</h3>

            {unreadCirculars.map((c) => (
              <div key={c.id} className="notification-card">
                <strong>{c.title}</strong>
                <p>{c.message}</p>
                <button onClick={() => markAsRead(c.id)}>
                  Mark as Read
                </button>
              </div>
            ))}
          </div>
        )}

        {/* FILTERS */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input
            placeholder="Search by PF / Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={depotFilter}
            onChange={(e) => setDepotFilter(e.target.value)}
          >
            <option value="">All Depots</option>
            <option value="CBE">CBE</option>
            <option value="PTJ">PTJ</option>
            <option value="MTP">MTP</option>
          </select>

          <button onClick={handleLogout}>Logout</button>
        </div>

        {/* DRIVER TABLE */}
        <table>
          <thead>
            <tr>
              <th>PF No</th>
              <th>Name</th>
              <th>Depot</th>
              <th>Designation</th>
              <th>Next Due</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length === 0 && (
              <tr>
                <td colSpan="5">No drivers found</td>
              </tr>
            )}

            {filteredDrivers.map((d, i) => (
              <tr key={i}>
                <td>{d.pfNo}</td>
                <td>{d.name}</td>
                <td>{d.depot}</td>
                <td>{d.designation}</td>
                <td style={{ color: "red", fontWeight: "bold" }}>
                  {d.nextDue || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}
