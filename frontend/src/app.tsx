
import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import type { NavLink } from "./components/Navbar.tsx";
import PredictorForm from "./components/Predictorform.tsx";
import PredictionResult from "./components/Predictionresult.tsx";
import HistoryTable from "./components/Historytable.tsx";
import CityChart from "./components/Citychart.tsx";

// ─── Route → NavLink mapping ──────────────────────────────────────────────────

const PATH_TO_TAB: Record<string, NavLink> = {
  "/predictor": "Predictor",
  "/history": "History",
  "/analytics": "Analytics",
};

const TAB_TO_PATH: Record<NavLink, string> = {
  Predictor: "/predictor",
  History: "/history",
  Analytics: "/analytics",
};

// ─── Predictor page ───────────────────────────────────────────────────────────

const PredictorPage: React.FC = () => {
  const [predictedAqi, setPredictedAqi] = useState<number | null>(null);
  //console.log("Predicted AQI updated:", predictedAqi);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PredictorForm onResult={setPredictedAqi} />
      <PredictionResult predictedAqi={predictedAqi} />
    </div>
  );
};

// ─── History page ─────────────────────────────────────────────────────────────

const HistoryPage: React.FC = () => (
  <div className="mx-auto max-w-5xl">
    <HistoryTable />
  </div>
);

// ─── Analytics page ───────────────────────────────────────────────────────────

const AnalyticsPage: React.FC = () => (
  <div className="mx-auto max-w-5xl">
    <CityChart />
  </div>
);

// ─── Shell (Navbar + outlet) ──────────────────────────────────────────────────

const AppShell: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab: NavLink =
    PATH_TO_TAB[location.pathname] ?? "Predictor";

  const handleTabChange = (tab: NavLink) => {
    navigate(TAB_TO_PATH[tab]);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-teal-500/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-teal-400/5 blur-3xl" />
      </div>

      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Page header */}
      <header className="relative border-b border-slate-800/50 bg-slate-900/30 py-10">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-teal-500">
            Air Quality Intelligence
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-50">
            {activeTab === "Predictor" && "Forecast Air Quality"}
            {activeTab === "History" && "Prediction History"}
            {activeTab === "Analytics" && "City Analytics"}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {activeTab === "Predictor" && "Enter city & current AQI to generate a next-period prediction."}
            {activeTab === "History" && "Browse all stored AQI predictions with pagination."}
            {activeTab === "Analytics" && "Visualise actual vs predicted AQI trends for any city."}
          </p>
        </div>
      </header>

      {/* Route outlet */}
      <main className="relative mx-auto max-w-6xl px-6 py-10">
        <Routes>
          <Route path="/predictor" element={<PredictorPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          {/* Fallback → Predictor */}
          <Route path="*" element={<Navigate to="/predictor" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-slate-800/50 py-6 text-center">
        <p className="font-mono text-xs text-slate-600">
          AQI·PREDICT &mdash; powered by{" "}
          <span className="text-teal-600">AQI tech</span>
        </p>
      </footer>
    </div>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────

const App: React.FC = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);

export default App;
