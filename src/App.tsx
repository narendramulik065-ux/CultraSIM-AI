import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Simulation from "./pages/Simulation";
import Report from "./pages/Report";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--color-navy-900)] text-slate-50 font-sans">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/simulation/:id" element={<Simulation />} />
          <Route path="/report/:id" element={<Report />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
