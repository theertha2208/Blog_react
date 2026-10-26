
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  apiRequest,
  initializeCsrf,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // CHECK CURRENT LOGIN SESSION
  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        await initializeCsrf();

        const data = await apiRequest("/api/auth/me/");

        if (active) {
          setUser(data.user ?? null);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  // LOGIN USER
  async function login(username, password) {
    await initializeCsrf();

    await apiRequest("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await apiRequest("/api/auth/me/");

    const loggedInUser = data.user;

    if (!loggedInUser) {
      setUser(null);

      throw new Error(
        "Unable to retrieve user information."
      );
    }

    setUser(loggedInUser);

    return loggedInUser;
  }

  // REGISTER USER
  async function register(formData) {
    await initializeCsrf();

    return apiRequest("/api/auth/register/", {
      method: "POST",
      body: JSON.stringify(formData),
    });
  }

  // LOGOUT USER
  async function logout() {
    await initializeCsrf();

    await apiRequest("/api/auth/logout/", {
      method: "POST",
    });

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// CUSTOM AUTH HOOK
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}
