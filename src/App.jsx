import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Meetings from './pages/Meetings';
import Audits from './pages/Audits';
import Analytics from './pages/Analytics';
import Attendance from './pages/Attendance';
import Incentives from './pages/Incentives';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children, managerOnly = false }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (managerOnly && user.role !== 'manager') return <Navigate to="/" />;
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="audits" element={<Audits />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="incentives" element={<Incentives />} />
          <Route path="settings" element={
            <ProtectedRoute managerOnly={true}>
              <Settings />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
