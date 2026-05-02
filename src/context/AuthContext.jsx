import React, { createContext, useContext, useState, useEffect } from 'react';
import { DataManager } from '../utils/dataManager';
import { format } from 'date-fns';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('salespro_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (username, password) => {
    let role = null;
    let name = '';
    const lowerUsername = username.toLowerCase();
    
    if (lowerUsername === 'admin' && password === 'admin123') {
      role = 'manager';
      name = 'Manager';
    } else if (lowerUsername === 'malu' && password === 'malu@1234') {
      role = 'rep';
      name = 'Malavika';
    } else if (lowerUsername === 'rep' && password === 'rep123') {
      role = 'rep';
      name = 'Representative';
    }

    if (role) {
      const userData = { username, role, name, loginTime: new Date().toISOString() };
      setUser(userData);
      localStorage.setItem('salespro_user', JSON.stringify(userData));
      
      // Record session
      DataManager.addSession({
        date: format(new Date(), 'yyyy-MM-dd'),
        loginTime: format(new Date(), 'HH:mm:ss'),
        logoutTime: null,
        hoursWorked: 0,
        stats: DataManager.getActivity().find(a => a.date === format(new Date(), 'yyyy-MM-dd')) || {
          calls: 0, messages: 0, leadsContacted: 0, meetingsBooked: 0, followupsDone: 0
        }
      });
      
      return true;
    }
    return false;
  };

  const logout = () => {
    const logoutTime = format(new Date(), 'HH:mm:ss');
    const loginTime = user.loginTime;
    const hours = (new Date() - new Date(loginTime)) / (1000 * 60 * 60);
    
    DataManager.updateLastSession(logoutTime, hours.toFixed(2));
    
    setUser(null);
    localStorage.removeItem('salespro_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
