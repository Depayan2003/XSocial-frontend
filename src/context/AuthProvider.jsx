// import { useEffect, useState } from "react";
// import { AuthContext } from "./AuthContext";

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(() => localStorage.getItem("token"));

//   const login = (jwt) => {
//     localStorage.setItem("token", jwt);
//     setToken(jwt);
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     setToken(null);
//   };

//   useEffect(() => {
//     const syncAuth = () => {
//       setToken(localStorage.getItem("token"));
//     };

//     window.addEventListener("storage", syncAuth);
//     return () => window.removeEventListener("storage", syncAuth);
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         token,
//         isAuthenticated: !!token,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import api from "../api/api";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (jwt) => {
    localStorage.setItem("token", jwt);
    setToken(jwt);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setMyProfile(null);
  };

  /* 🔄 Load profile whenever token changes */
  useEffect(() => {
    if (!token) {
      setMyProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    api.get("/users/me")
      .then(res => setMyProfile(res.data))
      .catch(() => logout()) // disabled user / invalid token
      .finally(() => setLoading(false));
  }, [token]);

  /* 🔄 Sync logout across tabs */
  useEffect(() => {
    const syncAuth = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        myProfile,
        isAuthenticated: !!token,
        isAdmin: myProfile?.role === "ADMIN",
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
