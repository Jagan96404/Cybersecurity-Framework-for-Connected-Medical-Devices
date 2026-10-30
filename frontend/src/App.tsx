import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { ScenarioSimulatorBar } from './components/layout/ScenarioSimulatorBar';
import { Footer } from './components/layout/Footer';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ClinicalViewPage } from './pages/ClinicalViewPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { DeviceInventoryPage } from './pages/DeviceInventoryPage';
import { DeviceDetailPage } from './pages/DeviceDetailPage';
import { PatientSafetyPage } from './pages/PatientSafetyPage';
import { ThreatCenterPage } from './pages/ThreatCenterPage';
import { IncidentResponsePage } from './pages/IncidentResponsePage';
import { SbomVulnerabilityPage } from './pages/SbomVulnerabilityPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { LoginPage } from './pages/LoginPage';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120] text-slate-100">
      <Navbar />
      <ScenarioSimulatorBar />
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 py-5">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            }
          />
          <Route
            path="/clinical-view"
            element={
              <MainLayout>
                <ClinicalViewPage />
              </MainLayout>
            }
          />
          <Route
            path="/digital-twin"
            element={
              <MainLayout>
                <DigitalTwinPage />
              </MainLayout>
            }
          />
          <Route
            path="/devices"
            element={
              <MainLayout>
                <DeviceInventoryPage />
              </MainLayout>
            }
          />
          <Route
            path="/devices/:id"
            element={
              <MainLayout>
                <DeviceDetailPage />
              </MainLayout>
            }
          />
          <Route
            path="/patient-safety"
            element={
              <MainLayout>
                <PatientSafetyPage />
              </MainLayout>
            }
          />
          <Route
            path="/threats"
            element={
              <MainLayout>
                <ThreatCenterPage />
              </MainLayout>
            }
          />
          <Route
            path="/incidents"
            element={
              <MainLayout>
                <IncidentResponsePage />
              </MainLayout>
            }
          />
          <Route
            path="/sbom"
            element={
              <MainLayout>
                <SbomVulnerabilityPage />
              </MainLayout>
            }
          />
          <Route
            path="/simulator"
            element={
              <MainLayout>
                <SimulatorPage />
              </MainLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

