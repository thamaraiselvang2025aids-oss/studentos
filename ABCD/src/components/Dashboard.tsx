import React, { useState, useEffect } from "react";
import { 
  Sparkles, Clock, Calendar, AlertTriangle, Play, CheckCircle2, 
  Flame, Award, Briefcase, GraduationCap, ArrowRight, Compass 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StudentOSData } from "../types";

interface DashboardProps {
  data: StudentOSData;
  onNavigate: (tab: string) => void;
  onUpdateProfile: (updatedProfile: StudentOSData["profile"]) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.97 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 14,
      mass: 0.8
    }
  }
};

export default function Dashboard({ data, onNavigate, onUpdateProfile }: DashboardProps) {
  const [motivation, setMotivation] = useState(
    "Your potential is endless. Go build something that outlives your workspace."
  );
  const [aiTip, setAiTip] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Edit profile states
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: data.profile.name,
    college: data.profile.college,
    major: data.profile.major,
    gpa: data.profile.gpa,
    semester: data.profile.semester,
    skills: data.profile.skills.join(", ")
  });

  // Sync edits when raw data changes
  useEffect(() => {
    setProfileForm({
      name: data.profile.name,
      college: data.profile.college,
      major: data.profile.major,
      gpa: data.profile.gpa,
      semester: data.profile.semester,
      skills: data.profile.skills.join(", ")
    });
  }, [data.profile]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Countdown calculations
  const nextDeadline = data.tasks
    .filter(t => t.status !== "Done")
    .map(t => new Date(t.deadline))
    .sort((a, b) => a.getTime() - b.getTime())[0];

  const daysLeft = nextDeadline 
    ? Math.max(0, Math.ceil((nextDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Retrieve smart suggestions via Gemini API
  const fetchAISuggestions = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/ai/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "give short list of priorities first three on dashboard" })
      });
      const resData = await res.json();
      setAiTip(resData.text);
    } catch (e) {
      setAiTip("Verify internet access and connect GEMINI_API_KEY for real-time schedule sorting.");
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchAISuggestions();
  }, [data]);

  const rotateMotivation = () => {
    const quotes = [
      "Small daily pushes aggregate into career-defining portfolios.",
      "A 9.1 CGPA combined with zero demo links is an empty resume. Always build.",
      "The best time to build was during the hackathon. The second best time is tonight.",
      "Stay curious, iterate often, and trust the process of trial and compile.",
      "Write clean code, document carefully, and leave the optimization to compilers."
    ];
    const index = Math.floor(Math.random() * quotes.length);
    setMotivation(quotes[index]);
  };

  // SVG Study hours line generator helper
  const maxHours = Math.max(...data.subjects.map(s => s.studyHours), 1);
  const points = data.subjects.map((s, idx) => {
    const x = 50 + idx * 80;
    const y = 140 - (s.studyHours / maxHours) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Top Banner with Clock & Profile summary */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 student-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -z-10" />
        
        <div>
          <span className="text-xs font-mono text-indigo-400 capitalize tracking-wider font-semibold">STUDENTOS CENTRAL PREVIEW</span>
          <h1 className="text-3xl font-bold font-sans tracking-tight student-text-title mt-1 flex flex-wrap items-center gap-3">
            Hi, {data.profile.name}!
            <button 
              onClick={() => setIsEditing(true)}
              className="text-[10px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-xl cursor-pointer transition-all select-none"
            >
              [Edit Profile]
            </button>
          </h1>
          <p className="student-text-muted mt-1 max-w-lg text-sm leading-relaxed">
            Major in <strong className="text-gray-200">{data.profile.major}</strong> at {data.profile.college} ({data.profile.semester})
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/[0.05] border border-white/10 px-5 py-3 rounded-2xl shrink-0">
          <Clock className="w-5 h-5 text-indigo-400 animate-pulse" />
          <div className="text-left md:text-right">
            <span className="block text-[10px] student-text-muted font-mono tracking-wider uppercase">Live calendar & Day</span>
            <span className="font-mono text-xs leading-none font-extrabold text-cyan-400 block mb-1">
              {currentDateTime.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </span>
            <span className="font-mono text-[11px] leading-none font-bold text-white/95 block">
              {currentDateTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Grid of OS Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Countdown / Urgent Alert */}
        <motion.div variants={itemVariants} className="col-span-1 p-6 student-card flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs student-text-muted font-mono">Exam Countdown</span>
              <p className="student-text-title font-bold text-sm">ML Research Outlining</p>
            </div>
          </div>
          <div className="my-6">
            <div className="text-5xl font-mono font-bold tracking-tight text-white flex items-baseline">
              {daysLeft}
              <span className="text-lg font-sans font-medium student-text-muted ml-2">Days left</span>
            </div>
          </div>
          <button 
            onClick={() => onNavigate("tasks")}
            className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-medium text-xs border border-rose-500/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            Manage Deadlines <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* AI suggested sorting Widget */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 p-6 student-card flex flex-col justify-between relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -z-10" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs student-text-accent font-mono">StudentOS Co-Pilot</span>
                <p className="student-text-title font-bold text-sm">Autonomous Study Suggestion </p>
              </div>
            </div>
            
            <button 
              onClick={fetchAISuggestions}
              disabled={loadingAi}
              className="text-xs student-text-accent hover:opacity-80 transition-all font-mono hover:scale-105 disabled:opacity-50 cursor-pointer"
            >
              [Refresh AI]
            </button>
          </div>

          <div className="my-4 student-card-inner p-4 min-h-[90px] flex flex-col justify-center">
            {loadingAi ? (
              <div className="flex items-center gap-2 text-indigo-350 font-mono text-xs">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                <span>Generating custom schedules...</span>
              </div>
            ) : (
              <p className="student-text-muted leading-relaxed text-sm whitespace-pre-wrap font-mono select-none">
                {aiTip || "Ready to serve schedule prioritizations. Key in your details to start."}
              </p>
            )}
          </div>

          <button 
            onClick={() => onNavigate("chatbot")}
            className="w-fit student-text-accent font-semibold text-xs tracking-wide transition-all flex items-center gap-1.5 self-end cursor-pointer"
          >
            Launch Core AI Assistant <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly study hours graph (Custom SVG style) */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-2 p-6 student-card">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Study Hours & Allocation</h2>
              <span className="text-xs text-gray-500">Weekly breakdown across course tracks</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-indigo-400">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Hours Spanned</span>
              </div>
            </div>
          </div>

          <div className="relative h-44 w-full flex items-end justify-center select-none pt-4">
            {/* Custom SVG line plot */}
            <svg className="absolute inset-0 w-full h-full p-2 overflow-visible">
              <defs>
                <linearGradient id="gridGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Grid Background Lines */}
              <line x1="0" y1="140" x2="100%" y2="140" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1"/>
              <line x1="0" y1="90" x2="100%" y2="90" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1"/>
              <line x1="0" y1="40" x2="100%" y2="40" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1"/>
              
              {/* Smooth Area Cover */}
              <path 
                d={`M 50,140 L ${points} L ${50 + (data.subjects.length - 1) * 80},140 Z`} 
                fill="url(#gridGrad)"
                className="transition-all duration-300"
              />
              
              {/* Main Stroke */}
              <polyline 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="3" 
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round" 
              />
              
              {/* Point Dots */}
              {data.subjects.map((s, idx) => {
                const x = 50 + idx * 80;
                const y = 140 - (s.studyHours / maxHours) * 100;
                return (
                  <g key={s.id} className="group cursor-pointer">
                    <circle cx={x} cy={y} r="5" fill="#818cf8"/>
                    <circle cx={x} cy={y} r="10" fill="#818cf8" fillOpacity="0.15" className="animate-ping"/>
                  </g>
                );
              })}
            </svg>

            {/* Labels overlay */}
            <div className="absolute bottom-[-16px] left-0 w-full flex justify-around pl-10 pr-6 font-mono text-[10px] text-gray-500">
              {data.subjects.map(s => (
                <span key={s.id} className="truncate w-16 text-center">{s.code}</span>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-around mt-8 border-t border-white/5 pt-4 text-center">
            <div>
              <span className="block text-xs font-mono text-gray-500">Total subjects</span>
              <span className="text-xl font-bold tracking-tight text-white">{data.subjects.length}</span>
            </div>
            <div>
              <span className="block text-xs font-mono text-gray-500">Goal study score</span>
              <span className="text-xl font-bold tracking-tight text-white">40 Hrs/wk</span>
            </div>
            <div>
              <span className="block text-xs font-mono text-gray-500">Spanned Hours</span>
              <span className="text-xl font-bold tracking-tight text-indigo-400">
                {data.subjects.reduce((acc, curr) => acc + curr.studyHours, 0)} Hrs
              </span>
            </div>
          </div>
        </motion.div>

        {/* Attendance Index Watcher */}
        <motion.div variants={itemVariants} className="col-span-1 p-6 student-card flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold student-text-title tracking-tight">Attendance Index</h2>
            <p className="text-xs student-text-muted mt-1">Keep attendance indices safely above min limits (85%)</p>
          </div>

          <div className="space-y-4 my-6">
            {data.subjects.map(sub => {
              const complies = sub.attendance >= sub.targetAttendance;
              return (
                <div key={sub.id} className="flex justify-between items-center student-card-inner p-3">
                  <div className="max-w-[120px]">
                    <span className="block text-xs font-bold text-white truncate">{sub.name}</span>
                    <span className="text-[10px] student-text-muted font-mono tracking-wider">{sub.code}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold font-mono ${complies ? "text-emerald-400" : "text-amber-400"}`}>
                      {sub.attendance}%
                    </span>
                    {complies ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => onNavigate("tasks")}
            className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition-all font-semibold rounded-xl text-xs cursor-pointer"
          >
            Review Attendance Registry
          </button>
        </motion.div>
      </div>

      {/* Motivational widget & micro-goals */}
      <motion.div variants={itemVariants} className="p-6 student-card relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -z-10" />
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-400">
            <Flame className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <span className="block text-xs text-orange-400 font-mono font-semibold uppercase tracking-wider">DAILY REFLECTIVE ADAGE</span>
            <p className="student-text-muted text-sm mt-1 leading-relaxed font-sans select-none italic max-w-2xl">
              "{motivation}"
            </p>
          </div>
        </div>
        <button 
          onClick={rotateMotivation} 
          className="text-xs bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 font-mono px-4 py-2 rounded-xl border border-orange-500/25 transition-all select-none cursor-pointer"
        >
          [Draw Reflection]
        </button>
      </motion.div>

      {/* PROFILE EDIT MODAL */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0d1021] border border-white/10 rounded-3xl p-6 shadow-2xl relative"
            >
              <h3 className="text-lg font-bold text-white mb-1">Update Student Profile</h3>
              <p className="text-[11px] student-text-muted mb-4">Input actual college, major, and class details</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono text-indigo-400 uppercase font-bold mb-1">Your Full Name</label>
                  <input 
                    type="text"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full student-input py-2 px-3 text-xs text-white"
                    placeholder="e.g. Sana Patel"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-indigo-400 uppercase font-bold mb-1">University / College</label>
                    <input 
                      type="text"
                      value={profileForm.college}
                      onChange={e => setProfileForm({ ...profileForm, college: e.target.value })}
                      className="w-full student-input py-2 px-3 text-xs text-white"
                      placeholder="e.g. Stanford University"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-indigo-400 uppercase font-bold mb-1">Major Pathway</label>
                    <input 
                      type="text"
                      value={profileForm.major}
                      onChange={e => setProfileForm({ ...profileForm, major: e.target.value })}
                      className="w-full student-input py-2 px-3 text-xs text-white"
                      placeholder="e.g. Computer Science & AI"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-indigo-400 uppercase font-bold mb-1">Cumulative GPA</label>
                    <input 
                      type="text"
                      value={profileForm.gpa}
                      onChange={e => setProfileForm({ ...profileForm, gpa: e.target.value })}
                      className="w-full student-input py-2 px-3 text-xs text-white"
                      placeholder="e.g. 3.92"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-indigo-400 uppercase font-bold mb-1">Semester</label>
                    <input 
                      type="text"
                      value={profileForm.semester}
                      onChange={e => setProfileForm({ ...profileForm, semester: e.target.value })}
                      className="w-full student-input py-2 px-3 text-xs text-white"
                      placeholder="e.g. 6th Semester"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-indigo-400 uppercase font-bold mb-1">Professional Skills (comma separated)</label>
                  <textarea 
                    value={profileForm.skills}
                    onChange={e => setProfileForm({ ...profileForm, skills: e.target.value })}
                    className="w-full student-input py-2 px-3 text-xs text-white h-20 resize-none"
                    placeholder="Python, TypeScript, TensorFlow, Flutter"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-6 border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!profileForm.name.trim() || !profileForm.college.trim() || !profileForm.major.trim()) {
                      alert("Please fill in Name, College, and Major!");
                      return;
                    }
                    onUpdateProfile({
                      name: profileForm.name.trim(),
                      college: profileForm.college.trim(),
                      major: profileForm.major.trim(),
                      gpa: profileForm.gpa.trim(),
                      semester: profileForm.semester.trim(),
                      skills: profileForm.skills.split(",").map(s => s.trim()).filter(Boolean)
                    });
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-indigo-600/10"
                >
                  Save Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
