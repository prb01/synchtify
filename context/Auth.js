import useFirebaseAuth from "../lib/useFirebaseAuth";
import React, { useContext, createContext } from "react";

const AuthContext = createContext({
  isAuthenticated: false,
  isLoading: true,
  isLoaded: false,
  user: null,
});

export const AuthProvider = ({ children, onLogin }) => {
  const { user, isLoading, isLoaded } = useFirebaseAuth(onLogin);

  return (
    <AuthContext.Provider
      value={{ isLoading, isLoaded, user, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
