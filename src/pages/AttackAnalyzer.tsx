import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertTriangle, Shield, CheckCircle, ChevronDown, Brain, ServerCrash } from "lucide-react";

const BACKEND_URL = "http://localhost:3001";

// ── Types ─────────────────────────────────────────────────────────────────────
interface AnalysisResult {
  attackType:     string;
  riskLevel:      number;
  classification: string;
  osiLayer:       string;
  severity:       string;
  summary:        string;
  mitigations:    string[];
}

// ── Colour helpers ─────────────────────────────────────────────────────────────
const getRiskColor = (level: number) => {
  if (level >= 70) return "text-destructive";
  if (level >= 40) return "text-warning";
  return "text-accent";
};

const getRiskBarColor = (level: number) => {
  if (level >= 70) return "bg-destructive";
  if (level >= 40) return "bg-warning";
  return "bg-accent";
};

const getSeverityStyle = (severity: string) => {
  switch (severity?.toUpperCase()) {
    case "CRITICAL": return "bg-destructive/20 text-destructive border-destructive/30";
    case "HIGH":     return "bg-orange-500/20  text-orange-400  border-orange-500/30";
    case "MEDIUM":   return "bg-warning/20     text-warning     border-warning/30";
    default:         return "bg-accent/20      text-accent      border-accent/30";
  }
};

const AttackAnalyzer = () => {
  const [input,    setInput]    = useState("");
  const [result,   setResult]   = useState<AnalysisResult | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [models,   setModels]   = useState<string[]>(["deepseek-r1:8b", "llama3"]);
  const [model,    setModel]    = useState("llama3");
  const [showDrop, setShowDrop] = useState(false);
  const [usedModel,setUsedModel]= useState("");

  // ── Fetch available models on mount ────────────────────────────────────────
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/ai/models`)
      .then((r) => r.json())
      .then((d) => {
        if (d.models?.length) {
          setModels(d.models);
          setModel(d.models[0]);
        }
      })
      .catch(() => {}); // silently fall back to defaults
  }, []);

  // ── Analyze ─────────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res  = await fetch(`${BACKEND_URL}/api/ai/analyze`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ input, model }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Analysis failed");
        return;
      }

      setResult(data.result);
      setUsedModel(data.model);
    } catch {
      setError("Cannot reach backend. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Attack Analyzer</h1>
        <p className="text-muted-foreground text-sm">AI-powered threat classification and risk assessment</p>
      </div>

      {/* Input card */}
      <div className="glass-card p-6">
        <label className="text-sm font-medium text-muted-foreground mb-2 block font-mono">
          THREAT_INPUT://
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Describe a cybersecurity scenario or suspicious activity... e.g., "Repeated failed login attempts from IP 192.168.1.105 with SQL injection patterns in POST body"'
          className="w-full h-32 bg-background/50 border border-border rounded-lg p-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all resize-none font-mono"
        />

        <div className="flex justify-between items-center mt-4 gap-3">
          <span className="text-xs text-muted-foreground font-mono">
            {input.length > 0 ? `${input.length} chars` : "Awaiting input..."}
          </span>

          <div className="flex items-center gap-3">

            {/* Model selector */}
            <div className="relative">
              <button
                onClick={() => setShowDrop(!showDrop)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
              >
                <Brain className="w-3.5 h-3.5 text-primary" />
                {model}
                <ChevronDown className={`w-3 h-3 transition-transform ${showDrop ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showDrop && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 top-full mt-1 z-20 min-w-full bg-background border border-border rounded-lg shadow-xl overflow-hidden"
                  >
                    {models.map((m) => (
                      <button
                        key={m}
                        onClick={() => { setModel(m); setShowDrop(false); }}
                        className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors hover:bg-primary/10 ${
                          model === m ? "text-primary bg-primary/5" : "text-muted-foreground"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Analyze button */}
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
      </div>

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card p-5 border border-destructive/30 bg-destructive/5 flex items-start gap-3"
          >
            <ServerCrash className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-mono text-destructive font-semibold mb-1">Analysis Failed</p>
              <p className="text-xs text-muted-foreground">{error}</p>
              {error.includes("Ollama") && (
                <code className="text-xs text-primary mt-2 block">$ ollama serve</code>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeleton */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="glass-card p-5 space-y-3 animate-pulse">
                <div className="h-3 w-24 bg-muted/50 rounded" />
                <div className="h-5 w-36 bg-muted/50 rounded" />
                <div className="h-3 w-20 bg-muted/40 rounded" />
              </div>
            ))}
          </div>
          <div className="glass-card p-6 space-y-3 animate-pulse">
            <div className="h-3 w-40 bg-muted/50 rounded" />
            {[0,1,2,3,4].map((i) => (
              <div key={i} className="h-10 bg-muted/30 rounded-lg" />
            ))}
          </div>
          <p className="text-center text-xs font-mono text-muted-foreground">
            🤖 {model} is thinking...
          </p>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Used model badge */}
            <div className="flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-mono text-muted-foreground">
                Analyzed by <span className="text-primary">{usedModel}</span>
              </span>
            </div>

            {/* Top 3 cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Attack Type */}
              <motion.div
                className="glass-card p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="text-xs font-mono text-muted-foreground">ATTACK_TYPE</span>
                </div>
                <p className="font-semibold text-foreground">{result.attackType}</p>
                <p className="text-xs text-muted-foreground mt-1">{result.osiLayer}</p>
              </motion.div>

              {/* Risk Level */}
              <motion.div
                className="glass-card p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-warning" />
                  <span className="text-xs font-mono text-muted-foreground">RISK_LEVEL</span>
                </div>
                <div className="flex items-end gap-2">
                  <motion.span
                    className={`text-4xl font-black font-mono ${getRiskColor(result.riskLevel)}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {result.riskLevel}
                  </motion.span>
                  <span className="text-sm text-muted-foreground mb-1">/ 100</span>
                </div>
                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${getRiskBarColor(result.riskLevel)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${result.riskLevel}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </motion.div>

              {/* Classification */}
              <motion.div
                className="glass-card p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-xs font-mono text-muted-foreground">CLASSIFICATION</span>
                </div>
                <p className="font-semibold text-foreground">{result.classification}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-mono border ${getSeverityStyle(result.severity)}`}>
                  {result.severity?.toUpperCase() ?? "UNKNOWN"}
                </span>
              </motion.div>
            </div>

            {/* AI Summary */}
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm font-mono text-muted-foreground">AI_SUMMARY</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{result.summary}</p>
            </motion.div>

            {/* Mitigations */}
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span className="text-sm font-mono text-muted-foreground">RECOMMENDED_MITIGATIONS</span>
              </div>
              <div className="space-y-3">
                {result.mitigations.map((m, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                  >
                    <span className="text-xs font-mono text-accent mt-0.5 flex-shrink-0">
                      0{i + 1}
                    </span>
                    <span className="text-sm text-foreground">{m}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttackAnalyzer;