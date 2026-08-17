import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RoleProvider } from './contexts/RoleContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

// Core Pages
import SplashScreen from './pages/SplashScreen';
import Landing from './pages/Landing';
import Login from './pages/Login';
import CreatePassword from './pages/CreatePassword';
import NotFound from './pages/NotFound';
import ComingSoon from './pages/ComingSoon';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import PHCManagement from './pages/Admin/PHCManagement';
import UserManagement from './pages/Admin/UserManagement';
import SystemUsers from './pages/Admin/SystemUsers';
import RolePermission from './pages/Admin/RolePermission';
import Reports from './pages/Admin/Reports';
import SystemSettings from './pages/Admin/SystemSettings';
import AuditLogs from './pages/Admin/AuditLogs';

// Supervisor Pages
import SupervisorDashboard from './pages/Supervisor/Dashboard';
import SupervisorPriorityVisits from './pages/Supervisor/PriorityVisits';
import SupervisorAlerts from './pages/Supervisor/Alerts';
import SupervisorAnalytics from './pages/Supervisor/Analytics';
import SupervisorReports from './pages/Supervisor/Reports';
import AshaManagement from './pages/Supervisor/AshaManagement';
import PharmacistManagement from './pages/Supervisor/PharmacistManagement';
import SupervisorPatientMonitoring from './pages/Supervisor/PatientMonitoring';

// ASHA Pages
import ASHADashboard from './pages/ASHA/Dashboard';
import ASHAHouseholds from './pages/ASHA/Households';
import ASHAPatients from './pages/ASHA/Patients';
import ASHAVisits from './pages/ASHA/Visits';
import ASHAMaternal from './pages/ASHA/Maternal';
import ASHAImmunization from './pages/ASHA/Immunization';
import ASHANutrition from './pages/ASHA/Nutrition';
import ASHAMedicine from './pages/ASHA/Medicine';
import ASHASync from './pages/ASHA/Sync';
import ASHAProfile from './pages/ASHA/Profile';

// Pharmacist Pages
import PharmacistDashboard from './pages/Pharmacist/Dashboard';
import MedicineManagement from './pages/Pharmacist/MedicineManagement';
import MedicineBatch from './pages/Pharmacist/MedicineBatch';
import StockTransactions from './pages/Pharmacist/StockTransactions';
import MedicineRequests from './pages/Pharmacist/MedicineRequests';
import Forecast from './pages/Pharmacist/Forecast';
import Alerts from './pages/Pharmacist/Alerts';
import PharmacistReports from './pages/Pharmacist/Reports';
import PharmacistProfile from './pages/Pharmacist/Profile';

export default function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Entrypoints */}
            <Route path="/" element={<SplashScreen />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-password" element={<CreatePassword />} />

            {/* Admin Workspaces */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="phc" element={<PHCManagement />} />
              <Route path="supervisors" element={<UserManagement />} />
              <Route path="users" element={<SystemUsers />} />
              <Route path="system-users" element={<SystemUsers />} />
              <Route path="roles" element={<RolePermission />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<SystemSettings />} />
              <Route path="audit" element={<AuditLogs />} />
              <Route path="*" element={<ComingSoon />} />
            </Route>

            {/* Supervisor Workspaces */}
            <Route
              path="/supervisor"
              element={
                <ProtectedRoute allowedRoles={['supervisor']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SupervisorDashboard />} />
              <Route path="ashas" element={<AshaManagement />} />
              <Route path="asha-workers" element={<AshaManagement />} />
              <Route path="pharmacists" element={<PharmacistManagement />} />
              <Route path="households" element={<ASHAHouseholds />} />
              <Route path="patients" element={<SupervisorPatientMonitoring />} />
              <Route path="patient-monitoring" element={<SupervisorPatientMonitoring />} />
              <Route path="visits" element={<SupervisorPriorityVisits />} />
              <Route path="priority-visits" element={<SupervisorPriorityVisits />} />
              <Route path="alerts" element={<SupervisorAlerts />} />
              <Route path="analytics" element={<SupervisorAnalytics />} />
              <Route path="reports" element={<SupervisorReports />} />
              <Route path="*" element={<ComingSoon />} />
            </Route>

            {/* ASHA Volunteer Workspaces */}
            <Route
              path="/asha"
              element={
                <ProtectedRoute allowedRoles={['asha']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ASHADashboard />} />
              <Route path="households" element={<ASHAHouseholds />} />
              <Route path="patients" element={<ASHAPatients />} />
              <Route path="visits" element={<ASHAVisits />} />
              <Route path="todays-visits" element={<ASHAVisits />} />
              <Route path="priority-cases" element={<ASHAVisits />} />
              <Route path="maternal" element={<ASHAMaternal />} />
              <Route path="maternal-care" element={<ASHAMaternal />} />
              <Route path="immunization" element={<ASHAImmunization />} />
              <Route path="child-immunization" element={<ASHAImmunization />} />
              <Route path="nutrition" element={<ASHANutrition />} />
              <Route path="medicine" element={<ASHAMedicine />} />
              <Route path="sync" element={<ASHASync />} />
              <Route path="profile" element={<ASHAProfile />} />
              <Route path="*" element={<ComingSoon />} />
            </Route>

            {/* Pharmacist Workspaces */}
            <Route
              path="/pharmacist"
              element={
                <ProtectedRoute allowedRoles={['pharmacist']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<PharmacistDashboard />} />
              <Route path="analytics" element={<PharmacistDashboard />} />
              <Route path="medicines" element={<MedicineManagement />} />
              <Route path="batches" element={<MedicineBatch />} />
              <Route path="transactions" element={<StockTransactions />} />
              <Route path="requests" element={<MedicineRequests />} />
              <Route path="forecast" element={<Forecast />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="reports" element={<PharmacistReports />} />
              <Route path="visits" element={<SupervisorPriorityVisits />} />
              <Route path="profile" element={<PharmacistProfile />} />
              <Route path="*" element={<ComingSoon />} />
            </Route>

            {/* Fallbacks */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </RoleProvider>
    </AuthProvider>
  );
}
