import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, AlertTriangle, Shield, CheckCircle } from "lucide-react";

const sampleResults = {
  attackType: "SQL Injection via HTTP POST",
  riskLevel: 85,
  classification: "Active Attack",
  osiLayer: "Application Layer (L7)",
  mitigations: [
    "Implement parameterized queries",
    "Deploy Web Application Firewall (WAF)",
    "Enable input validation and sanitization",
    "Implement rate limiting on login endpoints",
    "Enable detailed logging and monitoring",
  ],
};

const getRiskColor = (level: number) => {
  if (level >= 70) return "text-destructive";
  if (level >= 40) return "text-warning";
  return "text-accent";
};

const getRiskBg = (level: number) => {
  if (level >= 70) return "bg-destructive/20 border-destructive/30";
  if (level >= 40) return "bg-warning/20 border-warning/30";
  return "bg-accent/20 border-accent/30";
};

const AttackAnalyzer = () => {
  const [input, setInput] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    if (!input.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAnalyzed(true);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Attack Analyzer</h1>
        <p className="text-muted-foreground text-sm">AI-powered threat classification and risk assessment</p>
      </div>

      {/* Input */}
      <div className="glass-card p-6">
        <label className="text-sm font-medium text-muted-foreground mb-2 block font-mono">
          THREAT_INPUT://
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe a cybersecurity scenario or suspicious activity... e.g., 'Repeated failed login attempts from IP 192.168.1.105 with SQL injection patterns in POST body'"
          className="w-full h-32 bg-background/50 border border-border rounded-lg p-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:neon-border transition-all resize-none font-mono"
        />
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-muted-foreground font-mono">
            {input.length > 0 ? `${input.length} chars` : "Awaiting input..."}
          </span>
          <button
            onClick={handleAnalyze}
            disabled={!input.trim() || loading}
            className="px-6 py-2.5 rounded-lg font-semibold text-sm cyber-gradient-solid text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-all shadow-[0_0_20px_hsl(186_100%_50%/0.2)]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" /> Analyze Threat
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {analyzed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Attack Type */}
            <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-xs font-mono text-muted-foreground">ATTACK_TYPE</span>
              </div>
              <p className="font-semibold text-foreground">{sampleResults.attackType}</p>
              <p className="text-xs text-muted-foreground mt-1">{sampleResults.osiLayer}</p>
            </motion.div>

            {/* Risk Level */}
            <motion.div className={`glass-card p-5`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-warning" />
                <span className="text-xs font-mono text-muted-foreground">RISK_LEVEL</span>
              </div>
              <div className="flex items-end gap-2">
                <span className={`text-4xl font-black font-mono ${getRiskColor(sampleResults.riskLevel)}`}>
                  {sampleResults.riskLevel}
                </span>
                <span className="text-sm text-muted-foreground mb-1">/ 100</span>
              </div>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-destructive"
                  initial={{ width: 0 }}
                  animate={{ width: `${sampleResults.riskLevel}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </motion.div>

            {/* Classification */}
            <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono text-muted-foreground">CLASSIFICATION</span>
              </div>
              <p className="font-semibold text-foreground">{sampleResults.classification}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-mono border ${getRiskBg(sampleResults.riskLevel)}`}>
                HIGH SEVERITY
              </span>
            </motion.div>
          </div>

          {/* Mitigations */}
          <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span className="text-sm font-mono text-muted-foreground">RECOMMENDED_MITIGATIONS</span>
            </div>
            <div className="space-y-3">
              {sampleResults.mitigations.map((m, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <span className="text-xs font-mono text-accent mt-0.5">0{i + 1}</span>
                  <span className="text-sm text-foreground">{m}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AttackAnalyzer;
