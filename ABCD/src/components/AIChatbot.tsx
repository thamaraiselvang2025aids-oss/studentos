import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Send, User, Bot, HelpCircle, ArrowRight,
  ClipboardList, Cpu, AlertCircle, RefreshCw 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      sender: "ai",
      text: "Hello! I am your StudentOS Personal AI & Coding Co-Pilot. I am a fine-tuned software engineer ready to assist you with coding assignments, debugging, and CS diagnostics.\n\nAsk me code queries directly or try:\n- **'Show me Python code to implement a robust Depth First Search recursion'**\n- **'How do I implement binary search on sorted vector slots?'**\n- **'Explain JavaScript Promises with a clean, editable example'**",
      timestamp: "17:10"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    setInputText("");

    const uMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, uMsg]);
    setSending(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-8) // Send recent context history
        })
      });
      const data = await res.json();
      
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: "ai",
        text: "Offline notice: Check connection or verify parameters. If your API key is currently loading, try sending offline commands.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const hotQueries = [
    "⌨️ Python Code for Binary Search",
    "☕ Explain Java Multithreading Locks",
    "📡 Express API Routing Scaffold",
    "🔍 Draft a DFS tree recursion"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md overflow-hidden">
      
      {/* CHAT CHASSIS TOP */}
      <div className="p-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-tight">StudentOS AI Co-Pilot Console</h2>
            <p className="text-[10px] text-emerald-400 font-mono tracking-wide flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              SYSTEM ACTIVE: GROUNDED SEARCH CONTEXT enabled
            </p>
          </div>
        </div>
      </div>

      {/* MESSAGES WATERFALL */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 select-none">
        {messages.map(m => {
          const isUser = m.sender === "user";
          return (
            <div key={m.id} className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
              <div className={`p-2.5 rounded-xl text-xs h-fit ${isUser ? "bg-indigo-500 text-white" : "bg-white/[0.05] border border-white/5 text-indigo-400"}`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-indigo-400" />}
              </div>
              <div className={`p-4 rounded-3xl text-xs leading-relaxed space-y-1.5 ${isUser ? "bg-[#4f46e5] text-white" : "bg-white/[0.02] border border-white/5 text-gray-200"}`}>
                <p className="whitespace-pre-wrap select-text">{m.text}</p>
                <span className="block text-[8px] font-mono text-gray-500 text-right">{m.timestamp}</span>
              </div>
            </div>
          );
        })}
        {sending && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center text-xs font-mono text-indigo-400">
            <div className="p-2.5 rounded-xl bg-white/[0.05] border border-indigo-500/10">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            </div>
            <span>Grounding documents and querying Gemini co-pilot...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* FOOTER WIDGET INPUT */}
      <div className="p-4 bg-white/[0.03] border-t border-white/5 space-y-3">
        {/* Hot Query Suggestions pills */}
        <div className="flex flex-wrap gap-1.5">
          {hotQueries.map(q => (
            <button 
              key={q}
              onClick={() => setInputText(q)}
              className="text-[10px] font-mono text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white px-2.5 py-1.5 border border-white/5 rounded-xl cursor-pointer select-none transition-all truncate max-w-xs"
            >
              {q}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Key in questions concerning graduation roadmaps, skill matching, or homework scheduling..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-black/25 text-white border border-white/10 px-4 py-3 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 transition-all font-mono"
          />
          <button 
            type="submit"
            disabled={sending || !inputText.trim()}
            className="py-3 px-6 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow shadow-indigo-500/10 cursor-pointer"
          >
            <span>Send co-pilot</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
}
