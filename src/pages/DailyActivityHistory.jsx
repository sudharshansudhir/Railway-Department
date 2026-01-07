import Navbar from "../components/Navbar";
import { useState } from "react";

export default function DailyActivityHistory() {
  const [data, setData] = useState(
    JSON.parse(localStorage.getItem("dailyActivity")) || []
  );

  // EXPORT CSV
  const exportCSV = () => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = [
      "Date",
      "Day",
      "Login Time",
      "Logout Time",
      "Login Location",
      "Logout Location",
      "Total Hours",
      "Total KMs"
    ];

    const rows = data.map(d => [
      d.date,
      d.day,
      d.loginTime,
      d.logoutTime,
      d.loginLocation,
      d.logoutLocation,
      d.totalHours,
      d.totalKms
    ]);

    const csvContent =
      [headers, ...rows]
        .map(r => r.join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "daily_activity_report.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  // CLEAR HISTORY
  const clearHistory = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all daily activity records?"
    );

    if (!confirmClear) return;

    localStorage.removeItem("dailyActivity");
    setData([]);
  };

  return (
    <>
      <Navbar />

      <div className="dark-page" style={{ paddingTop: "100px" }}>
        <div className="checks-card">
          <h2>Daily Activity History</h2>

          {data.length === 0 ? (
            <p>No daily activity records found</p>
          ) : (
            <>
              {/* ACTION BUTTONS */}
              <div style={{ marginBottom: "15px" }}>
                <button onClick={exportCSV} style={{ marginRight: "10px" }}>
                  Export CSV
                </button>

                <button
                  onClick={clearHistory}
                  style={{ backgroundColor: "#c0392b", color: "white" }}
                >
                  Clear History
                </button>
              </div>

              {/* TABLE */}
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Login</th>
                    <th>Logout</th>
                    <th>Login Location</th>
                    <th>Logout Location</th>
                    <th>Total Hours</th>
                    <th>Total KMs</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((d, index) => (
                    <tr key={index}>
                      <td>{d.date}</td>
                      <td>{d.day}</td>
                      <td>{d.loginTime}</td>
                      <td>{d.logoutTime}</td>
                      <td>{d.loginLocation}</td>
                      <td>{d.logoutLocation}</td>
                      <td>{d.totalHours}</td>
                      <td>{d.totalKms}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </>
  );
}
