import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DriverDashboard() {
  const navigate = useNavigate();

  // identify current driver (PF no preferred)
  const currentUser =
    localStorage.getItem("currentUser") || "driver";

  const [circulars, setCirculars] = useState([]);
  const [unreadCirculars, setUnreadCirculars] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("circulars")) || [];
    setCirculars(stored);

    const unread = stored.filter(
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

  return (
    <div className="dashboard-page">
      {/* Background Video */}
      <video className="bg-video" autoPlay loop muted playsInline>
        <source src="/videos/road.mp4" type="video/mp4" />
      </video>

      {/* 🔔 MUST-READ MODAL POPUP */}
      {unreadCirculars.length > 0 && (
        <div className="notification-overlay">
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
        </div>
      )}

      {/* LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "10px 18px",
          fontSize: "16px",
          cursor: "pointer",
          zIndex: 10
        }}
      >
        Logout
      </button>

      {/* ICON DASHBOARD */}
      <div className="dashboard-card">
        <div className="icon-card" onClick={() => navigate("/driver/biodata")}>
          🧑‍✈️
          <span>Bio Data</span>
        </div>

        <div className="icon-card" onClick={() => navigate("/driver/checks")}>
          ✅
          <span>Checks</span>
        </div>

        <div className="icon-card" onClick={() => navigate("/driver/lr")}>
          📄
          <span>LR Details</span>
        </div>

        <div className="icon-card" onClick={() => navigate("/driver/daily")}>
          📝
          <span>Daily Activity</span>
        </div>

        <div
          className="icon-card"
          onClick={() => navigate("/driver/daily-history")}
        >
          📊
          <span>Daily History</span>
        </div>
      </div>
    </div>
  );
}
