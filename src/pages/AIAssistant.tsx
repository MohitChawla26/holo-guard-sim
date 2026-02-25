import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Send, User } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content: "Welcome to CyberShield AI Assistant. I can help you analyze threats, explain security concepts, and guide you through the lab modules. How can I assist you today?",
  },
];

const sampleResponses = [
  "SQL Injection is a code injection technique that exploits vulnerabilities in an application's database layer. Attackers insert malicious SQL statements into input fields to manipulate the database. Prevention includes parameterized queries, input validation, and WAF deployment.",
  "A firewall operates at different OSI layers depending on its type. Packet-filtering firewalls work at Layer 3-4, while application-layer firewalls (WAF) operate at Layer 7. Modern next-gen firewalls combine both approaches with deep packet inspection.",
  "The CIA triad — Confidentiality, Integrity, and Availability — forms the foundation of information security. Each principle addresses a different aspect: protecting data from unauthorized access, ensuring data accuracy, and maintaining system uptime.",
  "Diffie-Hellman key exchange allows two parties to establish a shared secret over an insecure channel. It relies on the discrete logarithm problem for security. While it doesn't authenticate parties, it's fundamental to protocols like TLS.",
];

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const response = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
      setMessages((prev) => [...prev, { id: Date.now(), role: "assistant", content: response }]);
      setTyping(false);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">AI Assistant</h1>
        <p className="text-muted-foreground text-sm">Intelligent cyber analyst powered by AI</p>
      </div>

      {/* Chat */}
      <div className="glass-card flex-1 flex flex-col overflow-hidden">
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
              <div className={`max-w-[75%] p-3.5 rounded-xl text-sm leading-relaxed ${
                msg.role === "user"
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
          {typing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 border border-primary/20">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-secondary p-3.5 rounded-xl">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-muted-foreground"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about network security, encryption, threats..."
              className="flex-1 bg-background/50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="px-4 py-2.5 rounded-lg cyber-gradient-solid text-primary-foreground disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            Endpoint: localhost:11434 — Connect Ollama for live AI responses
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
