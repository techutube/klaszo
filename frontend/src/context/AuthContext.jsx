import { createContext, useState, useEffect } from 'react';
import posthog from 'posthog-js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, [token]);

  const login = (newToken, userData) => {
    setToken(newToken);
    if (userData) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Identify user in PostHog
      if (userData.id) {
        posthog.identify(userData.id, {
          email: userData.email,
          name: userData.name,
          role: userData.role
        });
      }
    }
  };

  const logout = () => {
    setToken(null);
    posthog.reset();
  };

  const updateUserInfo = (newData) => {
    setUser(newData);
    localStorage.setItem('user', JSON.stringify(newData));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};
