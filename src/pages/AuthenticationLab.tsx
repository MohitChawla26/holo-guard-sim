import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, Lock, Unlock, ShieldCheck, Eye, EyeOff, Mail, Loader2 } from "lucide-react";

const BACKEND_URL = "http://localhost:3001";

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = "login" | "otp" | "success";
type Role = "admin" | "user";

const AuthenticationLab = () => {
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [step,        setStep]        = useState<Step>("login");
  const [otp,         setOtp]         = useState("");
  const [role,        setRole]        = useState<Role>("user");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // ── Password strength ──────────────────────────────────────────────────────
  const passwordStrength = (() => {
    if (password.length === 0) return 0;
    let s = 0;
    if (password.length >= 8)        s++;
    if (/[A-Z]/.test(password))      s++;
    if (/[0-9]/.test(password))      s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthColor = ["bg-destructive", "bg-destructive", "bg-warning", "bg-primary", "bg-accent"][passwordStrength];
  const strengthLabel = ["", "Weak", "Fair", "Strong", "Excellent"][passwordStrength];

  // ── Step 1: Send OTP to email ──────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email || !password) return;
    setError(null);
    setLoading(true);

    try {
      const res  = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        return;
      }

      setStep("otp");
    } catch {
      setError("Cannot reach backend. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setError(null);
    setLoading(true);

    try {
      const res  = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        return;
      }

      setRole(data.role);  // backend decides: admin or user
      setStep("success");
    } catch {
      setError("Cannot reach backend. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = () => {
    setStep("login");
    setEmail("");
    setPassword("");
    setOtp("");
    setError(null);
    setRole("user");
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Authentication Lab</h1>
        <p className="text-muted-foreground text-sm">Multi-factor authentication and access control simulation</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2">
        {["Login", "MFA", "Access"].map((s, i) => {
          const currentIdx = ["login", "otp", "success"].indexOf(step);
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono transition-all ${
                i <= currentIdx
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-secondary text-muted-foreground"
              }`}>
                {i + 1}
              </div>
              <span className="text-xs text-muted-foreground">{s}</span>
              {i < 2 && <div className="w-12 h-px bg-border" />}
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Login ───────────────────────────────────────────────────── */}
      {step === "login" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8 max-w-md mx-auto"
        >
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-primary" />
            <span className="font-mono text-sm text-muted-foreground">SECURE_LOGIN</span>
          </div>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1.5">EMAIL</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="you@example.com"
                  className="w-full bg-background/50 border border-border rounded-lg p-3 pl-9 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/40"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1.5">PASSWORD</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full bg-background/50 border border-border rounded-lg p-3 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50 pr-10"
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength meter */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded transition-all ${
                        i < passwordStrength ? strengthColor : "bg-muted"
                      }`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{strengthLabel}</span>
                </div>
              )}
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-mono text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              onClick={handleLogin}
              disabled={!email || !password || loading}
              className="w-full py-3 rounded-lg font-semibold text-sm cyber-gradient-solid text-primary-foreground disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</>
                : "Send OTP →"
              }
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Step 2: OTP ─────────────────────────────────────────────────────── */}
      {step === "otp" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 max-w-md mx-auto text-center"
        >
          <KeyRound className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="font-semibold mb-1">Check Your Email</h3>
          <p className="text-sm text-muted-foreground mb-1">
            A 6-digit code was sent to
          </p>
          <p className="text-sm font-mono text-primary mb-6">{email}</p>

          <input
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
            placeholder="000000"
            className="w-full bg-background/50 border border-border rounded-lg p-3 text-center text-2xl font-mono text-foreground tracking-[0.5em] focus:outline-none focus:border-primary/50 mb-2"
          />

          {/* Expiry note */}
          <p className="text-xs text-muted-foreground mb-4">Code expires in 5 minutes</p>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs font-mono text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mb-4"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            onClick={handleVerifyOtp}
            disabled={otp.length !== 6 || loading}
            className="w-full py-3 rounded-lg font-semibold text-sm cyber-gradient-solid text-primary-foreground disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
              : "Verify Code"
            }
          </button>

          {/* Resend */}
          <button
            onClick={() => { setStep("login"); setOtp(""); setError(null); }}
            className="mt-4 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            ← Use a different email
          </button>
        </motion.div>
      )}

      {/* ── Step 3: Success ──────────────────────────────────────────────────── */}
      {step === "success" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 max-w-md mx-auto text-center"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
            <Unlock className="w-12 h-12 text-accent mx-auto mb-4" />
          </motion.div>

          <h3 className="font-semibold text-accent mb-1 neon-glow-green">Access Granted</h3>
          <p className="text-sm text-muted-foreground mb-1">Authenticated as</p>
          <p className="text-sm font-mono text-primary mb-1">{email}</p>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono border mb-6 ${
            role === "admin"
              ? "bg-destructive/15 text-destructive border-destructive/30"
              : "bg-accent/15 text-accent border-accent/30"
          }`}>
            {role.toUpperCase()}
          </span>

          {/* Permissions grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: "Dashboard", adminOnly: false },
              { label: "Users",     adminOnly: false },
              { label: "Settings",  adminOnly: true  },
              { label: "Logs",      adminOnly: true  },
            ].map(({ label, adminOnly }) => {
              const allowed = !adminOnly || role === "admin";
              return (
                <div
                  key={label}
                  className={`p-3 rounded-lg border text-sm font-mono flex items-center gap-2 ${
                    allowed
                      ? "bg-accent/10 border-accent/20 text-accent"
                      : "bg-destructive/10 border-destructive/20 text-destructive"
                  }`}
                >
                  {allowed
                    ? <ShieldCheck className="w-3.5 h-3.5" />
                    : <Lock className="w-3.5 h-3.5" />
                  }
                  {label}
                </div>
              );
            })}
          </div>

          <button
            onClick={reset}
            className="text-sm text-primary hover:underline"
          >
            Reset Simulation
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default AuthenticationLab;