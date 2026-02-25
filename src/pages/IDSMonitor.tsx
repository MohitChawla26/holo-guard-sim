import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, Shield, Wifi } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const generateData = () =>
  Array.from({ length: 20 }, (_, i) => ({
    time: `${i}s`,
    traffic: Math.floor(Math.random() * 80 + 20),
    threats: Math.floor(Math.random() * 15),
  }));

const alertTypes = [
  { type: "Port Scan Detected", ip: "192.168.1.105", severity: "high" },
  { type: "Brute Force Attempt", ip: "10.0.0.42", severity: "critical" },
  { type: "Suspicious DNS Query", ip: "172.16.0.88", severity: "medium" },
  { type: "Malware Signature Match", ip: "192.168.2.201", severity: "critical" },
  { type: "Unusual Outbound Traffic", ip: "10.0.1.15", severity: "low" },
];

const IDSMonitor = () => {
  const [data, setData] = useState(generateData());
  const [alerts, setAlerts] = useState(alertTypes.slice(0, 3));
  const [stats, setStats] = useState({ packets: 12847, threats: 23, blocked: 19 });

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const next = [...prev.slice(1), {
          time: `${parseInt(prev[prev.length - 1].time) + 1}s`,
          traffic: Math.floor(Math.random() * 80 + 20),
          threats: Math.floor(Math.random() * 15),
        }];
        return next;
      });
      setStats((s) => ({
        packets: s.packets + Math.floor(Math.random() * 50),
        threats: s.threats + (Math.random() > 0.7 ? 1 : 0),
        blocked: s.blocked + (Math.random() > 0.7 ? 1 : 0),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      setAlerts((prev) => [{ ...alert, ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` }, ...prev].slice(0, 8));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const severityColor: Record<string, string> = {
    critical: "bg-destructive/15 text-destructive border-destructive/30",
    high: "bg-warning/15 text-warning border-warning/30",
    medium: "bg-primary/15 text-primary border-primary/30",
    low: "bg-accent/15 text-accent border-accent/30",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">IDS Monitor</h1>
        <p className="text-muted-foreground text-sm">Real-time intrusion detection and traffic analysis</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Packets Analyzed", value: stats.packets.toLocaleString(), icon: Wifi, color: "text-primary" },
          { label: "Threats Detected", value: stats.threats, icon: AlertTriangle, color: "text-warning" },
          { label: "Attacks Blocked", value: stats.blocked, icon: Shield, color: "text-accent" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs font-mono text-muted-foreground">{s.label}</span>
            </div>
            <span className="text-2xl font-bold font-mono">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs text-muted-foreground">NETWORK_TRAFFIC // LIVE</span>
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse ml-auto" />
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(186, 100%, 50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(186, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 85%, 55%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(0, 85%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="hsl(215, 20%, 30%)" fontSize={10} tickLine={false} />
            <YAxis stroke="hsl(215, 20%, 30%)" fontSize={10} tickLine={false} />
            <Tooltip contentStyle={{ background: "hsl(222, 40%, 10%)", border: "1px solid hsl(222, 30%, 20%)", borderRadius: "8px", fontSize: "12px" }} />
            <Area type="monotone" dataKey="traffic" stroke="hsl(186, 100%, 50%)" fill="url(#trafficGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="threats" stroke="hsl(0, 85%, 55%)" fill="url(#threatGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts */}
      <div className="glass-card p-6">
        <span className="font-mono text-xs text-muted-foreground block mb-4">RECENT_ALERTS</span>
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <motion.div
              key={`${alert.ip}-${i}`}
              className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/30"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  alert.severity === "critical" ? "bg-destructive" : alert.severity === "high" ? "bg-warning" : "bg-primary"
                } ${alert.severity === "critical" ? "animate-pulse" : ""}`} />
                <span className="text-sm text-foreground">{alert.type}</span>
                <span className="text-xs font-mono text-muted-foreground">{alert.ip}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-mono border ${severityColor[alert.severity]}`}>
                {alert.severity.toUpperCase()}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IDSMonitor;
