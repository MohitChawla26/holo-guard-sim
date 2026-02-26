import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, Key } from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const tabs = [
  "Caesar",
  "Rail Fence",
  "Hash",
  "Playfair",
  "Vernam",
  "Vigenère",
  "Columnar",
];

// ─────────────────────────────────────────────────────────────────────────────
// CIPHER LOGIC
// ─────────────────────────────────────────────────────────────────────────────

const caesarEncrypt = (text: string, shift: number) =>
  text.toUpperCase().split("").map((ch) => {
    const idx = alphabet.indexOf(ch);
    return idx === -1 ? ch : alphabet[(idx + shift) % 26];
  }).join("");

const railFenceEncrypt = (text: string, rails: number) => {
  const fence: string[][] = Array.from({ length: rails }, () => []);
  let rail = 0, dir = 1;
  for (const ch of text.toUpperCase()) {
    fence[rail].push(ch);
    if (rail === 0) dir = 1;
    if (rail === rails - 1) dir = -1;
    rail += dir;
  }
  return fence.map((r) => r.join("")).join("");
};

const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0").toUpperCase();
};

// ── Playfair ──────────────────────────────────────────────────────────────────
const buildPlayfairMatrix = (key: string): string[] => {
  const cleaned = (key.toUpperCase() + alphabet).replace(/J/g, "I").replace(/[^A-Z]/g, "");
  const seen = new Set<string>();
  const matrix: string[] = [];
  for (const ch of cleaned) {
    if (!seen.has(ch)) { seen.add(ch); matrix.push(ch); }
  }
  return matrix;
};

const playfairEncrypt = (text: string, key: string): string => {
  const matrix = buildPlayfairMatrix(key);
  const find = (ch: string) => {
    const i = matrix.indexOf(ch);
    return { row: Math.floor(i / 5), col: i % 5 };
  };

  // Prepare digraphs
  const cleaned = text.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
  const digraphs: [string, string][] = [];
  let i = 0;
  while (i < cleaned.length) {
    const a = cleaned[i];
    const b = cleaned[i + 1] ?? "X";
    if (a === b) { digraphs.push([a, "X"]); i++; }
    else         { digraphs.push([a, b]);   i += 2; }
  }

  return digraphs.map(([a, b]) => {
    const pa = find(a), pb = find(b);
    if (pa.row === pb.row) {
      return matrix[pa.row * 5 + (pa.col + 1) % 5] +
             matrix[pb.row * 5 + (pb.col + 1) % 5];
    } else if (pa.col === pb.col) {
      return matrix[((pa.row + 1) % 5) * 5 + pa.col] +
             matrix[((pb.row + 1) % 5) * 5 + pb.col];
    } else {
      return matrix[pa.row * 5 + pb.col] +
             matrix[pb.row * 5 + pa.col];
    }
  }).join("");
};

// ── Vernam ────────────────────────────────────────────────────────────────────
const vernamEncrypt = (text: string, key: string): { cipher: string; bits: string[] } => {
  const t = text.toUpperCase().replace(/[^A-Z]/g, "");
  const k = key.toUpperCase().replace(/[^A-Z]/g, "");
  if (!k.length) return { cipher: t, bits: [] };

  const cipher = t.split("").map((ch, i) => {
    const ti = alphabet.indexOf(ch);
    const ki = alphabet.indexOf(k[i % k.length]);
    return alphabet[(ti ^ ki + 26) % 26];
  }).join("");

  // Show XOR bit operations for first 4 chars
  const bits = t.slice(0, 4).split("").map((ch, i) => {
    const ti = alphabet.indexOf(ch);
    const ki = alphabet.indexOf(k[i % k.length]);
    return `${ch}(${ti.toString(2).padStart(5,"0")}) XOR ${k[i % k.length]}(${ki.toString(2).padStart(5,"0")}) = ${alphabet[(ti^ki+26)%26]}(${((ti^ki+26)%26).toString(2).padStart(5,"0")})`;
  });

  return { cipher, bits };
};

// ── Vigenère ──────────────────────────────────────────────────────────────────
const vigenereEncrypt = (text: string, key: string): string => {
  const t = text.toUpperCase().replace(/[^A-Z]/g, "");
  const k = key.toUpperCase().replace(/[^A-Z]/g, "") || "A";
  return t.split("").map((ch, i) => {
    const shift = alphabet.indexOf(k[i % k.length]);
    return alphabet[(alphabet.indexOf(ch) + shift) % 26];
  }).join("");
};

// ── Columnar Transposition ────────────────────────────────────────────────────
const columnarEncrypt = (text: string, key: string): { cipher: string; grid: string[][]; order: number[] } => {
  const t = text.toUpperCase().replace(/[^A-Z]/g, "");
  const k = key.toUpperCase().replace(/[^A-Z]/g, "") || "KEY";
  const cols = k.length;
  const padded = t.padEnd(Math.ceil(t.length / cols) * cols, "X");
  const rows = padded.length / cols;

  // Build grid
  const grid: string[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => padded[r * cols + c])
  );

  // Column order based on alphabetical order of key chars
  const order = k.split("").map((ch, i) => ({ ch, i }))
    .sort((a, b) => a.ch.localeCompare(b.ch))
    .map((x) => x.i);

  const cipher = order.map((col) => grid.map((row) => row[col]).join("")).join("");
  return { cipher, grid, order };
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const CryptographyLab = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Shared inputs
  const [plaintext,  setPlaintext]  = useState("HELLO WORLD");
  const [shift,      setShift]      = useState(3);
  const [hashInput,  setHashInput]  = useState("cybershield");

  // Per-cipher keys
  const [playfairKey,  setPlayfairKey]  = useState("MONARCHY");
  const [vernamKey,    setVernamKey]    = useState("CIPHER");
  const [vigenereKey,  setVigenereKey]  = useState("KEY");
  const [columnarKey,  setColumnarKey]  = useState("ZEBRA");

  // Derived
  const caesarOut   = caesarEncrypt(plaintext, shift);
  const playfairOut = playfairEncrypt(plaintext, playfairKey);
  const vernamOut   = vernamEncrypt(plaintext, vernamKey);
  const vigenereOut = vigenereEncrypt(plaintext, vigenereKey);
  const columnarOut = columnarEncrypt(plaintext, columnarKey);

  // ── Shared sub-components ─────────────────────────────────────────────────
  const PlaintextInput = ({ label = "PLAINTEXT_INPUT" }: { label?: string }) => (
    <div>
      <label className="text-xs font-mono text-muted-foreground block mb-1.5">{label}</label>
      <input
        value={plaintext}
        onChange={(e) => setPlaintext(e.target.value)}
        className="w-full bg-background/50 border border-border rounded-lg p-3 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50"
        placeholder="Enter plaintext..."
      />
    </div>
  );

  const KeyInput = ({
    label, value, onChange, placeholder,
  }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) => (
    <div>
      <label className="text-xs font-mono text-muted-foreground block mb-1.5">{label}</label>
      <div className="relative">
        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^a-zA-Z]/g, ""))}
          placeholder={placeholder}
          className="w-full bg-background/50 border border-border rounded-lg p-3 pl-8 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50 uppercase"
        />
      </div>
    </div>
  );

  const CipherOutput = ({ label, value }: { label: string; value: string }) => (
    <div>
      <span className="text-xs font-mono text-muted-foreground block mb-2">{label}</span>
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 font-mono text-primary text-sm break-all">
        {value || "—"}
      </div>
    </div>
  );

  const LetterRow = ({ text, color = "primary" }: { text: string; color?: string }) => (
    <div className="flex flex-wrap gap-1">
      {text.split("").map((ch, i) => (
        <motion.span
          key={`${i}-${ch}`}
          className={`w-8 h-8 flex items-center justify-center rounded font-mono text-sm ${
            color === "primary"
              ? "bg-primary/15 text-primary border border-primary/20"
              : "bg-secondary text-foreground"
          }`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.02 }}
        >
          {ch}
        </motion.span>
      ))}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Cryptography Lab</h1>
        <p className="text-muted-foreground text-sm">Interactive cipher visualizations and encryption tools</p>
      </div>

      {/* Tab bar — scrollable on small screens */}
      <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg overflow-x-auto w-full">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === i
                ? "bg-primary/15 text-primary neon-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── 0: Caesar ──────────────────────────────────────────────────────── */}
        {activeTab === 0 && (
          <motion.div key="caesar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs text-muted-foreground">CAESAR_CIPHER // SHIFT: {shift}</span>
              </div>

              <div className="space-y-4">
                <PlaintextInput />
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono">Shift:</span>
                  <input type="range" min={1} max={25} value={shift}
                    onChange={(e) => setShift(Number(e.target.value))}
                    className="flex-1 accent-primary" />
                  <span className="font-mono text-primary text-sm w-6">{shift}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap mt-6">
                <div className="flex-1">
                  <span className="text-xs font-mono text-muted-foreground block mb-2">PLAINTEXT</span>
                  <LetterRow text={plaintext.toUpperCase()} color="secondary" />
                </div>
                <ArrowRight className="w-5 h-5 text-primary shrink-0 mt-6" />
                <div className="flex-1">
                  <span className="text-xs font-mono text-muted-foreground block mb-2">CIPHERTEXT</span>
                  <LetterRow text={caesarOut} color="primary" />
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <span className="text-xs font-mono text-muted-foreground block mb-3">SUBSTITUTION_MAP</span>
              <div className="flex flex-wrap gap-1 justify-center">
                {alphabet.split("").map((ch, i) => (
                  <div key={ch} className="text-center">
                    <div className="w-7 h-7 flex items-center justify-center text-xs font-mono text-muted-foreground">{ch}</div>
                    <div className="w-px h-3 bg-border mx-auto" />
                    <motion.div
                      key={`${ch}-${shift}`}
                      className="w-7 h-7 flex items-center justify-center text-xs font-mono text-primary bg-primary/10 rounded"
                      initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                    >
                      {alphabet[(i + shift) % 26]}
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── 1: Rail Fence ─────────────────────────────────────────────────── */}
        {activeTab === 1 && (
          <motion.div key="rail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-6 space-y-4">
            <span className="font-mono text-xs text-muted-foreground block">RAIL_FENCE_CIPHER // RAILS: 3</span>
            <PlaintextInput />
            <div className="space-y-2">
              {[0, 1, 2].map((rail) => (
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
                        transition={{ delay: i * 0.04 }}
                      >
                        {isOnRail ? ch : "·"}
                      </motion.span>
                    );
                  })}
                </div>
              ))}
            </div>
            <CipherOutput label="OUTPUT" value={railFenceEncrypt(plaintext, 3)} />
          </motion.div>
        )}

        {/* ── 2: Hash ───────────────────────────────────────────────────────── */}
        {activeTab === 2 && (
          <motion.div key="hash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="glass-card p-6 space-y-4">
              <span className="font-mono text-xs text-muted-foreground block">HASH_VISUALIZER // SHA-256 SIMULATION</span>
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">INPUT</label>
                <input
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  className="w-full bg-background/50 border border-border rounded-lg p-3 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50"
                  placeholder="Enter text to hash..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground font-mono block mb-2">INPUT_BYTES (hex)</span>
                  <div className="flex flex-wrap gap-1">
                    {hashInput.split("").map((ch, i) => (
                      <motion.span key={`${i}-${ch}`}
                        className="w-8 h-8 flex items-center justify-center rounded bg-secondary text-foreground font-mono text-xs"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                        {ch.charCodeAt(0).toString(16)}
                      </motion.span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-mono block mb-2">HASH_OUTPUT</span>
                  <div className="flex flex-wrap gap-1">
                    {simpleHash(hashInput).split("").map((ch, i) => (
                      <motion.span key={`${i}-${ch}-${hashInput}`}
                        className="w-8 h-8 flex items-center justify-center rounded bg-accent/15 text-accent font-mono text-xs border border-accent/20"
                        initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} transition={{ delay: i * 0.05 }}>
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

        {/* ── 3: Playfair ───────────────────────────────────────────────────── */}
        {activeTab === 3 && (
          <motion.div key="playfair" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs text-muted-foreground">PLAYFAIR_CIPHER // 5×5 KEY MATRIX</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlaintextInput />
                <KeyInput label="KEY" value={playfairKey} onChange={setPlayfairKey} placeholder="MONARCHY" />
              </div>

              {/* 5×5 matrix */}
              <div>
                <span className="text-xs font-mono text-muted-foreground block mb-3">KEY_MATRIX (J=I)</span>
                <div className="inline-grid grid-cols-5 gap-1">
                  {buildPlayfairMatrix(playfairKey).map((ch, i) => (
                    <motion.div key={i}
                      className="w-9 h-9 flex items-center justify-center rounded bg-primary/10 text-primary font-mono text-sm border border-primary/20"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.02 }}>
                      {ch}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex-1">
                  <span className="text-xs font-mono text-muted-foreground block mb-2">DIGRAPHS</span>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const cleaned = plaintext.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
                      const pairs: string[] = [];
                      let i = 0;
                      while (i < cleaned.length) {
                        const a = cleaned[i], b = cleaned[i + 1] ?? "X";
                        pairs.push(a === b ? `${a}X` : `${a}${b}`);
                        i += a === b ? 1 : 2;
                      }
                      return pairs.map((p, idx) => (
                        <span key={idx} className="px-2 py-1 rounded bg-secondary font-mono text-xs text-foreground">{p}</span>
                      ));
                    })()}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-primary shrink-0 mt-6" />
                <div className="flex-1">
                  <CipherOutput label="CIPHERTEXT" value={playfairOut} />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-accent/5 border border-accent/10 text-xs font-mono text-muted-foreground">
                <span className="text-accent">Rules: </span>
                Same row → shift right · Same column → shift down · Rectangle → swap columns
              </div>
            </div>
          </motion.div>
        )}

        {/* ── 4: Vernam ─────────────────────────────────────────────────────── */}
        {activeTab === 4 && (
          <motion.div key="vernam" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs text-muted-foreground">VERNAM_CIPHER // XOR BIT OPERATION</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlaintextInput />
                <KeyInput label="KEY (repeating)" value={vernamKey} onChange={setVernamKey} placeholder="CIPHER" />
              </div>

              {/* XOR table for first 4 chars */}
              <div>
                <span className="text-xs font-mono text-muted-foreground block mb-3">XOR_OPERATION (first 4 chars)</span>
                <div className="space-y-2">
                  {vernamOut.bits.map((line, i) => (
                    <motion.div key={i}
                      className="p-2.5 rounded-lg bg-background/40 border border-border/30 font-mono text-xs text-foreground"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}>
                      <span className="text-accent">{line.split("=")[0]}</span>
                      <span className="text-primary">= {line.split("=")[1]}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <span className="text-xs font-mono text-muted-foreground block mb-2">PLAINTEXT</span>
                  <LetterRow text={plaintext.toUpperCase().replace(/[^A-Z]/g, "")} color="secondary" />
                </div>
                <ArrowRight className="w-5 h-5 text-primary shrink-0 mt-6" />
                <div className="flex-1">
                  <span className="text-xs font-mono text-muted-foreground block mb-2">KEY (repeating)</span>
                  <LetterRow
                    text={plaintext.toUpperCase().replace(/[^A-Z]/g, "").split("").map((_, i) =>
                      vernamKey.toUpperCase().replace(/[^A-Z]/g, "")[i % (vernamKey.replace(/[^a-zA-Z]/g, "").length || 1)]
                    ).join("")}
                    color="secondary"
                  />
                </div>
              </div>

              <CipherOutput label="CIPHERTEXT" value={vernamOut.cipher} />

              <div className="p-3 rounded-lg bg-accent/5 border border-accent/10 text-xs font-mono text-muted-foreground">
                <span className="text-accent">Note: </span>
                When key = random & same length as message = One-Time Pad (unbreakable)
              </div>
            </div>
          </motion.div>
        )}

        {/* ── 5: Vigenère ───────────────────────────────────────────────────── */}
        {activeTab === 5 && (
          <motion.div key="vigenere" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs text-muted-foreground">VIGENÈRE_CIPHER // POLYALPHABETIC</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlaintextInput />
                <KeyInput label="KEY" value={vigenereKey} onChange={setVigenereKey} placeholder="KEY" />
              </div>

              {/* Per-character shift table */}
              <div>
                <span className="text-xs font-mono text-muted-foreground block mb-3">CHAR_BY_CHAR SHIFT</span>
                <div className="flex flex-wrap gap-2">
                  {plaintext.toUpperCase().replace(/[^A-Z]/g, "").split("").map((ch, i) => {
                    const k = vigenereKey.toUpperCase().replace(/[^A-Z]/g, "") || "A";
                    const keyChar = k[i % k.length];
                    const shift2  = alphabet.indexOf(keyChar);
                    const out     = alphabet[(alphabet.indexOf(ch) + shift2) % 26];
                    return (
                      <motion.div key={i}
                        className="flex flex-col items-center gap-0.5"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}>
                        <span className="w-8 h-8 flex items-center justify-center rounded bg-secondary text-foreground font-mono text-xs">{ch}</span>
                        <span className="text-[10px] font-mono text-primary">+{shift2}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{keyChar}</span>
                        <span className="w-8 h-8 flex items-center justify-center rounded bg-primary/15 text-primary border border-primary/20 font-mono text-xs">{out}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <CipherOutput label="CIPHERTEXT" value={vigenereOut} />

              <div className="p-3 rounded-lg bg-accent/5 border border-accent/10 text-xs font-mono text-muted-foreground">
                <span className="text-accent">Why harder to crack: </span>
                Each letter uses a different shift based on the key — defeats frequency analysis
              </div>
            </div>

            {/* Mini Vigenère table (6×6 preview) */}
            <div className="glass-card p-6">
              <span className="text-xs font-mono text-muted-foreground block mb-3">VIGENÈRE_TABLE (preview A–F)</span>
              <div className="overflow-x-auto">
                <table className="text-xs font-mono">
                  <thead>
                    <tr>
                      <th className="w-7 h-7 text-muted-foreground">K\P</th>
                      {alphabet.slice(0, 6).split("").map((ch) => (
                        <th key={ch} className="w-7 h-7 text-primary">{ch}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alphabet.slice(0, 6).split("").map((kch) => (
                      <tr key={kch}>
                        <td className="w-7 h-7 text-primary font-bold">{kch}</td>
                        {alphabet.slice(0, 6).split("").map((pch) => {
                          const enc = alphabet[(alphabet.indexOf(pch) + alphabet.indexOf(kch)) % 26];
                          return (
                            <td key={pch} className="w-7 h-7 text-center text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded cursor-default transition-colors">
                              {enc}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── 6: Columnar Transposition ─────────────────────────────────────── */}
        {activeTab === 6 && (
          <motion.div key="columnar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs text-muted-foreground">COLUMNAR_TRANSPOSITION // KEY-ORDERED COLUMNS</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlaintextInput />
                <KeyInput label="KEY" value={columnarKey} onChange={setColumnarKey} placeholder="ZEBRA" />
              </div>

              {/* Grid visualization */}
              <div>
                <span className="text-xs font-mono text-muted-foreground block mb-3">
                  GRID (read columns in alphabetical key order)
                </span>

                {/* Key header with order numbers */}
                <div className="flex gap-1 mb-1">
                  {columnarKey.toUpperCase().replace(/[^A-Z]/g, "").split("").map((ch, i) => {
                    const sortedOrder = columnarKey.toUpperCase().replace(/[^A-Z]/g, "")
                      .split("").map((c, idx) => ({ c, idx }))
                      .sort((a, b) => a.c.localeCompare(b.c))
                      .map((x) => x.idx);
                    const colNum = sortedOrder.indexOf(i) + 1;
                    return (
                      <div key={i} className="flex flex-col items-center gap-0.5">
                        <span className="w-9 h-5 flex items-center justify-center text-[10px] font-mono text-accent">{colNum}</span>
                        <span className="w-9 h-9 flex items-center justify-center rounded bg-primary/20 text-primary font-mono text-sm border border-primary/30">{ch}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Grid rows */}
                {columnarOut.grid.map((row, ri) => (
                  <div key={ri} className="flex gap-1 mb-1">
                    {row.map((ch, ci) => (
                      <motion.span
                        key={ci}
                        className="w-9 h-9 flex items-center justify-center rounded bg-secondary text-foreground font-mono text-sm border border-border/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: (ri * row.length + ci) * 0.03 }}>
                        {ch}
                      </motion.span>
                    ))}
                  </div>
                ))}
              </div>

              {/* Reading order */}
              <div>
                <span className="text-xs font-mono text-muted-foreground block mb-2">COLUMN READ ORDER</span>
                <div className="flex gap-2 flex-wrap">
                  {columnarOut.order.map((colIdx, i) => (
                    <motion.div key={i}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08 }}>
                      <span className="text-xs font-mono text-accent">{i + 1}</span>
                      <span className="text-xs font-mono text-primary">Col {colIdx + 1} ({columnarKey.toUpperCase().replace(/[^A-Z]/g, "")[colIdx]})</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <CipherOutput label="CIPHERTEXT" value={columnarOut.cipher} />

              <div className="p-3 rounded-lg bg-accent/5 border border-accent/10 text-xs font-mono text-muted-foreground">
                <span className="text-accent">How it works: </span>
                Fill plaintext row by row → read columns in alphabetical order of key letters
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default CryptographyLab;