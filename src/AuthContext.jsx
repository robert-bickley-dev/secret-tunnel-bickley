import { createContext, useContext, useState, useEffect } from "react";

const API = "https://fsa-jwt-practice.herokuapp.com";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState();
  const [location, setLocation] = useState("GATE");
  const [error, setError] = useState(null);

  useEffect(() => {
    // if there is a state token, store that value to session storage paired with the "token" key
    if (token) {
      sessionStorage.setItem("token", token);
      // run this effect every time token is updated in state.
    }
  }, [token]);

  useEffect(() => {
    // differentiate saved session token from state token
    const sessionToken = sessionStorage.getItem("token");
    // if there is a session token, set the state token to that value
    if (sessionToken) {
      setToken(sessionToken);
    }
    // do this upon initialization
  }, []);

  const signup = async (username, password) => {
    try {
      const response = await fetch(API + "/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.message);
      } else {
        setError(null);
        setToken(result.token);
        setLocation("TABLET");
      }
      return result;
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Please try again.");
    }
  };

  const authenticate = async () => {
    if (!token) {
      setError("No token found.  Please sign up first.");
      return;
    }
    try {
      const response = await fetch(API + "/authenticate", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.message);
      } else {
        setError(null);
        setLocation("TUNNEL");
      }
      return result;
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Please try again.");
    }
  };

  const value = { location, signup, authenticate, error };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw Error("useAuth must be used within an AuthProvider");
  return context;
}
