import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, register as registerApi } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('taskhive_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await loginApi({ email, password });
    setUser(data);
    localStorage.setItem('taskhive_user', JSON.stringify(data));
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await registerApi({ name, email, password });
    setUser(data);
    localStorage.setItem('taskhive_user', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taskhive_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);