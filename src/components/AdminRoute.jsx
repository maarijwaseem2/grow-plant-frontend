import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const AdminRoute = () => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    // If no token is found, redirect to login
    return <Navigate to="/login" />;
  }

  try {
    // Decode the token to extract user information
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    const userRole = decodedToken.role;

    // Check if the user is an admin
    if (userRole === "Admin") {
      const location = useLocation();

      // Restrict admin to only the allowed route
      if (location.pathname !== "/admin/dashboard") {
        return <Navigate to="/admin/dashboard" />;
      }

      return <Outlet />; // Render admin route content
    } else {
      // Redirect non-admins to home or their allowed routes
      return <Navigate to="/" />;
    }
  } catch (error) {
    console.error("Invalid token:", error);
    return <Navigate to="/login" />;
  }
};

export default AdminRoute;
