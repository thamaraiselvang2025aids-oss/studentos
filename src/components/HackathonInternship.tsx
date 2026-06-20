import React, { useState } from "react";
import { 
  Trophy, Briefcase, Plus, Github, ExternalLink, Calendar, 
  Sparkles, CheckCircle2, AlertCircle, Bookmark, MessageSquare 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Hackathon, Internship } from "../types";

interface HackathonInternshipProps {
  hackathons: Hackathon[];
  internships: Internship[];
  onAddHackathon: (hack: Omit<Hackathon, "id">) => void;
  onAddInternship: (intern: Omit<Internship, "id">) => void;
  onUpdateInternshipStatus: (id: string, status: Internship["status"]) => void;
}

export default function HackathonInternship({
  hackathons, internships, onAddHackathon, onAddInternship, onUpdateInternshipStatus
}: HackathonInternshipProps) {

  const [activeSubTab, setActiveSubTab] = useState<"hacks" | "internships">("hacks");

  // Local Form state - Hackathon
  const [hackName, setHackName] = useState("");
  const [hackStatus, setHackStatus] = useState<Hackathon["status"]>("Applied");
  const [hackTitle, setHackTitle] = useState("");
  const [hackPrize, setHackPrize] = useState("");
  const [hackDate, setHackDate] = useState("2026-06-25");

  // Local Form state - Internship
  const [internCompany, setInternCompany] = useState("");
  const [internRole, setInternRole] = useState("");
  const [internStatus, setInternStatus] = useState<Internship["status"]>("Applied");
  const [internInterviewDate, setInternInterviewDate] = useState("");

  const handleCreateHack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hackName.trim()) return;
    onAddHackathon({
      name: hackName,
      status: hackStatus,
      date: hackDate,
      submissionTitle: hackTitle,
      prize: hackPrize || undefined,
      members: ["Alex Mercer", "Devin Smith"]
    });
    setHackName("");
    setHackTitle("");
    setHackPrize("");
  };

  const handleCreateIntern = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internCompany.trim() || !internRole.trim()) return;
    onAddInternship({
      company: internCompany,
      role: internRole,
      status: internStatus,
      interviewDate: internInterviewDate || undefined,
      feedback: ""
    });
    setInternCompany("");
    setInternRole("");
    setInternInterviewDate("");
  };

  const hackStatusStyles = {
    Won: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Submitted: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    Accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Applied: "bg-gray-500/10 text-gray-400 border-gray-500/15",
    Rejected: "bg-rose-500/15 text-rose-400 border-rose-500/20"
  };

  const internStatusStyles = {
    Offer: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    Interviewing: "bg-amber-500/10 text-amber-400 border-amber-400/20 animate-pulse",
    Applied: "bg-gray-500/10 text-gray-400 border-gray-500/15",
    Rejected: "bg-rose-500/15 text-rose-400 border-rose-500/20"
  };

  return (
    <div className="space-y-6">
      
      {/* TABS SELECTOR */}
      <div className="flex gap-1.5 p-1 student-card-inner w-fit">
        <button 
          onClick={() => setActiveSubTab("hacks")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all select-none cursor-pointer ${activeSubTab === "hacks" ? "student-btn scale-102" : "text-gray-400 hover:text-white"}`}
        >
          <Trophy className="w-4 h-4" />
          <span>Hackathon Arena</span>
        </button>
        <button 
          onClick={() => setActiveSubTab("internships")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all select-none cursor-pointer ${activeSubTab === "internships" ? "student-btn scale-102" : "text-gray-400 hover:text-white"}`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Internships Pipeline</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === "hacks" ? (
          <motion.div 
            key="hacks-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* Hackathon register form */}
            <div className="p-6 student-card">
              <h2 className="text-lg font-bold student-text-title mb-4">Book New Hackathon Submission</h2>
              <form onSubmit={handleCreateHack} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-mono block mb-1">HACKATHON NAME</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Stanford Bio-Hacks"
                    value={hackName}
                    onChange={(e) => setHackName(e.target.value)}
                    className="w-full student-input px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-mono block mb-1">SUBMIT MOUNTED TITLE</label>
                  <input 
                    type="text" 
                    placeholder="e.g. GreenChain Protocol"
                    value={hackTitle}
                    onChange={(e) => setHackTitle(e.target.value)}
                    className="w-full student-input px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="w-1/2">
                    <label className="text-[10px] text-gray-500 font-mono block mb-1">STATUS</label>
                    <select 
                      value={hackStatus} 
                      onChange={(e) => setHackStatus(e.target.value as any)}
                      className="w-full student-input px-2 py-2 text-xs focus:outline-none"
                    >
                      <option className="bg-[#1e1e2f]" value="Won">Won</option>
                      <option className="bg-[#1e1e2f]" value="Submitted">Submitted</option>
                      <option className="bg-[#1e1e2f]" value="Accepted">Accepted</option>
                      <option className="bg-[#1e1e2f]" value="Applied">Applied</option>
                    </select>
                  </div>
                  <div className="w-1/2">
                    <label className="text-[10px] text-gray-500 font-mono block mb-1">PRIZE / RANK</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 1st Place"
                      value={hackPrize}
                      onChange={(e) => setHackPrize(e.target.value)}
                      className="w-full student-input px-2 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-500 font-mono block mb-1">DATE</label>
                    <input 
                      type="date"
                      value={hackDate}
                      onChange={(e) => setHackDate(e.target.value)}
                      className="w-full student-input px-2 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="py-2.5 px-4 student-btn font-semibold text-xs cursor-pointer flex items-center gap-1 transition-all"
                  >
                    Add Hack
                  </button>
                </div>
              </form>
            </div>

            {/* List entries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hackathons.map(hack => (
                <div key={hack.id} className="p-5 student-card-inner space-y-4 hover:shadow transition-all relative overflow-hidden">
                  {hack.status === "Won" && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-500/20 to-transparent flex items-start justify-end p-2 rounded-bl-3xl">
                      <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono student-text-muted tracking-wider flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {hack.date}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">{hack.name}</h3>
                    </div>
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${hackStatusStyles[hack.status]}`}>
                      {hack.status}
                    </span>
                  </div>

                  <div className="space-y-1 bg-black/15 p-3 rounded-xl border border-white/5">
                    <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest">SUBMISSION ENTRY</span>
                    <span className="text-gray-200 text-sm font-semibold">{hack.submissionTitle}</span>
                    {hack.prize && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-1 font-mono">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Award: {hack.prize}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1">
                    <span>Team: {hack.members?.join(", ")}</span>
                    <div className="flex gap-2">
                      <a href="#" className="p-1 px-2 hover:bg-white/5 rounded-lg flex items-center gap-1 text-[10px] border border-white/5">
                        <Github className="w-3 h-3" /> dev
                      </a>
                      <a href="#" className="p-1 px-2 text-indigo-400 hover:bg-white/5 rounded-lg flex items-center gap-1 text-[10px] border border-indigo-500/10">
                        <ExternalLink className="w-3 h-3" /> post
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="internships-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* Internship logs input */}
            <div className="p-6 student-card">
              <h2 className="text-lg font-bold student-text-title mb-4">Log Internship Job Application</h2>
              <form onSubmit={handleCreateIntern} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-mono block mb-1">COMPANY NAME</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Stripe"
                    value={internCompany}
                    onChange={(e) => setInternCompany(e.target.value)}
                    className="w-full student-input px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-mono block mb-1">TARGET ROLE</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Machine Learning Intern"
                    value={internRole}
                    onChange={(e) => setInternRole(e.target.value)}
                    className="w-full student-input px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-mono block mb-1">INTERVIEW DATE (OPTIONAL)</label>
                  <input 
                    type="date"
                    value={internInterviewDate}
                    onChange={(e) => setInternInterviewDate(e.target.value)}
                    className="w-full student-input px-2 py-1.5 text-xs focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-500 font-mono block mb-1">STATUS</label>
                    <select 
                      value={internStatus} 
                      onChange={(e) => setInternStatus(e.target.value as any)}
                      className="w-full student-input px-2 py-2 text-xs focus:outline-none"
                    >
                      <option className="bg-[#1e1e2f]" value="Applied">Applied</option>
                      <option className="bg-[#1e1e2f]" value="Interviewing">Interviewing</option>
                      <option className="bg-[#1e1e2f]" value="Offer">Offer</option>
                    </select>
                  </div>
                  <button 
                    type="submit"
                    className="py-2.5 px-4 student-btn font-semibold text-xs cursor-pointer flex items-center gap-1 transition-all"
                  >
                    Log App
                  </button>
                </div>
              </form>
            </div>

            {/* List Pipeline */}
            <div className="space-y-3">
              {internships.map(intern => (
                <div key={intern.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{intern.company}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{intern.role}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                    {intern.interviewDate && (
                      <div className="flex items-center gap-1.5 text-orange-400 bg-orange-500/5 border border-orange-500/10 px-2.5 py-1 rounded-xl">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Interview: {intern.interviewDate}</span>
                      </div>
                    )}

                    {intern.feedback && (
                      <div className="flex items-center gap-1 text-gray-400 max-w-xs truncate" title={intern.feedback}>
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Note: {intern.feedback}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <select 
                        value={intern.status}
                        onChange={(e) => onUpdateInternshipStatus(intern.id, e.target.value as any)}
                        className={`text-[10px] font-semibold tracking-wider uppercase border rounded-full px-3 py-1 bg-black/30 text-center select-none outline-none ${internStatusStyles[intern.status]}`}
                      >
                        <option className="bg-[#1e1e2f]" value="Applied">Applied</option>
                        <option className="bg-[#1e1e2f]" value="Interviewing">Interviewing</option>
                        <option className="bg-[#1e1e2f]" value="Offer">Offer</option>
                        <option className="bg-[#1e1e2f]" value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
