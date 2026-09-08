import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, publicRoutes = [] }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("authToken") !== null;

  // If the current route is public, render the children
  if (publicRoutes.includes(location.pathname)) {
    return children;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render the children for protected routes if authenticated
  return children;
};

export default ProtectedRoute;
