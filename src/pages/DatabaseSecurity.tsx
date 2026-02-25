import { useState } from "react";
import { motion } from "framer-motion";
import { Database, AlertTriangle, ShieldCheck } from "lucide-react";

const DatabaseSecurity = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secureMode, setSecureMode] = useState(false);
  const [attacked, setAttacked] = useState(false);

  const maliciousInput = "' OR 1=1 --";

  const unsafeQuery = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
  const safeQuery = `SELECT * FROM users WHERE username=? AND password=?`;

  const simulateAttack = () => {
    setUsername("admin");
    setPassword(maliciousInput);
    setAttacked(true);
  };

  const isVulnerable = attacked && !secureMode;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Database Security</h1>
        <p className="text-muted-foreground text-sm">SQL Injection vulnerability simulation and prevention</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setSecureMode(false); setAttacked(false); setUsername(""); setPassword(""); }}
          className={`px-4 py-2 rounded-lg text-sm font-mono transition-all ${
            !secureMode ? "bg-destructive/15 text-destructive border border-destructive/30" : "bg-secondary text-muted-foreground"
          }`}
        >
          Vulnerable Mode
        </button>
        <button
          onClick={() => { setSecureMode(true); setAttacked(false); setUsername(""); setPassword(""); }}
          className={`px-4 py-2 rounded-lg text-sm font-mono transition-all ${
            secureMode ? "bg-accent/15 text-accent border border-accent/30" : "bg-secondary text-muted-foreground"
          }`}
        >
          Secure Mode
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Login form */}
        <div className="glass-card p-6">
          <span className="font-mono text-xs text-muted-foreground block mb-4">LOGIN_FORM</span>
          <div className="space-y-3">
            <input
              value={username}
              onChange={(e) => { setUsername(e.target.value); setAttacked(false); }}
              placeholder="Username"
              className="w-full bg-background/50 border border-border rounded-lg p-3 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50"
            />
            <input
              value={password}
              onChange={(e) => { setPassword(e.target.value); setAttacked(false); }}
              placeholder="Password"
              className="w-full bg-background/50 border border-border rounded-lg p-3 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setAttacked(true)}
                className="flex-1 py-2.5 rounded-lg text-sm font-mono bg-secondary text-foreground hover:bg-secondary/80 transition-all"
              >
                Login
              </button>
              <button
                onClick={simulateAttack}
                className="flex-1 py-2.5 rounded-lg text-sm font-mono bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25 transition-all"
              >
                Simulate Attack
              </button>
            </div>
          </div>
        </div>

        {/* Query preview */}
        <div className="glass-card p-6">
          <span className="font-mono text-xs text-muted-foreground block mb-4">QUERY_PREVIEW</span>
          <div className={`p-4 rounded-lg border font-mono text-xs leading-relaxed ${
            isVulnerable
              ? "bg-destructive/10 border-destructive/30 text-destructive"
              : "bg-muted/30 border-border text-foreground"
          }`}>
            {secureMode ? safeQuery : unsafeQuery}
          </div>
          {secureMode && (
            <div className="mt-3 p-3 rounded-lg bg-accent/5 border border-accent/10">
              <span className="text-xs text-accent font-mono">✓ Parameterized query prevents injection</span>
            </div>
          )}
        </div>
      </div>

      {/* Result */}
      {attacked && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass-card p-6 ${isVulnerable ? "neon-border" : ""}`}
          style={isVulnerable ? { boxShadow: "0 0 20px hsl(0 85% 55% / 0.2)", borderColor: "hsl(0 85% 55% / 0.4)" } : {}}
        >
          {isVulnerable ? (
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-destructive shrink-0" />
              <div>
                <h3 className="font-semibold text-destructive mb-1">⚠ SQL Injection Successful!</h3>
                <p className="text-sm text-muted-foreground mb-3">The malicious input bypassed authentication. The query returned all user records.</p>
                <div className="p-3 rounded bg-destructive/10 border border-destructive/20 font-mono text-xs text-destructive">
                  Result: 247 rows returned — Full database exposed
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-8 h-8 text-accent shrink-0" />
              <div>
                <h3 className="font-semibold text-accent mb-1">✓ Attack Blocked</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {secureMode
                    ? "Parameterized queries prevented the injection attack."
                    : "No malicious input detected in this attempt."}
                </p>
                <div className="p-3 rounded bg-accent/10 border border-accent/20 font-mono text-xs text-accent">
                  Result: Authentication handled securely
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default DatabaseSecurity;
