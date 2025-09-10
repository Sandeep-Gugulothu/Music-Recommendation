import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('music_rec_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup'

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('music_rec_token');
      if (storedToken) {
        api.setToken(storedToken);
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Session expired:', error);
          api.setToken(null);
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setUser(data.user);
    setToken(data.access_token);
    setAuthModalOpen(false);
    return data;
  };

  const signup = async (email, password, username, fullName) => {
    const data = await api.signup(email, password, username, fullName);
    setUser(data.user);
    setToken(data.access_token);
    setAuthModalOpen(false);
    return data;
  };

  const demoLogin = async () => {
    // Quick demo login or auto-creates demo user if not present
    try {
      return await login('demo@musicrec.local', 'demo1234');
    } catch (e) {
      // If demo account does not exist, sign it up
      try {
        return await signup('demo@musicrec.local', 'demo1234', 'DemoUser', 'Demo User');
      } catch (signupErr) {
        throw new Error('Could not initialize demo user');
      }
    }
  };

  const logout = () => {
    api.setToken(null);
    setToken(null);
    setUser(null);
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        demoLogin,
        logout,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
