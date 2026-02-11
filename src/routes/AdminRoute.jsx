// import { useContext } from "react";
// import { Navigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";

// export default function AdminRoute({ children }) {
//   const { token, myProfile } = useContext(AuthContext);

//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   if (myProfile?.role !== "ADMIN") {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// }

import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}
