import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Router, Shield, Server, Plus, Trash2, Wifi, WifiOff, Loader2 } from "lucide-react";
import { io, Socket } from "socket.io-client";

const BACKEND_URL = "http://localhost:3001";

interface FirewallRule {
  id: number;
  port: number;
  action: "allow" | "block";
  protocol: string;
}

interface Packet {
  id: number;
  port: number;
  protocol: string;
  status: "allowed" | "blocked";
  timestamp: string;
}

type ConnectionStatus = "live" | "disconnected" | "reconnecting";

const FirewallSimulator = () => {
  const [rules, setRules]             = useState<FirewallRule[]>([]);
  const [packets, setPackets]         = useState<Packet[]>([]);
  const [connStatus, setConnStatus]   = useState<ConnectionStatus>("disconnected");
  const [toast, setToast]             = useState<string | null>(null);
  const socketRef                     = useRef<Socket | null>(null);

  // ── Toast helper ────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Re-sync rules from backend (called on reconnect) ────────────────────────
  const syncRules = async () => {
    try {
      const res  = await fetch(`${BACKEND_URL}/api/rules`);
      const data = await res.json();
      setRules(data);
    } catch {
      // backend not reachable yet — socket will retry
    }
  };

  // ── Socket.io connection ────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ["websocket"],
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnStatus("live");
      syncRules();                          // re-sync on every reconnect
    });

    socket.on("disconnect", () => {
      setConnStatus("disconnected");
    });

    socket.on("reconnect_attempt", () => {
      setConnStatus("reconnecting");
    });

    socket.on("rules_updated", (data: FirewallRule[]) => setRules(data));

    socket.on("new_packet", (pkt: Packet) =>
      setPackets((prev) => [...prev.slice(-49), pkt])
    );

    return () => { socket.disconnect(); };
  }, []);

  // ── Guard: block actions when offline ───────────────────────────────────────
  const isOffline = connStatus !== "live";

  const safeAction = async (fn: () => Promise<void>, label: string) => {
    if (isOffline) {
      showToast(`❌ Cannot ${label} — you're offline`);
      return;
    }
    try {
      await fn();
    } catch {
      showToast(`❌ ${label} failed — connection lost`);
    }
  };

  // ── Rule actions ─────────────────────────────────────────────────────────────
  const toggleRule = (id: number) =>
    safeAction(
      () => fetch(`${BACKEND_URL}/api/rules/${id}`, { method: "PATCH" }).then(() => {}),
      "toggle rule"
    );

  const addRule = () =>
    safeAction(
      () =>
        fetch(`${BACKEND_URL}/api/rules`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ port: 8080, action: "block", protocol: "Custom" }),
        }).then(() => {}),
      "add rule"
    );

  const deleteRule = (id: number) =>
    safeAction(
      () => fetch(`${BACKEND_URL}/api/rules/${id}`, { method: "DELETE" }).then(() => {}),
      "delete rule"
    );

  // ── Status badge config ──────────────────────────────────────────────────────
  const statusConfig = {
    live:          { label: "LIVE",          icon: Wifi,     cls: "bg-accent/10      text-accent      border-accent/30"      },
    disconnected:  { label: "DISCONNECTED",  icon: WifiOff,  cls: "bg-destructive/10 text-destructive border-destructive/30" },
    reconnecting:  { label: "RECONNECTING",  icon: Loader2,  cls: "bg-yellow-500/10  text-yellow-400  border-yellow-500/30"  },
  }[connStatus];

  // ── UI ───────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive text-xs font-mono shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Firewall Simulator</h1>
          <p className="text-muted-foreground text-sm">Real-time packet flow and rule configuration</p>
        </div>

        {/* Connection badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border ${statusConfig.cls}`}>
          <statusConfig.icon className={`w-3.5 h-3.5 ${connStatus === "reconnecting" ? "animate-spin" : ""}`} />
          {statusConfig.label}
        </div>
      </div>

      {/* Offline warning banner */}
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
                : "⚠  Backend unreachable. Rules are read-only until connection is restored."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Network flow visualization */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          {[
            { icon: Monitor, label: "Client",   color: "text-primary"          },
            { icon: Router,  label: "Router",   color: "text-muted-foreground" },
            { icon: Shield,  label: "Firewall", color: "text-primary"          },
            { icon: Server,  label: "Server",   color: "text-accent"           },
          ].map((node) => (
            <div key={node.label} className="flex flex-col items-center gap-2 z-10">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                node.label === "Firewall" ? "bg-primary/15 neon-border" : "bg-secondary"
              }`}>
                <node.icon className={`w-6 h-6 ${node.color}`} />
              </div>
              <span className="text-xs font-mono text-muted-foreground">{node.label}</span>
            </div>
          ))}
        </div>

        {/* Packet stream */}
        <div className="relative h-16 bg-muted/30 rounded-lg overflow-hidden border border-border/50">
          <AnimatePresence>
            {packets.slice(-5).map((packet) => (
              <motion.div
                key={packet.id}
                className={`absolute top-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1 ${
                  packet.status === "allowed"
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : "bg-destructive/20 text-destructive border border-destructive/30"
                }`}
                initial={{ left: "0%", opacity: 0 }}
                animate={{
                  left: packet.status === "blocked" ? "50%" : "90%",
                  opacity: [0, 1, 1, packet.status === "blocked" ? 0 : 1],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: packet.status === "blocked" ? 1.5 : 2.5, ease: "easeInOut" }}
              >
                :{packet.port} {packet.protocol}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Offline overlay — dims the stream when disconnected */}
          {isOffline && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <span className="text-xs font-mono text-muted-foreground">
                {connStatus === "reconnecting" ? "Reconnecting..." : "Stream paused"}
              </span>
            </div>
          )}

          {/* Firewall line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/30" />
        </div>
      </div>

      {/* Rules and log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Rules */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-muted-foreground">FIREWALL_RULES</span>
            <button
              onClick={addRule}
              disabled={isOffline}
              className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {rules.length === 0 ? (
            <span className="text-muted-foreground text-xs">
              {connStatus === "live" ? "No rules configured." : "Connecting to backend..."}
            </span>
          ) : (
            <div className="space-y-2">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/30 transition-opacity ${
                    isOffline ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-foreground">:{rule.port}</span>
                    <span className="text-xs text-muted-foreground">{rule.protocol}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      disabled={isOffline}
                      className={`px-3 py-1 rounded-full text-xs font-mono transition-all disabled:cursor-not-allowed ${
                        rule.action === "allow"
                          ? "bg-accent/15 text-accent border border-accent/30"
                          : "bg-destructive/15 text-destructive border border-destructive/30"
                      }`}
                    >
                      {rule.action.toUpperCase()}
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      disabled={isOffline}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Packet log */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-muted-foreground">PACKET_LOG</span>
            <span className="font-mono text-xs text-muted-foreground">{packets.length} packets</span>
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {packets.slice().reverse().map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 text-xs font-mono py-1.5 px-2 rounded bg-background/20"
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  p.status === "allowed" ? "bg-accent" : "bg-destructive"
                }`} />
                <span className="text-muted-foreground">
                  {new Date(p.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-foreground">:{p.port}</span>
                <span className="text-muted-foreground">{p.protocol}</span>
                <span className={p.status === "allowed" ? "text-accent" : "text-destructive"}>
                  {p.status.toUpperCase()}
                </span>
              </div>
            ))}
            {packets.length === 0 && (
              <span className="text-muted-foreground text-xs">Awaiting packets...</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FirewallSimulator;