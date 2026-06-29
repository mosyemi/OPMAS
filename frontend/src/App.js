/**
 * OPMAS-001 | App Root
 * Routes and global layout.
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage  from './pages/DashboardPage';
import AlarmsPage     from './pages/AlarmsPage';
import EquipmentPage  from './pages/EquipmentPage';
import ReportsPage    from './pages/ReportsPage';
import LoginPage      from './pages/LoginPage';
import NotFoundPage   from './pages/NotFoundPage';
import Layout         from './components/dashboard/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"  element={<DashboardPage />} />
          <Route path="alarms"     element={<AlarmsPage />} />
          <Route path="equipment"  element={<EquipmentPage />} />
          <Route path="reports"    element={<ReportsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
