import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const RestrictedRoute = () => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    const userRole = decodedToken.role;

    // Allow access only to the admin dashboard for admin users
    if (userRole === "Admin") {
      return <Navigate to="/admin/dashboard" />;
    }

    return <Outlet />; // Render allowed routes for non-admins
  } catch (error) {
    console.error("Invalid token:", error);
    return <Navigate to="/login" />;
  }
};

export default RestrictedRoute;
