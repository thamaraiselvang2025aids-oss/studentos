import React, { useState } from "react";
import { 
  BookOpen, Brain, Send, HelpCircle, Sparkles, Smile, 
  Calendar, RefreshCw, Bookmark, Plus 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DiaryEntry } from "../types";

interface AIDiaryMemoryProps {
  diary: DiaryEntry[];
  onAddDiaryEntry: (entry: Omit<DiaryEntry, "id" | "date">) => void;
}

export default function AIDiaryMemory({ diary, onAddDiaryEntry }: AIDiaryMemoryProps) {
  const [activeTab, setActiveTab] = useState<"diary" | "memory">("diary");

  // Diary Input fields
  const [diaryMood, setDiaryMood] = useState("Excited");
  const [diaryText, setDiaryText] = useState("");
  const [analyzingDiary, setAnalyzingDiary] = useState(false);
  const [diaryAnalysis, setDiaryAnalysis] = useState<any>(null);

  // Memory Input query
  const [memoryQuery, setMemoryQuery] = useState("");
  const [memoryAnswer, setMemoryAnswer] = useState("");
  const [searchingMemory, setSearchingMemory] = useState(false);

  const handleJournalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryText.trim()) return;

    setAnalyzingDiary(true);
    try {
      const res = await fetch("/api/ai/diary/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: diaryText, mood: diaryMood })
      });
      const parsedAnalysis = await res.json();
      setDiaryAnalysis(parsedAnalysis);
      
      onAddDiaryEntry({
        mood: diaryMood,
        content: diaryText,
        reflection: parsedAnalysis.reflection
      });

      setDiaryText("");
    } catch (e) {
      onAddDiaryEntry({
        mood: diaryMood,
        content: diaryText,
        reflection: "Take a deep breath and outline the next high priority item."
      });
      setDiaryText("");
    } finally {
      setAnalyzingDiary(false);
    }
  };

  const handleMemorySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryQuery.trim()) return;

    setSearchingMemory(true);
    try {
      const res = await fetch("/api/ai/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: memoryQuery })
      });
      const data = await res.json();
      setMemoryAnswer(data.text);
    } catch (err) {
      setMemoryAnswer("Offline mock check: Verify database indices are aligned or check secure API keys.");
    } finally {
      setSearchingMemory(false);
    }
  };

  const moods = ["Excited", "Productive", "Stressed", "Tired", "Reflective"];

  return (
    <div className="space-y-6">
      
      {/* SECTION TABS */}
      <div className="flex gap-1.5 p-1 bg-black/20 border border-white/5 w-fit rounded-2xl">
        <button 
          onClick={() => setActiveTab("diary")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all select-none ${activeTab === "diary" ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 shadow-md" : "text-gray-400 hover:text-white"}`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Interactive AI Diary</span>
        </button>
        <button 
          onClick={() => setActiveTab("memory")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all select-none ${activeTab === "memory" ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 shadow-md" : "text-gray-400 hover:text-white"}`}
        >
          <Brain className="w-4 h-4" />
          <span>Semantic Memory Engine</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "diary" ? (
          <motion.div 
            key="diary-tab"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left form logging journal */}
            <div className="col-span-1 p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Log Today's Reflex</h3>
              </div>

              <form onSubmit={handleJournalSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-mono block mb-1">SELECT MOOD</label>
                  <div className="flex flex-wrap gap-1.5">
                    {moods.map(moo => (
                      <button 
                        key={moo}
                        type="button"
                        onClick={() => setDiaryMood(moo)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-medium font-mono select-none transition-all ${diaryMood === moo ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-black/15 text-gray-400 hover:text-white"}`}
                      >
                        {moo}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 font-mono block mb-1">REFLECTIVE ENTRY (VOICE/TEXT)</label>
                  <textarea 
                    rows={4}
                    placeholder="Describe today's breakthroughs, hurdles, or group meeting notes..."
                    value={diaryText}
                    onChange={(e) => setDiaryText(e.target.value)}
                    className="w-full bg-black/20 text-white border border-white/10 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all font-sans leading-relaxed"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={analyzingDiary || !diaryText.trim()}
                  className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  {analyzingDiary ? (
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-4.5 h-4.5" />
                  )}
                  <span>Evaluate with AI reflection</span>
                </button>
              </form>

              {/* Real time feedback panel */}
              {diaryAnalysis && (
                <div className="p-4 bg-teal-500/5 border border-teal-500/10 rounded-2xl space-y-2 font-mono text-[11px] leading-relaxed text-teal-300">
                  <span className="font-bold block uppercase tracking-wider text-xs">AI Insight themes:</span>
                  <p><strong>Core Theme:</strong> {diaryAnalysis.theme}</p>
                  <p><strong>Suggestion Advice:</strong> {diaryAnalysis.advice}</p>
                </div>
              )}
            </div>

            {/* Right log viewer list */}
            <div className="col-span-1 lg:col-span-2 space-y-3.5">
              <h3 className="text-sm font-mono text-gray-500 block uppercase tracking-widest pl-2">Historic Reflection Logs</h3>
              <div className="space-y-3">
                {diary.map(entry => (
                  <div key={entry.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-[10px] text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>{entry.date}</span>
                      </div>
                      <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 font-mono py-0.5 px-2.5 border border-indigo-500/20 rounded-full">
                        {entry.mood}
                      </span>
                    </div>

                    <p className="text-gray-300 text-xs font-sans leading-relaxed">
                      {entry.content}
                    </p>

                    {entry.reflection && (
                      <div className="p-3 bg-black/20 rounded-xl border border-white/5 font-mono text-[10px] text-gray-400 italic">
                        <span className="text-indigo-400 font-bold uppercase tracking-wider block text-[9px] not-italic mb-1">AI Suggestion Reflect:</span>
                        "{entry.reflection}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="memory-tab"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-6"
          >
            {/* Brain recall query center */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md max-w-4xl mx-auto space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl">
                  <Brain className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">AI Semantic Memory recall</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Vector based lookups from your projects, tasks & certificates.</p>
                </div>
              </div>

              <form onSubmit={handleMemorySearch} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. show my pending tasks or show my healthcare project..."
                  value={memoryQuery}
                  onChange={(e) => setMemoryQuery(e.target.value)}
                  className="flex-1 bg-black/20 text-white border border-white/10 px-4 py-3 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 transition-all font-mono font-medium"
                />
                <button 
                  type="submit"
                  disabled={searchingMemory || !memoryQuery.trim()}
                  className="py-3 px-6 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-semibold rounded-2xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
                >
                  {searchingMemory ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Ask Brain</span>
                </button>
              </form>

              {/* Sample prompts */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-gray-500 pt-1">
                <span>Try prompt:</span>
                <button 
                  onClick={() => setMemoryQuery("show all healthcare projects")}
                  className="bg-white/5 border border-white/5 px-2 py-1 rounded hover:text-white transition-colors cursor-pointer select-none"
                >
                  "healthcare projects"
                </button>
                <button 
                  onClick={() => setMemoryQuery("what did I do last week")}
                  className="bg-white/5 border border-white/5 px-2 py-1 rounded hover:text-white transition-colors cursor-pointer select-none"
                >
                  "what did I do last week"
                </button>
                <button 
                  onClick={() => setMemoryQuery("show my pending tasks")}
                  className="bg-white/5 border border-white/5 px-2 py-1 rounded hover:text-white transition-colors cursor-pointer select-none"
                >
                  "pending tasks"
                </button>
              </div>

              {/* Display response */}
              <AnimatePresence>
                {memoryAnswer && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-5 bg-black/25 border border-white/10 rounded-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl -z-10" />
                    <span className="text-[10px] uppercase text-indigo-400 font-mono font-bold tracking-widest block mb-2 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> FACTUAL MEMORY RETRIEVED:
                    </span>
                    <p className="text-gray-200 text-sm leading-relaxed font-mono whitespace-pre-wrap select-none leading-relaxed">
                      {memoryAnswer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
