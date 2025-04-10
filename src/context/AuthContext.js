import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.get('http://localhost:5000/users', {
        params: { email, password },
      });
      if (response.data.length > 0) {
        const userData = response.data[0];
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData)); // Persist user data
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (email, password, username, phoneNumber) => {
    try {
      const response = await axios.post('http://localhost:5000/users', {
        email,
        password,
        username,
        phoneNumber,
        role: 'client',
      });
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData)); // Persist user data
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Clear user data
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};