import { Navigate, useLocation } from "react-router-dom";

// Role-based guard. Reads the user saved at login: { token, role, ... }.
//  - Not logged in            -> send to /login (remembering where they came from)
//  - Logged in but wrong role -> send to home "/" (they ARE authenticated, just
//    not allowed here, so bouncing them to /login would be confusing)
const PrivateRoute = ({ children, allowedRole }) => {
  const location = useLocation();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const isLoggedIn = user && localStorage.getItem("authToken");

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
