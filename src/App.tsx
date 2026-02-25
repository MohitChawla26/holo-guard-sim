import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ParticleBackground from "./components/ParticleBackground";
import DashboardLayout from "./components/DashboardLayout";
import Landing from "./pages/Landing";
import DashboardIndex from "./pages/DashboardIndex";
import AttackAnalyzer from "./pages/AttackAnalyzer";
import CryptographyLab from "./pages/CryptographyLab";
import FirewallSimulator from "./pages/FirewallSimulator";
import AuthenticationLab from "./pages/AuthenticationLab";
import DatabaseSecurity from "./pages/DatabaseSecurity";
import IDSMonitor from "./pages/IDSMonitor";
import AIAssistant from "./pages/AIAssistant";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ParticleBackground />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardIndex />} />
            <Route path="attack-analyzer" element={<AttackAnalyzer />} />
            <Route path="cryptography" element={<CryptographyLab />} />
            <Route path="firewall" element={<FirewallSimulator />} />
            <Route path="authentication" element={<AuthenticationLab />} />
            <Route path="database-security" element={<DatabaseSecurity />} />
            <Route path="ids-monitor" element={<IDSMonitor />} />
            <Route path="ai-assistant" element={<AIAssistant />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
