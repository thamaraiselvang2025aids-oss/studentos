import React, { useState } from "react";
import { 
  Bell, BellOff, Trash2, CheckCheck, Sparkles, Volume2, 
  VolumeX, Clock, Megaphone, ShieldAlert, Check, X, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface NotificationLogItem {
  id: string;
  text: string;
  type: "success" | "info" | "warning";
  timestamp: string;
  read: boolean;
}

interface NotificationCenterProps {
  history: NotificationLogItem[];
  isMuted: boolean;
  duration: number;
  onToggleMute: () => void;
  onChangeDuration: (newMs: number) => void;
  onClearHistory: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onDeleteLog: (id: string) => void;
  onTriggerMockNotif: (text: string, type: "success" | "info" | "warning") => void;
  onClose: () => void;
}

export default function NotificationCenter({
  history,
  isMuted,
  duration,
  onToggleMute,
  onChangeDuration,
  onClearHistory,
  onMarkAllRead,
  onMarkRead,
  onDeleteLog,
  onTriggerMockNotif,
  onClose
}: NotificationCenterProps) {
  // Test generator state
  const [customText, setCustomText] = useState("");
  const [customType, setCustomType] = useState<"success" | "info" | "warning">("success");

  const unreadCount = history.filter(item => !item.read).length;

  const handleCreateMock = (e: React.FormEvent) => {
    e.preventDefault();
    const txt = customText.trim() || `Event simulated at ${new Date().toLocaleTimeString()}`;
    onTriggerMockNotif(txt, customType);
    setCustomText("");
  };

  const getFormatTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return "Just now";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -8 }}
      className="absolute right-0 top-14 w-full sm:w-[420px] bg-[#0a0d17]/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl z-[150] text-gray-200"
    >
      {/* Tab/Center Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Bell className="w-4 h-4 animate-swing" />
          </div>
          <div>
            <span className="text-xs font-black block tracking-wide">SYSTEM ALERT CENTER</span>
            <span className="text-[10px] text-gray-400 font-mono">
              {unreadCount} unread • {history.length} logged
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          {history.length > 0 && (
            <>
              <button
                onClick={onMarkAllRead}
                title="Mark all as read"
                className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClearHistory}
                title="Clear all alerts"
                className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-rose-450 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button 
            onClick={onClose}
            className="p-1.5 bg-black/20 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Configuration Sliders / Mute controllers */}
      <div className="p-3.5 bg-black/40 border-b border-white/5 grid grid-cols-2 gap-3 text-[10px]">
        {/* Toggle Sound Mute Indicator */}
        <button
          type="button"
          onClick={onToggleMute}
          className={`flex items-center justify-between p-2 rounded-xl transition-all border ${
            isMuted 
              ? "bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/10 text-rose-400" 
              : "bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/10 text-emerald-400"
          }`}
        >
          <span className="font-bold flex items-center gap-1">
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            SYSTEM AUDIO
          </span>
          <span className="text-[9px] uppercase font-bold tracking-wider">
            {isMuted ? "MUTED" : "ON CHIME"}
          </span>
        </button>

        {/* Change Toast Timeout Indicator */}
        <div className="bg-[#121624] border border-white/5 p-2 rounded-xl flex flex-col justify-center">
          <div className="flex justify-between text-gray-450 font-bold mb-1">
            <span>TOAST DISMISS</span>
            <span className="text-[9px] text-indigo-400 font-mono">
              {duration === 0 ? "Infinite" : `${duration / 1000}s`}
            </span>
          </div>
          <div className="flex gap-1.5 items-center">
            {[3000, 5000, 8000, 0].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => onChangeDuration(val)}
                className={`flex-1 py-0.5 rounded text-[8px] font-mono transition-colors font-bold ${
                  duration === val 
                    ? "bg-indigo-500 text-white" 
                    : "bg-black/20 text-gray-400 hover:text-white"
                }`}
              >
                {val === 0 ? "INF" : `${val / 1000}s`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Log Feed Container */}
      <div className="max-h-[220px] overflow-y-auto divide-y divide-white/5 bg-[#080b13]">
        {history.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
            <Clock className="w-7 h-7 text-gray-600 animate-pulse" />
            <div>
              <p className="font-bold text-gray-400">Log file is pristine</p>
              <p className="text-[10px] text-gray-500 leading-normal max-w-[240px] mt-0.5">
                No active notifications recorded in this thread yet. System alerts will buffer here.
              </p>
            </div>
          </div>
        ) : (
          history.map(item => (
            <div 
              key={item.id} 
              className={`p-3 text-xs flex items-start gap-2.5 transition-all relative group ${
                item.read ? "opacity-60 bg-transparent" : "bg-indigo-500/[0.02]"
              }`}
            >
              {/* Unread dot indicator */}
              {!item.read && (
                <div className="absolute top-4 left-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}

              <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                item.type === "success" 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : item.type === "warning" 
                  ? "bg-rose-500/10 text-rose-400" 
                  : "bg-indigo-500/10 text-indigo-400"
              }`}>
                {item.type === "success" && <ShieldCheck className="w-3.5 h-3.5" />}
                {item.type === "warning" && <ShieldAlert className="w-3.5 h-3.5" />}
                {item.type === "info" && <Megaphone className="w-3.5 h-3.5" />}
              </div>

              <div className="flex-1 space-y-0.5 pr-4">
                <p className={`text-[11px] leading-relaxed break-words font-medium ${item.read ? "text-gray-400" : "text-white"}`}>
                  {item.text}
                </p>
                <div className="flex items-center gap-2 text-[9px] text-gray-400 font-mono">
                  <span>{getFormatTime(item.timestamp)}</span>
                  <span>•</span>
                  <span className={`uppercase font-bold tracking-wider ${
                    item.type === "success" ? "text-emerald-400" : item.type === "warning" ? "text-rose-400" : "text-indigo-400"
                  }`}>{item.type}</span>
                </div>
              </div>

              <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!item.read && (
                  <button
                    onClick={() => onMarkRead(item.id)}
                    title="Mark as read"
                    className="p-1 hover:bg-white/10 rounded text-emerald-400 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => onDeleteLog(item.id)}
                  title="Remove"
                  className="p-1 hover:bg-white/10 rounded text-rose-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Mock Notification Dispatch Creator */}
      <form onSubmit={handleCreateMock} className="p-4 bg-white/[0.01] border-t border-white/5 space-y-3">
        <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
          <span className="font-bold text-gray-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            ALERT SIMULATION LAB
          </span>
          <span>DISPATCH MOCK</span>
        </div>

        <div className="flex gap-1.5">
          {(["success", "info", "warning"] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setCustomType(type)}
              className={`flex-1 py-1 text-[9px] uppercase font-bold tracking-wider rounded-lg transition-colors border ${
                customType === type 
                  ? type === "success" 
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 font-black"
                    : type === "warning"
                    ? "bg-rose-500/10 border-rose-500/25 text-rose-400 font-black"
                    : "bg-indigo-500/10 border-indigo-500/25 text-indigo-400 font-black"
                  : "bg-black/25 text-gray-400 border-white/5 hover:bg-white/5"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Write custom simulated alert message..." 
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="flex-1 bg-[#090b14] text-xs text-gray-200 border border-white/10 px-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500/50"
          />
          <button 
            type="submit"
            className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-650 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md text-xs cursor-pointer"
          >
            Send
          </button>
        </div>
      </form>
    </motion.div>
  );
}
