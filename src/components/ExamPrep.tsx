import React, { useState, useEffect, useRef } from "react";
import { 
  BookOpen, Trophy, Sparkles, Plus, AlertCircle, 
  CheckCircle2, FileText, Search, Star, ExternalLink, HelpCircle,
  Timer, Play, Pause, RotateCcw, Volume2, Bell, Coffee
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Subject, DocumentFile } from "../types";

interface ExamPrepProps {
  subjects: Subject[];
  onUpdateSubject: (updatedSub: Subject) => void;
  onAddSubject: (newSub: Omit<Subject, "id">) => void;
  documents: DocumentFile[];
  throwNotification?: (text: string, type?: "success" | "info" | "warning") => void;
}

interface RevNote {
  id: string;
  title: string;
  subjectCode: string;
  summary: string;
  difficulty: "Easy" | "Medium" | "Hard";
  reviewedCount: number;
}

export default function ExamPrep({ subjects, onUpdateSubject, onAddSubject, documents, throwNotification }: ExamPrepProps) {
  const [activeTab, setActiveTab] = useState<"grades" | "notes" | "recall" | "pomodoro">("grades");
  const [searchQuery, setSearchQuery] = useState("");

  // Pomodoro-style Timer States
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [pomoSeconds, setPomoSeconds] = useState(0);
  const [pomoIsActive, setPomoIsActive] = useState(false);
  const [pomoMode, setPomoMode] = useState<"work" | "short" | "long" | "fast">("work");
  const [pomoSelectedSubjectId, setPomoSelectedSubjectId] = useState("");
  const [pomoCompletedSessions, setPomoCompletedSessions] = useState(0);
  const [pomoNotification, setPomoNotification] = useState<string | null>(null);

  // Auto dismiss pomo status toast
  useEffect(() => {
    if (pomoNotification) {
      const t = setTimeout(() => {
        setPomoNotification(null);
      }, 7000);
      return () => clearTimeout(t);
    }
  }, [pomoNotification]);

  // Main timer ticks effect
  useEffect(() => {
    let intervalId: any = null;
    if (pomoIsActive) {
      intervalId = setInterval(() => {
        if (pomoSeconds > 0) {
          setPomoSeconds(pomoSeconds - 1);
        } else if (pomoSeconds === 0) {
          if (pomoMinutes > 0) {
            setPomoMinutes(pomoMinutes - 1);
            setPomoSeconds(59);
          } else {
            // Focus Block Complete!
            setPomoIsActive(false);
            const nextCount = pomoCompletedSessions + 1;
            setPomoCompletedSessions(nextCount);
            
            // Increment hours on selected database syllabus
            if (pomoSelectedSubjectId) {
              const activeSub = subjects.find(s => s.id === pomoSelectedSubjectId);
              if (activeSub) {
                const updatedHours = (activeSub.studyHours || 0) + 1;
                onUpdateSubject({
                  ...activeSub,
                  studyHours: updatedHours
                });
                setPomoNotification(`🎉 Focus session complete! Successfully logged 1 hour of deep study toward ${activeSub.name} (${activeSub.code}).`);
              } else {
                setPomoNotification(`🎉 Focus session complete! Great work keeping your attention active.`);
              }
            } else {
              setPomoNotification(`🎉 Focus session complete! Select a subject next time to sync with direct study log hours.`);
            }
          }
        }
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [pomoIsActive, pomoMinutes, pomoSeconds, pomoSelectedSubjectId, subjects, pomoCompletedSessions]);

  const selectPomoMode = (mode: "work" | "short" | "long" | "fast") => {
    setPomoIsActive(false);
    setPomoMode(mode);
    if (mode === "work") {
      setPomoMinutes(25);
      setPomoSeconds(0);
    } else if (mode === "short") {
      setPomoMinutes(5);
      setPomoSeconds(0);
    } else if (mode === "long") {
      setPomoMinutes(15);
      setPomoSeconds(0);
    } else if (mode === "fast") {
      setPomoMinutes(0);
      setPomoSeconds(10);
    }
  };
  
  // Local note list in case document vault has no notes
  const [localRevNotes, setLocalRevNotes] = useState<RevNote[]>([
    { id: "rev-1", title: "Distributed Consensus & Paxos Cheat Sheet", subjectCode: "CS-401", summary: "Brief definitions of multi-paxos, safety properties, proposer-learner stages, and heartbeat frequencies.", difficulty: "Hard", reviewedCount: 4 },
    { id: "rev-2", title: "Neural Networks backpropagation calculus", subjectCode: "CS-352", summary: "Mathematical step-by-step chain rule derivatives for multi-layer weight adjustments with custom learning rates.", difficulty: "Hard", reviewedCount: 7 },
    { id: "rev-3", title: "Time Complexities of Core Sorting Algorithms", subjectCode: "CS-301", summary: "Quick reference card comparing QuickSort, MergeSort, HeapSort average/worst bounds and space requirements.", difficulty: "Easy", reviewedCount: 12 },
    { id: "rev-4", title: "Express Middleware Routing & CORS Mechanics", subjectCode: "CS-312", summary: "Visual chain loops of request-response pipelines, cookie parsing order, and header preflight responses.", difficulty: "Medium", reviewedCount: 3 }
  ]);

  // Input States for subject exam preparation detail editing
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<number>(90);
  const [editLevel, setEditLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [editAttendance, setEditAttendance] = useState<number>(85);
  const [editTargetAttendance, setEditTargetAttendance] = useState<number>(85);
  const [editExamDate, setEditExamDate] = useState<string>("");

  // Input states for quick revision memo
  const [newMemoTitle, setNewMemoTitle] = useState("");
  const [newMemoSubject, setNewMemoSubject] = useState("");
  const [newMemoText, setNewMemoText] = useState("");
  const [newMemoDiff, setNewMemoDiff] = useState<"Easy" | "Medium" | "Hard">("Medium");

  // Handle Note quick save
  const handleAddMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoTitle.trim() || !newMemoText.trim()) return;
    const item: RevNote = {
      id: `rev-${Date.now()}`,
      title: newMemoTitle,
      subjectCode: newMemoSubject || "General",
      summary: newMemoText,
      difficulty: newMemoDiff,
      reviewedCount: 1
    };
    setLocalRevNotes([item, ...localRevNotes]);
    setNewMemoTitle("");
    setNewMemoText("");
    
    // Also simulate adding a note to document vault tags
    const successMsg = `Revision Note "${newMemoTitle}" added successfully alongside your exam prep cards!`;
    if (throwNotification) {
      throwNotification(successMsg, "success");
    } else {
      alert(successMsg);
    }
  };

  // Review count incrementer
  const handleReviewNote = (id: string) => {
    setLocalRevNotes(localRevNotes.map(n => n.id === id ? { ...n, reviewedCount: n.reviewedCount + 1 } : n));
  };

  // Save specific subject exam target modification
  const handleSaveExamSetup = (sub: Subject) => {
    onUpdateSubject({
      ...sub,
      score: editScore, // using score field as our Exam Target/Actual Score value
      attendance: editAttendance,
      targetAttendance: editTargetAttendance,
      // we store study level dynamically as 1, 2, or 3
      studyHours: editLevel === "Beginner" ? 1 : editLevel === "Intermediate" ? 2 : 3,
      examDate: editExamDate
    });
    setEditingSubId(null);
    if (throwNotification) {
      throwNotification(`Syllabus goals for ${sub.code} updated successfully!`, "success");
    }
  };

  const startEdit = (sub: Subject) => {
    setEditingSubId(sub.id);
    setEditScore(sub.score || 90);
    setEditAttendance(sub.attendance || 85);
    setEditTargetAttendance(sub.targetAttendance || 85);
    setEditExamDate(sub.examDate || "");
    // decode studyHours as our Proxy for Study Level
    const levelProxy = sub.studyHours === 1 ? "Beginner" : sub.studyHours === 3 ? "Advanced" : "Intermediate";
    setEditLevel(levelProxy as any);
  };

  const getLevelDisplay = (studyHours: number) => {
    if (studyHours === 1) return { label: "🔴 Beginner", pct: 30, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    if (studyHours === 3) return { label: "🟢 Advanced Expert", pct: 100, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    return { label: "🟡 Intermediate", pct: 65, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
  };

  // Combine document vault notes with our pre-loaded files
  const combinedVaultNotes = documents.filter(d => d.type === "Notes" || d.folder.toLowerCase() === "revision");

  return (
    <div className="space-y-6">
      
      {/* EXAM TITLE HEAD */}
      <div className="p-6 student-card relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl -z-10" />
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono student-text-accent font-bold uppercase tracking-wider block">STUDENTOS EXAM CONSOLE</span>
            <h1 className="text-2xl font-bold student-text-title tracking-tight mt-0.5">Exam Preparation Mode</h1>
            <p className="student-text-muted text-xs leading-relaxed max-w-xl mt-1">
              Synchronize target marks, evaluate study levels, log scores, and flashcard-review your already uploaded exam revision notes in high interactivity!
            </p>
          </div>
        </div>

        {/* TABS SEGMENT CONVERSOR */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-black/45 w-full md:w-fit rounded-xl border border-white/5 mt-6">
          {[
            { id: "grades", label: "🎯 Subject Goals", icon: Star },
            { id: "notes", label: "📚 Revision Notes", icon: FileText },
            { id: "recall", label: "⚡ Active Recall", icon: Sparkles },
            { id: "pomodoro", label: "⏱️ Pomodoro Tracker", icon: Timer }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold select-none transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? "student-btn scale-102"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* RENDER ACTIVE TAB VIEW */}
      <AnimatePresence mode="wait">
        {activeTab === "grades" && (
          <motion.div
            key="grades"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Left Side: Subject Score Deck */}
              <div className="md:col-span-2 space-y-3.5">
                {subjects.map(sub => {
                  const levelInfo = getLevelDisplay(sub.studyHours);
                  const isEditing = editingSubId === sub.id;

                  return (
                    <div key={sub.id} className="p-5 student-card-inner space-y-4 hover:shadow transition-all relative overflow-hidden">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-gray-400">{sub.code}</span>
                            <h3 className="text-sm font-bold text-white tracking-wide">{sub.name}</h3>
                          </div>
                          
                          {/* Study level tag status */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${levelInfo.color} font-mono font-bold`}>
                              {levelInfo.label}
                            </span>
                            <span className="text-[10px] student-text-muted">Target Exam Grade limit:</span>
                            <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/20 px-1.5 py-0.5 rounded border border-cyan-500/10">
                              {sub.score || 90}/100 Marks
                            </span>
                            {sub.examDate && (
                              <span className="text-[10px] flex items-center gap-1 text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full font-mono font-semibold">
                                📅 Exam: {sub.examDate}
                              </span>
                            )}
                          </div>
                        </div>

                        {!isEditing && (
                          <button
                            onClick={() => startEdit(sub)}
                            className="text-xs student-text-accent hover:opacity-85 font-mono cursor-pointer border border-[#818cf8]/20 bg-[#6366f1]/5 px-2.5 py-1 rounded-xl"
                          >
                            [Change Goals / Prep]
                          </button>
                        )}
                      </div>

                      {/* EDITING FORM PORTLET */}
                      {isEditing ? (
                        <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-3 animate-fadeIn">
                          <h4 className="text-[10px] text-gray-400 font-mono font-bold">CONFIGURE PREPARATION SPECIFICS</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="text-[10px] text-gray-500 font-mono block mb-1">TARGET SCORE / MARK (1-100)</label>
                              <input 
                                type="number" 
                                min="1" 
                                max="100"
                                value={editScore}
                                onChange={(e) => setEditScore(Number(e.target.value))}
                                className="w-full student-input px-3 py-1.5 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-500 font-mono block mb-1 font-bold">REVISION STUDY LEVEL</label>
                              <select
                                value={editLevel}
                                onChange={(e) => setEditLevel(e.target.value as any)}
                                className="w-full student-input px-3 py-1.5 text-xs text-white"
                              >
                                <option value="Beginner">🔴 Beginner (Struggling/Needs Review)</option>
                                <option value="Intermediate">🟡 Intermediate (Good Basics)</option>
                                <option value="Advanced">🟢 Advanced Expert (Thoroughly Prepared)</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                            <div>
                              <label className="text-[10px] text-gray-500 font-mono block mb-1">CURRENT ATTENDANCE (%)</label>
                              <input 
                                type="number" 
                                min="0" 
                                max="100"
                                value={editAttendance}
                                onChange={(e) => setEditAttendance(Number(e.target.value))}
                                className="w-full student-input px-3 py-1.5 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-500 font-mono block mb-1">TARGET ATTENDANCE (%)</label>
                              <input 
                                type="number" 
                                min="0" 
                                max="100"
                                value={editTargetAttendance}
                                onChange={(e) => setEditTargetAttendance(Number(e.target.value))}
                                className="w-full student-input px-3 py-1.5 text-xs text-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                            <div>
                              <label className="text-[10px] text-gray-500 font-mono block mb-1">UPCOMING EXAM DATE</label>
                              <input 
                                type="date" 
                                value={editExamDate}
                                onChange={(e) => setEditExamDate(e.target.value)}
                                className="w-full student-input px-3 py-1.5 text-xs text-white"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-1.5 pt-2">
                            <button
                              onClick={() => setEditingSubId(null)}
                              className="px-3 py-1.5 text-[11px] text-gray-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveExamSetup(sub)}
                              className="px-4 py-1.5 student-btn text-[11px] font-bold"
                            >
                              Save Score & Attendance
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono student-text-muted">
                            <span>Subject Prep Completion Index</span>
                            <span>{levelInfo.pct}% Ready</span>
                          </div>
                          <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 rounded-full ${
                                sub.studyHours === 1 ? "bg-rose-500" :
                                sub.studyHours === 3 ? "bg-emerald-500" :
                                "bg-amber-500"
                              }`}
                              style={{ width: `${levelInfo.pct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Side: Score Target Progress summary */}
              <div className="p-5 student-card flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest block">Preparation Metrics</span>
                  
                  <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-center">
                    <span className="block text-[10px] text-gray-400 font-mono uppercase">Average Target Mark</span>
                    <span className="text-3xl font-bold text-white font-sans tracking-tight">
                      {Math.round(subjects.reduce((sc, su) => sc + (su.score || 90), 0) / (subjects.length || 1))}%
                    </span>
                    <span className="block text-[10px] text-indigo-300 mt-1">Excellent Aiming Bound!</span>
                  </div>

                  <div className="space-y-2 text-xs leading-relaxed student-text-muted">
                    <div className="flex gap-2 items-start bg-black/15 p-2 rounded-xl border border-white/5">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Red subjects</strong> indicate a beginner level status. Allocate extra study hours this week.
                      </span>
                    </div>
                    <div className="flex gap-2 items-start bg-black/15 p-2 rounded-xl border border-white/5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Green subjects</strong> verify thoroughly confident exam capabilities. Maintain active recall!
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-white/5 pt-4 mt-4">
                  <span className="text-[10px] font-mono block text-gray-500 uppercase">SYS STRENGTH STATUS</span>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white mt-1">
                    <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
                    <span>Active Exam Preparatory Mode</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {activeTab === "notes" && (
          <motion.div
            key="notes"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Search and stats bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter syllabus revision notes, Paxos, complexities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full student-input pl-9 pr-4 py-2 text-xs text-white"
                />
              </div>

              <div className="text-[11px] font-mono student-text-muted whitespace-nowrap bg-white/5 px-3 py-1 rounded-xl">
                🎒 Document Vault Notes matched: <strong>{combinedVaultNotes.length} Found</strong>
              </div>
            </div>

            {/* Already Uploaded Notes Section (from StudentOS Vault) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Interactive Exam Revision Binder</span>
                </h3>

                {combinedVaultNotes.length > 0 && (
                  <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 space-y-3.5 mb-4">
                    <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase shrink-0">AUTHENTIC DOCUMENTS DETECTED IN VAULT:</span>
                    {combinedVaultNotes.map((doc) => (
                      <div key={doc.id} className="p-3 bg-black/45 rounded-xl border border-white/5 flex justify-between items-center text-xs hover:border-indigo-400/20 transition-all">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-400" />
                          <div>
                            <span className="font-bold text-gray-200">{doc.name}</span>
                            <span className="block text-[9px] font-mono text-gray-500 mt-0.5">FOLDER: {doc.folder} | TAGS: {doc.tags.join(", ")}</span>
                          </div>
                        </div>
                        <a 
                          href="#" 
                          onClick={(e) => { 
                            e.preventDefault(); 
                            const ocrText = doc.ocrContent || 'No active OCR text';
                            if (throwNotification) {
                              throwNotification(`OCR Metadata: ${ocrText}`, "info");
                            } else {
                              alert(`Reading Vault Document OCR metadata: ${ocrText}`);
                            }
                          }}
                          className="text-[10px] text-indigo-300 hover:underline flex items-center gap-1 shrink-0 font-mono uppercase font-bold"
                        >
                          OCR View <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {/* Local Quick revision notes deck */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {localRevNotes
                    .filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.summary.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(note => (
                      <div key={note.id} className="p-4.5 student-card-inner flex flex-col justify-between space-y-3 relative group hover:border-[#818cf8]/20 transition-all">
                        <div>
                          <div className="flex justify-between items-center text-[10px] font-mono mb-1.5">
                            <span className="text-cyan-400 font-bold bg-cyan-950/20 px-1.5 py-0.5 rounded">{note.subjectCode}</span>
                            <span className={`font-semibold ${note.difficulty === "Hard" ? "text-rose-400" : "text-emerald-400"}`}>{note.difficulty} Prep</span>
                          </div>
                          
                          <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-all font-sans leading-relaxed">
                            {note.title}
                          </h4>
                          
                          <p className="text-[11px] student-text-muted mt-2 leading-relaxed">
                            {note.summary}
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-3 mt-1 border-t border-white/5 text-[10px] font-mono">
                          <span className="text-gray-500">Reviewed {note.reviewedCount}x</span>
                          <button
                            onClick={() => handleReviewNote(note.id)}
                            className="text-indigo-400 hover:text-indigo-300 font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                          >
                            Mark Reviewed ✓
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Add New Revision Cheat memo panel */}
              <div className="p-5 student-card border-indigo-500/10">
                <h3 className="text-xs font-mono font-bold tracking-widest text-indigo-300 uppercase mb-4">Quick Note Broadcaster</h3>
                
                <form onSubmit={handleAddMemo} className="space-y-4">
                  <div>
                    <label className="text-[9px] text-gray-500 font-mono block mb-1">NOTE/CHEAT SUBJECT TITLE</label>
                    <input
                      type="text"
                      placeholder="e.g. Backpropagation derivatives"
                      value={newMemoTitle}
                      onChange={(e) => setNewMemoTitle(e.target.value)}
                      className="w-full student-input px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-gray-500 font-mono block mb-1">SUBJECT CODE</label>
                      <select
                        value={newMemoSubject}
                        onChange={(e) => setNewMemoSubject(e.target.value)}
                        className="w-full student-input px-2 py-1.5 text-xs text-white"
                      >
                        <option value="">Choose Code</option>
                        {subjects.map(s => (
                          <option key={s.id} value={s.code}>{s.code}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] text-gray-500 font-mono block mb-1">DIFFICULTY</label>
                      <select
                        value={newMemoDiff}
                        onChange={(e) => setNewMemoDiff(e.target.value as any)}
                        className="w-full student-input px-2 py-1.5 text-xs text-white"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-500 font-mono block mb-1">REVISION SUMMARY</label>
                    <textarea
                      rows={4}
                      placeholder="Enter formulas, concepts, algorithms, definitions to active recall..."
                      value={newMemoText}
                      onChange={(e) => setNewMemoText(e.target.value)}
                      className="w-full student-input p-3 text-xs text-white resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 student-btn font-bold text-xs"
                  >
                    Bind Revision Note Card
                  </button>
                </form>
              </div>

            </div>
          </motion.div>
        )}

        {activeTab === "recall" && (
          <motion.div
            key="recall"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-6 student-card space-y-4 border-cyan-500/10 text-center max-w-2xl mx-auto"
          >
            <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white tracking-wide">AI Active Recall & Spaced Repetition</h3>
            <p className="student-text-muted text-xs leading-relaxed max-w-md mx-auto">
              Test your knowledge! Our AI loads your Paxos cheatsheet and ML formulas, formulating mini diagnostics to test actual exam readiness.
            </p>

            <div className="p-4 bg-black/45 border border-white/5 rounded-2xl text-left my-4 space-y-3">
              <span className="text-[10px] font-mono font-bold text-indigo-400 block uppercase">Generated Diagnostic Question:</span>
              <p className="text-xs font-bold text-white italic">
                "Explain why Multi-Paxos requires two-phase initialization only for the initial leader proposal, and how lease durations prevent split-brain consensus failures."
              </p>
              
              <div className="pl-3 border-l-2 border-indigo-500 text-[11px] text-gray-400 italic">
                Core answer hint: Leader lease agreements pre-allocate silent proposer superiority indices during steady state operations.
              </div>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => {
                  const msg = "Generating self test question based on your uploaded CS-352 Neural calculus note...";
                  if (throwNotification) {
                    throwNotification(msg, "info");
                  } else {
                    alert(msg);
                  }
                }}
                className="px-4 py-2 student-btn text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                Next AI recall challenge
              </button>
              <button
                onClick={() => {
                  const msg = "Marked topic as: 100% Correct. Spaced intervals recalculating for tomorrow.";
                  if (throwNotification) {
                    throwNotification(msg, "success");
                  } else {
                    alert(msg);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs border border-emerald-500/20 transition-all font-semibold cursor-pointer"
              >
                I knew this! (✓ Expert)
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === "pomodoro" && (
          <motion.div
            key="pomodoro"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {pomoNotification && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-2xl flex items-center gap-2.5 shadow-md font-sans"
              >
                <Bell className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
                <span className="font-semibold">{pomoNotification}</span>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Config & Statistics */}
              <div className="md:col-span-1 space-y-4">
                <div className="p-5 student-card space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <Timer className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">Focus Syllabus Sync</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block mb-1">CHOOSE COURSE TO ACCREDIT</label>
                      <select
                        value={pomoSelectedSubjectId}
                        onChange={(e) => setPomoSelectedSubjectId(e.target.value)}
                        className="w-full student-input px-3 py-2 text-xs text-white"
                      >
                        <option value="">-- No course selected --</option>
                        {subjects.map(s => (
                          <option key={s.id} value={s.id}>
                            📚 {s.name} ({s.code})
                          </option>
                        ))}
                      </select>
                      <p className="text-[9px] text-gray-500 font-sans mt-1.5 leading-relaxed">
                        Completing a focus countdown successfully logs **+1 Hour** of deep work directly to that subject's syllabus tracker!
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5">
                      <span className="text-[10px] text-gray-500 font-mono block mb-2 uppercase">CHOOSE SESSION TYPE</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => selectPomoMode("work")}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-mono transition-all font-bold cursor-pointer ${pomoMode === "work" ? "bg-indigo-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                        >
                          🧠 Focus (25m)
                        </button>
                        <button
                          type="button"
                          onClick={() => selectPomoMode("short")}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-mono transition-all font-bold cursor-pointer ${pomoMode === "short" ? "bg-indigo-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                        >
                          ☕ Short Break (5m)
                        </button>
                        <button
                          type="button"
                          onClick={() => selectPomoMode("long")}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-mono transition-all font-bold cursor-pointer ${pomoMode === "long" ? "bg-indigo-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                        >
                          🏖️ Long Break (15m)
                        </button>
                        <button
                          type="button"
                          title="Instant 10-second test completion"
                          onClick={() => selectPomoMode("fast")}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-mono transition-all font-bold border border-cyan-500/20 cursor-pointer ${pomoMode === "fast" ? "bg-cyan-600 text-white animate-pulse" : "bg-cyan-950/10 text-cyan-400 hover:bg-cyan-950/20"}`}
                        >
                          🧪 Fast Test (10s)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session tally box */}
                <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-sans">Cycles Finished Today</span>
                    <span className="text-indigo-400 font-mono font-bold bg-indigo-950/30 px-2 py-0.5 rounded border border-indigo-500/10">{pomoCompletedSessions} sessions</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-sans">Synced Database Status</span>
                    <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      Live Sync Enabled
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle/Center Column: High fidelity display clock */}
              <div className="md:col-span-2 space-y-4">
                <div className="p-8 student-card flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  {/* Outer circle layout */}
                  <div className="relative w-48 h-48 rounded-full border-4 border-white/5 flex items-center justify-center p-6 bg-black/20 my-2">
                    {/* Ring visual based on mode */}
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-pulse pointer-events-none" />
                    
                    <div className="space-y-1">
                      <span className="block text-[10px] font-mono tracking-widest text-[#818cf8] uppercase font-bold">
                        {pomoMode === "work" ? "📝 DEEP FOCUS" : pomoMode === "short" ? "☕ COFFEE BREAK" : pomoMode === "long" ? "🏖️ REST CYLINDER" : "🧪 SPEEDY TEST"}
                      </span>
                      <h2 className="text-4xl font-extrabold text-white tracking-wide font-mono leading-none">
                        {String(pomoMinutes).padStart(2, "0")}:{String(pomoSeconds).padStart(2, "0")}
                      </h2>
                      <span className="block text-[9px] text-gray-500 font-sans font-medium">
                        {pomoIsActive ? "TIMER RUNNING" : "PAUSED"}
                      </span>
                    </div>
                  </div>

                  {/* Play & Reset Controller panel */}
                  <div className="flex gap-3 justify-center mt-4 w-full max-w-xs">
                    <button
                      type="button"
                      onClick={() => setPomoIsActive(!pomoIsActive)}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        pomoIsActive 
                          ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30" 
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                      }`}
                    >
                      {pomoIsActive ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Pause Session</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Start Focus</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPomoIsActive(false);
                        selectPomoMode(pomoMode);
                      }}
                      className="px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all border border-white/5 cursor-pointer flex items-center justify-center"
                      title="Reset focus clock"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sound ambient control element */}
                  <div className="pt-4 mt-6 border-t border-white/5 w-full flex items-center justify-between text-xs text-gray-400 px-2 flex-wrap gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 font-bold">Ambient Sound FXs:</span>
                    
                    <div className="flex gap-1">
                      {["Off", "Forest", "Rain", "White Noise"].map(soundName => (
                        <button
                          key={soundName}
                          type="button"
                          onClick={() => setPomoNotification(`🔊 Ambient generator simulation: Loading audio channel "${soundName}"`)}
                          className="px-2 py-1 rounded bg-black/40 hover:bg-black/80 hover:text-white border border-white/5 text-[9px] font-mono text-gray-500 cursor-pointer"
                        >
                          {soundName}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
