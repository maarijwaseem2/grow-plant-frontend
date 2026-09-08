import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRole }) => {
  const user = JSON.parse(localStorage.getItem("user")); // Assume role is stored in localStorage after login

  if (!user || user.role !== allowedRole) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
