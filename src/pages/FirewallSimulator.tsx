import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Router, Shield, Server, Plus, Trash2 } from "lucide-react";

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
  status: "traveling" | "allowed" | "blocked";
  progress: number;
}

const defaultRules: FirewallRule[] = [
  { id: 1, port: 80, action: "allow", protocol: "HTTP" },
  { id: 2, port: 443, action: "allow", protocol: "HTTPS" },
  { id: 3, port: 22, action: "block", protocol: "SSH" },
  { id: 4, port: 23, action: "block", protocol: "Telnet" },
];

const FirewallSimulator = () => {
  const [rules, setRules] = useState<FirewallRule[]>(defaultRules);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [nextId, setNextId] = useState(5);

  const sendPacket = () => {
    const ports = [80, 443, 22, 23, 8080, 3306];
    const protocols = ["HTTP", "HTTPS", "SSH", "Telnet", "Custom", "MySQL"];
    const idx = Math.floor(Math.random() * ports.length);
    const port = ports[idx];
    const protocol = protocols[idx];
    const rule = rules.find((r) => r.port === port);
    const status = rule ? rule.action === "allow" ? "allowed" : "blocked" : "allowed";

    const packet: Packet = { id: Date.now(), port, protocol, status, progress: 0 };
    setPackets((prev) => [...prev.slice(-8), packet]);
  };

  useEffect(() => {
    const interval = setInterval(sendPacket, 2000);
    return () => clearInterval(interval);
  }, [rules]);

  const toggleRule = (id: number) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, action: r.action === "allow" ? "block" : "allow" } : r))
    );
  };

  const addRule = () => {
    setRules((prev) => [...prev, { id: nextId, port: 8080, action: "block", protocol: "Custom" }]);
    setNextId((p) => p + 1);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Firewall Simulator</h1>
        <p className="text-muted-foreground text-sm">Real-time packet flow and rule configuration</p>
      </div>

      {/* Network flow visualization */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          {/* Nodes */}
          {[
            { icon: Monitor, label: "Client", color: "text-primary" },
            { icon: Router, label: "Router", color: "text-muted-foreground" },
            { icon: Shield, label: "Firewall", color: "text-primary" },
            { icon: Server, label: "Server", color: "text-accent" },
          ].map((node, i) => (
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
          {/* Center firewall line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/30" />
        </div>
      </div>

      {/* Rules and log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rules */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-muted-foreground">FIREWALL_RULES</span>
            <button onClick={addRule} className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/30">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-foreground">:{rule.port}</span>
                  <span className="text-xs text-muted-foreground">{rule.protocol}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                      rule.action === "allow"
                        ? "bg-accent/15 text-accent border border-accent/30"
                        : "bg-destructive/15 text-destructive border border-destructive/30"
                    }`}
                  >
                    {rule.action.toUpperCase()}
                  </button>
                  <button
                    onClick={() => setRules((prev) => prev.filter((r) => r.id !== rule.id))}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Log */}
        <div className="glass-card p-6">
          <span className="font-mono text-xs text-muted-foreground block mb-4">PACKET_LOG</span>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {packets.slice().reverse().map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-xs font-mono py-1.5 px-2 rounded bg-background/20">
                <span className={`w-2 h-2 rounded-full ${p.status === "allowed" ? "bg-accent" : "bg-destructive"}`} />
                <span className="text-muted-foreground">{new Date(p.id).toLocaleTimeString()}</span>
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
