import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DailyActivity() {
  const navigate = useNavigate();

  const [entry, setEntry] = useState({
    date: "",
    day: "",
    loginTime: "",
    logoutTime: "",
    loginLocation: "",
    logoutLocation: "",
    totalHours: "",
    totalKms: ""
  });

  // Capture login details on page load
  useEffect(() => {
    const now = new Date();

    const date = now.toISOString().split("T")[0];
    const day = now.toLocaleDateString("en-IN", { weekday: "long" });
    const loginTime = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });

    setEntry(prev => ({
      ...prev,
      date,
      day,
      loginTime
    }));

    // Capture login location
    navigator.geolocation.getCurrentPosition(pos => {
      setEntry(prev => ({
        ...prev,
        loginLocation:
          pos.coords.latitude.toFixed(3) +
          "," +
          pos.coords.longitude.toFixed(3)
      }));
    });
  }, []);

  // Save daily activity & return to driver dashboard
  const saveDailyActivity = () => {
    const now = new Date();
    const logoutTime = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });

    navigator.geolocation.getCurrentPosition(pos => {
      const finalEntry = {
        ...entry,
        logoutTime,
        logoutLocation:
          pos.coords.latitude.toFixed(3) +
          "," +
          pos.coords.longitude.toFixed(3)
      };

      const existing =
        JSON.parse(localStorage.getItem("dailyActivity")) || [];

      localStorage.setItem(
        "dailyActivity",
        JSON.stringify([...existing, finalEntry])
      );

      alert("Daily activity saved successfully");

      // ✅ Go back to Driver icon page
      navigate("/driver");
    });
  };

  return (
    <div className="dark-page">
      <div className="form-card yellow-card wide tall-form">
        <h2>Daily Activity</h2>

        <p><b>Date:</b> {entry.date}</p>
        <p><b>Day:</b> {entry.day}</p>
        <p><b>Login Time:</b> {entry.loginTime}</p>
        <p><b>Login Location:</b> {entry.loginLocation}</p>

        <label>Total Hours Run</label>
        <input
          value={entry.totalHours}
          onChange={e =>
            setEntry({ ...entry, totalHours: e.target.value })
          }
        />

        <label>Total KMs Run</label>
        <input
          value={entry.totalKms}
          onChange={e =>
            setEntry({ ...entry, totalKms: e.target.value })
          }
        />

        <button onClick={saveDailyActivity}>
          End Duty & Go Back
        </button>
      </div>
    </div>
  );
}
