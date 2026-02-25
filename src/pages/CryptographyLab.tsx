import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const caesarEncrypt = (text: string, shift: number) => {
  return text
    .toUpperCase()
    .split("")
    .map((ch) => {
      const idx = alphabet.indexOf(ch);
      if (idx === -1) return ch;
      return alphabet[(idx + shift) % 26];
    })
    .join("");
};

const tabs = ["Caesar Cipher", "Rail Fence", "Hash Visualizer"];

const CryptographyLab = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [plaintext, setPlaintext] = useState("HELLO WORLD");
  const [shift, setShift] = useState(3);
  const [hashInput, setHashInput] = useState("cybershield");

  const encrypted = caesarEncrypt(plaintext, shift);

  // Simple hash visualization
  const simpleHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, "0").toUpperCase();
  };

  // Rail fence
  const railFenceEncrypt = (text: string, rails: number) => {
    const fence: string[][] = Array.from({ length: rails }, () => []);
    let rail = 0, dir = 1;
    for (const ch of text.toUpperCase()) {
      fence[rail].push(ch);
      if (rail === 0) dir = 1;
      if (rail === rails - 1) dir = -1;
      rail += dir;
    }
    return fence.map(r => r.join("")).join("");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Cryptography Lab</h1>
        <p className="text-muted-foreground text-sm">Interactive cipher visualizations and encryption tools</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg w-fit">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === i
                ? "bg-primary/15 text-primary neon-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Caesar Cipher */}
      {activeTab === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs text-muted-foreground">CAESAR_CIPHER // SHIFT: {shift}</span>
            </div>
            <input
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              className="w-full bg-background/50 border border-border rounded-lg p-3 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50 mb-4"
              placeholder="Enter plaintext..."
            />
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-muted-foreground">Shift:</span>
              <input
                type="range"
                min={1}
                max={25}
                value={shift}
                onChange={(e) => setShift(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="font-mono text-primary text-sm w-6">{shift}</span>
            </div>

            {/* Letter animation */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1">
                <span className="text-xs font-mono text-muted-foreground block mb-2">PLAINTEXT</span>
                <div className="flex flex-wrap gap-1">
                  {plaintext.toUpperCase().split("").map((ch, i) => (
                    <motion.span
                      key={`${i}-${ch}-${shift}`}
                      className="w-8 h-8 flex items-center justify-center rounded bg-secondary text-foreground font-mono text-sm"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-primary shrink-0 mt-6" />
              <div className="flex-1">
                <span className="text-xs font-mono text-muted-foreground block mb-2">CIPHERTEXT</span>
                <div className="flex flex-wrap gap-1">
                  {encrypted.split("").map((ch, i) => (
                    <motion.span
                      key={`${i}-${ch}-${shift}`}
                      className="w-8 h-8 flex items-center justify-center rounded bg-primary/15 text-primary font-mono text-sm border border-primary/20"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.03 + 0.2 }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Alphabet ring */}
          <div className="glass-card p-6">
            <span className="text-xs font-mono text-muted-foreground block mb-3">SUBSTITUTION_MAP</span>
            <div className="flex flex-wrap gap-1 justify-center">
              {alphabet.split("").map((ch, i) => (
                <div key={ch} className="text-center">
                  <div className="w-7 h-7 flex items-center justify-center text-xs font-mono text-muted-foreground">{ch}</div>
                  <div className="w-px h-3 bg-border mx-auto" />
                  <motion.div
                    className="w-7 h-7 flex items-center justify-center text-xs font-mono text-primary bg-primary/10 rounded"
                    key={`${ch}-${shift}`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                  >
                    {alphabet[(i + shift) % 26]}
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Rail Fence */}
      {activeTab === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
          <span className="font-mono text-xs text-muted-foreground block mb-4">RAIL_FENCE_CIPHER // RAILS: 3</span>
          <input
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            className="w-full bg-background/50 border border-border rounded-lg p-3 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50 mb-6"
          />
          <div className="space-y-2 mb-6">
            {[0, 1, 2].map((rail) => {
              let r = 0, dir = 1;
              return (
                <div key={rail} className="flex gap-1">
                  <span className="w-12 text-xs font-mono text-muted-foreground flex items-center">R{rail}</span>
                  {plaintext.toUpperCase().split("").map((ch, i) => {
                    const isOnRail = (() => {
                      let cr = 0, cd = 1;
                      for (let j = 0; j < i; j++) {
                        if (cr === 0) cd = 1;
                        if (cr === 2) cd = -1;
                        cr += cd;
                      }
                      return cr === rail;
                    })();
                    return (
                      <motion.span
                        key={i}
                        className={`w-7 h-7 flex items-center justify-center rounded text-xs font-mono ${
                          isOnRail ? "bg-primary/15 text-primary border border-primary/20" : "text-transparent"
                        }`}
                        initial={isOnRail ? { scale: 0 } : {}}
                        animate={isOnRail ? { scale: 1 } : {}}
                        transition={{ delay: i * 0.05 }}
                      >
                        {isOnRail ? ch : "·"}
                      </motion.span>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div>
            <span className="text-xs font-mono text-muted-foreground block mb-2">OUTPUT</span>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 font-mono text-primary text-sm">
              {railFenceEncrypt(plaintext, 3)}
            </div>
          </div>
        </motion.div>
      )}

      {/* Hash Visualizer */}
      {activeTab === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="glass-card p-6">
            <span className="font-mono text-xs text-muted-foreground block mb-4">HASH_VISUALIZER // SHA-256 SIMULATION</span>
            <input
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              className="w-full bg-background/50 border border-border rounded-lg p-3 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50 mb-4"
              placeholder="Enter text to hash..."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground font-mono block mb-2">INPUT_BYTES</span>
                <div className="flex flex-wrap gap-1">
                  {hashInput.split("").map((ch, i) => (
                    <motion.span
                      key={`${i}-${ch}`}
                      className="w-8 h-8 flex items-center justify-center rounded bg-secondary text-foreground font-mono text-xs"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      {ch.charCodeAt(0).toString(16)}
                    </motion.span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-mono block mb-2">HASH_OUTPUT</span>
                <div className="flex flex-wrap gap-1">
                  {simpleHash(hashInput).split("").map((ch, i) => (
                    <motion.span
                      key={`${i}-${ch}-${hashInput}`}
                      className="w-8 h-8 flex items-center justify-center rounded bg-accent/15 text-accent font-mono text-xs border border-accent/20"
                      initial={{ rotateY: 90 }}
                      animate={{ rotateY: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <span className="text-xs font-mono text-muted-foreground">AVALANCHE_EFFECT: </span>
            <span className="text-xs font-mono text-accent">Even a 1-bit input change produces a completely different hash output</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CryptographyLab;
