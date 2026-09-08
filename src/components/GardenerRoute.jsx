import React from "react";
import { Navigate } from "react-router-dom";

const GardenerRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user")); // ya context se
  if (!user || user.role !== "Gardener") {
    return <Navigate to="/login" />;
  }
  return children;
};

export default GardenerRoute;