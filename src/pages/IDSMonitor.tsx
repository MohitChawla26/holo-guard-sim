import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, AlertTriangle, Shield, Wifi, WifiOff, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { io, Socket } from "socket.io-client";

const BACKEND_URL = "http://localhost:3001";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ChartPoint {
  time: string;
  traffic: number;
  threats: number;
}

interface IDSAlert {
  type: string;
  ip: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
}

interface IDSStats {
  packets: number;
  threats: number;
  blocked: number;
}

type ConnectionStatus = "live" | "disconnected" | "reconnecting";

// ── Severity styling ──────────────────────────────────────────────────────────
const severityColor: Record<string, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  high:     "bg-warning/15     text-warning     border-warning/30",
  medium:   "bg-primary/15     text-primary     border-primary/30",
  low:      "bg-accent/15      text-accent      border-accent/30",
};

const IDSMonitor = () => {
  const [chartData,  setChartData]  = useState<ChartPoint[]>([]);
  const [alerts,     setAlerts]     = useState<IDSAlert[]>([]);
  const [stats,      setStats]      = useState<IDSStats>({ packets: 0, threats: 0, blocked: 0 });
  const [connStatus, setConnStatus] = useState<ConnectionStatus>("disconnected");
  const socketRef                   = useRef<Socket | null>(null);

  // ── Fetch initial snapshot ─────────────────────────────────────────────────
  const syncSnapshot = async () => {
    try {
      const res  = await fetch(`${BACKEND_URL}/api/ids/stats`);
      const data = await res.json();
      setStats(data.stats);
      setChartData(data.chartData);
    } catch {
      // will retry on next reconnect
    }
  };

  // ── Socket.io ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ["websocket"],
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnStatus("live");
      syncSnapshot();                           // re-sync on connect / reconnect
    });

    socket.on("disconnect",       ()                  => setConnStatus("disconnected"));
    socket.on("reconnect_attempt",()                  => setConnStatus("reconnecting"));

    // Live chart updates
    socket.on("ids_chart",        (data: ChartPoint[]) => setChartData(data));

    // Live stats updates
    socket.on("ids_stats",        (data: IDSStats)     => setStats(data));

    // Live alert stream — prepend and keep last 8
    socket.on("ids_alert",        (alert: IDSAlert) =>
      setAlerts((prev) => [alert, ...prev].slice(0, 8))
    );

    return () => { socket.disconnect(); };
  }, []);

  const isOffline = connStatus !== "live";

  // ── Status badge config ────────────────────────────────────────────────────
  const statusConfig = {
    live:         { label: "LIVE",         icon: Wifi,    cls: "bg-accent/10      text-accent      border-accent/30"      },
    disconnected: { label: "DISCONNECTED", icon: WifiOff, cls: "bg-destructive/10 text-destructive border-destructive/30" },
    reconnecting: { label: "RECONNECTING", icon: Loader2, cls: "bg-yellow-500/10  text-yellow-400  border-yellow-500/30"  },
  }[connStatus];

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">IDS Monitor</h1>
          <p className="text-muted-foreground text-sm">Real-time intrusion detection and traffic analysis</p>
        </div>

        {/* Connection badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border ${statusConfig.cls}`}>
          <statusConfig.icon className={`w-3.5 h-3.5 ${connStatus === "reconnecting" ? "animate-spin" : ""}`} />
          {statusConfig.label}
        </div>
      </div>

      {/* Offline banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-mono">
              {connStatus === "reconnecting"
                ? "⟳  Attempting to reconnect to backend..."
                : "⚠  Backend unreachable. Displaying last known data."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Packets Analyzed", value: stats.packets.toLocaleString(), icon: Wifi,          color: "text-primary" },
          { label: "Threats Detected", value: stats.threats,                  icon: AlertTriangle,  color: "text-warning" },
          { label: "Attacks Blocked",  value: stats.blocked,                  icon: Shield,         color: "text-accent"  },
        ].map((s) => (
          <div key={s.label} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs font-mono text-muted-foreground">{s.label}</span>
            </div>
            <motion.span
              key={String(s.value)}
              className="text-2xl font-bold font-mono block"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {s.value}
            </motion.span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs text-muted-foreground">NETWORK_TRAFFIC // LIVE</span>
          <div className={`w-2 h-2 rounded-full ml-auto ${
            isOffline ? "bg-destructive" : "bg-accent animate-pulse"
          }`} />
        </div>

        {chartData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-xs font-mono">
            {isOffline ? "Waiting for connection..." : "Loading chart data..."}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="hsl(186, 100%, 50%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(186, 100%, 50%)" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="hsl(0, 85%, 55%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(0, 85%, 55%)" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="hsl(215, 20%, 30%)" fontSize={10} tickLine={false} />
              <YAxis stroke="hsl(215, 20%, 30%)" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(222, 40%, 10%)",
                  border: "1px solid hsl(222, 30%, 20%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="traffic" stroke="hsl(186, 100%, 50%)" fill="url(#trafficGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="threats"  stroke="hsl(0, 85%, 55%)"   fill="url(#threatGrad)"  strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Alerts */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs text-muted-foreground">RECENT_ALERTS</span>
          <span className="font-mono text-xs text-muted-foreground">{alerts.length} events</span>
        </div>

        {alerts.length === 0 ? (
          <span className="text-muted-foreground text-xs font-mono">
            {isOffline ? "Waiting for connection..." : "No alerts yet..."}
          </span>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {alerts.map((alert, i) => (
                <motion.div
                  key={`${alert.timestamp}-${i}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/30"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  layout
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      alert.severity === "critical" ? "bg-destructive animate-pulse" :
                      alert.severity === "high"     ? "bg-warning" : "bg-primary"
                    }`} />
                    <span className="text-sm text-foreground">{alert.type}</span>
                    <span className="text-xs font-mono text-muted-foreground">{alert.ip}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono border ${severityColor[alert.severity]}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
};

export default IDSMonitor;