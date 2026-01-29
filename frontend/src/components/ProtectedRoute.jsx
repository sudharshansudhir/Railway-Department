import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const passwordChanged = localStorage.getItem("passwordChanged");
  const location = useLocation();

  // Not logged in
  if (!token) return <Navigate to="/" />;

  // Password not changed - redirect to change password page
  // (except if already on change-password page to avoid loop)
  if (passwordChanged === "false" && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" />;
  }

  // Role mismatch
  if (role && userRole !== role) return <Navigate to="/" />;

  return children;
}
