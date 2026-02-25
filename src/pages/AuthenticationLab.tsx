import { useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, Lock, Unlock, ShieldCheck, Eye, EyeOff } from "lucide-react";

const AuthenticationLab = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"login" | "otp" | "success">("login");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");

  const passwordStrength = (() => {
    if (password.length === 0) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthColor = ["bg-destructive", "bg-destructive", "bg-warning", "bg-primary", "bg-accent"][passwordStrength];
  const strengthLabel = ["", "Weak", "Fair", "Strong", "Excellent"][passwordStrength];

  const handleLogin = () => {
    if (username && password) setStep("otp");
  };

  const handleOtp = () => {
    if (otp.length === 6) setStep("success");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Authentication Lab</h1>
        <p className="text-muted-foreground text-sm">Multi-factor authentication and access control simulation</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {["Login", "MFA", "Access"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono ${
              i <= ["login", "otp", "success"].indexOf(step)
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-secondary text-muted-foreground"
            }`}>{i + 1}</div>
            <span className="text-xs text-muted-foreground">{s}</span>
            {i < 2 && <div className="w-12 h-px bg-border" />}
          </div>
        ))}
      </div>

      {step === "login" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-primary" />
            <span className="font-mono text-sm text-muted-foreground">SECURE_LOGIN</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1.5">USERNAME</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background/50 border border-border rounded-lg p-3 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1.5">PASSWORD</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background/50 border border-border rounded-lg p-3 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50 pr-10"
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded ${i < passwordStrength ? strengthColor : "bg-muted"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{strengthLabel}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1.5">ROLE</label>
              <div className="flex gap-2">
                {(["user", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-mono transition-all ${
                      role === r ? "bg-primary/15 text-primary border border-primary/30" : "bg-secondary text-muted-foreground border border-border"
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={!username || !password}
              className="w-full py-3 rounded-lg font-semibold text-sm cyber-gradient-solid text-primary-foreground disabled:opacity-40 transition-all"
            >
              Authenticate →
            </button>
          </div>
        </motion.div>
      )}

      {step === "otp" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 max-w-md mx-auto text-center">
          <KeyRound className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="font-semibold mb-1">Multi-Factor Authentication</h3>
          <p className="text-sm text-muted-foreground mb-6">Enter the 6-digit code sent to your device</p>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="w-full bg-background/50 border border-border rounded-lg p-3 text-center text-2xl font-mono text-foreground tracking-[0.5em] focus:outline-none focus:border-primary/50 mb-4"
          />
          <button
            onClick={handleOtp}
            disabled={otp.length !== 6}
            className="w-full py-3 rounded-lg font-semibold text-sm cyber-gradient-solid text-primary-foreground disabled:opacity-40 transition-all"
          >
            Verify Code
          </button>
        </motion.div>
      )}

      {step === "success" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 max-w-md mx-auto text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
            <Unlock className="w-12 h-12 text-accent mx-auto mb-4" />
          </motion.div>
          <h3 className="font-semibold text-accent mb-1 neon-glow-green">Access Granted</h3>
          <p className="text-sm text-muted-foreground mb-6">Authenticated as {role.toUpperCase()}</p>

          <div className="grid grid-cols-2 gap-3">
            {["Dashboard", "Users", "Settings", "Logs"].map((perm, i) => {
              const allowed = role === "admin" || i < 2;
              return (
                <div key={perm} className={`p-3 rounded-lg border text-sm font-mono flex items-center gap-2 ${
                  allowed ? "bg-accent/10 border-accent/20 text-accent" : "bg-destructive/10 border-destructive/20 text-destructive"
                }`}>
                  {allowed ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  {perm}
                </div>
              );
            })}
          </div>

          <button onClick={() => { setStep("login"); setOtp(""); }} className="mt-6 text-sm text-primary hover:underline">
            Reset Simulation
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default AuthenticationLab;
