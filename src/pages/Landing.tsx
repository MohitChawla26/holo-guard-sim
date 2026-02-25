import { motion } from "framer-motion";
import { Shield, Zap, Lock, Eye, Server, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: Zap, title: "Attack Analysis", desc: "AI-powered threat classification and risk assessment" },
  { icon: Lock, title: "Cryptography Lab", desc: "Interactive cipher visualizations and encryption tools" },
  { icon: Shield, title: "Firewall Simulator", desc: "Real-time packet flow and rule configuration" },
  { icon: Eye, title: "IDS Monitor", desc: "Live intrusion detection and traffic analysis" },
  { icon: Server, title: "SQL Injection Lab", desc: "Hands-on database security testing" },
  { icon: Brain, title: "AI Assistant", desc: "Intelligent cyber analyst at your command" },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(186 100% 50% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(186 100% 50% / 0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, hsl(186 100% 50% / 0.15), transparent 70%)" }}
      />

      {/* Hero */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-primary">v2.0 — AI-Powered Security Lab</span>
          </div>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <span className="cyber-text-gradient">CyberShield</span>
          <span className="text-foreground"> AI</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Intelligent Network Security Simulation Lab. Master cybersecurity through 
          interactive AI-driven simulations, real-time threat analysis, and hands-on labs.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-3.5 rounded-lg font-semibold text-primary-foreground cyber-gradient-solid hover:opacity-90 transition-all duration-300 shadow-[0_0_30px_hsl(186_100%_50%/0.3)]"
          >
            Enter Lab →
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-3.5 rounded-lg font-semibold border border-primary/30 text-primary hover:bg-primary/10 transition-all duration-300"
          >
            View Demo
          </button>
        </motion.div>
      </div>

      {/* Feature cards */}
      <div className="relative z-10 w-full max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="glass-card-hover p-6 cursor-pointer group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.08 }}
            >
              <f.icon className="w-8 h-8 text-primary mb-3 group-hover:drop-shadow-[0_0_8px_hsl(186_100%_50%/0.5)] transition-all" />
              <h3 className="text-foreground font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;
