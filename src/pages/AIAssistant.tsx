import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, User, Wifi, WifiOff, Trash2, ChevronDown, Brain } from "lucide-react";

const BACKEND_URL = "http://localhost:3001";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  id:      number;
  role:    "user" | "assistant";
  content: string;
  error?:  boolean;
}

const INITIAL_MESSAGE: Message = {
  id:      1,
  role:    "assistant",
  content: "Welcome to CyberShield AI Assistant. I can help you analyze threats, explain security concepts, and guide you through the lab modules. How can I assist you today?",
};

const AVAILABLE_MODELS = ["llama3.2:3b", "deepseek-r1:8b", "llama3"];

// ── Suggested prompts ─────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "What is SQL injection?",
  "How does a firewall work?",
  "Explain the CIA triad",
  "What is a man-in-the-middle attack?",
  "How does HTTPS encryption work?",
  "What is a zero-day exploit?",
];

const AIAssistant = () => {
  const [messages,  setMessages]  = useState<Message[]>([INITIAL_MESSAGE]);
  const [input,     setInput]     = useState("");
  const [typing,    setTyping]    = useState(false);
  const [model,     setModel]     = useState("llama3.2:3b");
  const [showDrop,  setShowDrop]  = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null); // null = unknown
  const scrollRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  // ── Auto-scroll on new messages ────────────────────────────────────────────
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  // ── Check backend connectivity on mount ───────────────────────────────────
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/ai/models`)
      .then((r) => r.json())
      .then((d) => {
        setConnected(true);
        if (d.models?.includes("llama3.2:3b")) setModel("llama3.2:3b");
      })
      .catch(() => setConnected(false));
  }, []);

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || typing) return;

    const userMsg: Message = { id: Date.now(), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Build history to send (exclude initial welcome, exclude error messages)
    const history = [...messages, userMsg]
      .filter((m) => !m.error && m.id !== 1)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res  = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: history, model }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Request failed");

      setConnected(true);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "assistant", content: data.reply },
      ]);

    } catch (err: any) {
      setConnected(false);
      setMessages((prev) => [
        ...prev,
        {
          id:      Date.now(),
          role:    "assistant",
          content: err.message.includes("fetch")
            ? "⚠ Cannot reach backend. Make sure your server is running."
            : `⚠ ${err.message}`,
          error: true,
        },
      ]);
    } finally {
      setTyping(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => setMessages([INITIAL_MESSAGE]);

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">AI Assistant</h1>
          <p className="text-muted-foreground text-sm">Intelligent cyber analyst powered by Ollama</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection status */}
          {connected !== null && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
              connected
                ? "bg-accent/10 text-accent border-accent/30"
                : "bg-destructive/10 text-destructive border-destructive/30"
            }`}>
              {connected
                ? <Wifi    className="w-3 h-3" />
                : <WifiOff className="w-3 h-3" />
              }
              {connected ? "LIVE" : "OFFLINE"}
            </div>
          )}

          {/* Clear chat */}
          <button
            onClick={clearChat}
            className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-destructive transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat window */}
      <div className="glass-card flex-1 flex flex-col overflow-hidden">

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 border border-primary/20">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}

              <div className={`max-w-[75%] p-3.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.error
                  ? "bg-destructive/10 text-destructive border border-destructive/20"
                  : msg.role === "user"
                  ? "bg-primary/15 text-foreground border border-primary/20"
                  : "bg-secondary text-foreground"
              }`}>
                {msg.content}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 border border-primary/20">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-secondary p-3.5 rounded-xl">
                <div className="flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-muted-foreground"
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground font-mono ml-2">{model}</span>
                </div>
              </div>
            </div>
          )}

          {/* Suggested prompts — only show when chat is empty */}
          <AnimatePresence>
            {messages.length === 1 && !typing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pt-2"
              >
                <p className="text-xs font-mono text-muted-foreground mb-3">SUGGESTED_QUERIES://</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="px-3 py-1.5 rounded-full text-xs font-mono bg-primary/5 border border-primary/20 text-primary hover:bg-primary/15 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input bar */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">

            {/* Model selector */}
            <div className="relative">
              <button
                onClick={() => setShowDrop(!showDrop)}
                className="h-full flex items-center gap-1.5 px-3 rounded-lg bg-secondary border border-border text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
              >
                <Brain className="w-3.5 h-3.5 text-primary" />
                <ChevronDown className={`w-3 h-3 transition-transform ${showDrop ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showDrop && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute bottom-full left-0 mb-1 z-20 bg-background border border-border rounded-lg shadow-xl overflow-hidden min-w-[160px]"
                  >
                    {AVAILABLE_MODELS.map((m) => (
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

            {/* Text input */}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask about network security, encryption, threats..."
              disabled={typing}
              className="flex-1 bg-background/50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono disabled:opacity-50 placeholder:text-muted-foreground/50"
            />

            {/* Send button */}
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              className="px-4 py-2.5 rounded-lg cyber-gradient-solid text-primary-foreground disabled:opacity-40 transition-all hover:opacity-90"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground font-mono">
              Model: <span className="text-primary">{model}</span> · localhost:11434
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {messages.length - 1} messages
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;