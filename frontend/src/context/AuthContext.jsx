import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dp_user') || 'null'); }
    catch { return null; }
  });

  function login(userData, token) {
    localStorage.setItem('dp_user', JSON.stringify(userData));
    localStorage.setItem('dp_user_token', token);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('dp_user');
    localStorage.removeItem('dp_user_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
