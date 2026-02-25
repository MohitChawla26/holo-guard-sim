import { useState } from "react";
import { NavLink, useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Lock, Shield, KeyRound, Database, Activity, Bot,
  ChevronLeft, ChevronRight, User
} from "lucide-react";

const navItems = [
  { path: "/dashboard/attack-analyzer", label: "Attack Analyzer", icon: Zap },
  { path: "/dashboard/cryptography", label: "Cryptography Lab", icon: Lock },
  { path: "/dashboard/firewall", label: "Firewall Simulator", icon: Shield },
  { path: "/dashboard/authentication", label: "Auth Lab", icon: KeyRound },
  { path: "/dashboard/database-security", label: "DB Security", icon: Database },
  { path: "/dashboard/ids-monitor", label: "IDS Monitor", icon: Activity },
  { path: "/dashboard/ai-assistant", label: "AI Assistant", icon: Bot },
];

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const currentModule = navItems.find(n => location.pathname.startsWith(n.path));

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <motion.aside
        className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-40 flex flex-col"
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2 }}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border gap-2">
          <Shield className="w-6 h-6 text-primary shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-bold text-sm cyber-text-gradient whitespace-nowrap"
              >
                CyberShield AI
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                  isActive
                    ? "bg-primary/10 text-primary neon-border"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-12 flex items-center justify-center border-t border-sidebar-border text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </motion.aside>

      {/* Main */}
      <motion.div
        className="flex-1 flex flex-col min-h-screen"
        animate={{ marginLeft: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2 }}
      >
        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2">
            {currentModule && <currentModule.icon className="w-4 h-4 text-primary" />}
            <span className="font-medium text-sm">{currentModule?.label || "Dashboard"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground">SYS:ONLINE</span>
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
};

export default DashboardLayout;
