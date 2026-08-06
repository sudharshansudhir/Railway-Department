import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" />;
  }

  if (role) {

    // ADEE can access SUPER_ADMIN pages
    if (role === "SUPER_ADMIN") {

      if (
        userRole !== "SUPER_ADMIN" &&
        userRole !== "ADEE"
      ) {
        return <Navigate to="/" />;
      }

    }

    else {

      if (role !== userRole) {
        return <Navigate to="/" />;
      }

    }

  }

  return children;

}