import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [role, setRole] = useState("driver");
  const [pfNo, setPfNo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSignIn = () => {
    // ---- TEMP FRONTEND LOGIN (NO BACKEND) ----
    const activeUsers =
      JSON.parse(localStorage.getItem("activeUsers")) || [];

    if (role === "driver") {
      activeUsers.push({
        role: "driver",
        pfNo: pfNo || "UNKNOWN"
      });
      localStorage.setItem("activeUsers", JSON.stringify(activeUsers));
      navigate("/driver");
    }

    if (role === "manager") {
      activeUsers.push({
        role: "manager",
        email: email || "manager@mail.com"
      });
      localStorage.setItem("activeUsers", JSON.stringify(activeUsers));
      navigate("/manager");
    }

    if (role === "admin") {
      activeUsers.push({
        role: "admin",
        email: email || "admin@mail.com"
      });
      localStorage.setItem("activeUsers", JSON.stringify(activeUsers));
      navigate("/admin");
    }
  };

  return (
    <div className="hero-container">
      {/* BACKGROUND VIDEO */}
      <video className="hero-video" autoPlay loop muted playsInline>
        <source src="/videos/road.mp4" type="video/mp4" />
      </video>

      {/* PROJECT TITLE */}
      <div className="corner-title logo">Tower Car</div>

      {/* OVERLAY */}
      <div className="hero-overlay">
        <div className="login-content">
          <h2 className="login-heading">Sign In</h2>

          {/* ROLE SELECTION */}
          <label>Select Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="driver">Driver</option>
            <option value="manager">Depot Manager</option>
            <option value="admin">Super Admin</option>
          </select>

          {/* ROLE BASED FIELDS */}
          {role === "driver" ? (
            <>
              <label>PF Number</label>
              <input
                value={pfNo}
                onChange={(e) => setPfNo(e.target.value)}
                placeholder="Enter PF Number"
              />
            </>
          ) : (
            <>
              <label>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
              />
            </>
          )}

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
          />

          {/* SIGN IN BUTTON */}
          <button
            type="button"
            className="login-btn"
            onClick={handleSignIn}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
