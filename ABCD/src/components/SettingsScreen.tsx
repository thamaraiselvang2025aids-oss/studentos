import React, { useState, useEffect } from "react";
import { 
  Sun, Moon, ShieldAlert, CheckCircle2, User, GraduationCap, 
  BookOpen, Award, Sparkles, Sliders, Smartphone, Laptop,
  Bell, Volume2, VolumeX, Trash2, Megaphone
} from "lucide-react";
import { motion } from "motion/react";
import { StudentOSData } from "../types";

interface SettingsScreenProps {
  data: StudentOSData;
  onUpdateProfile: (updatedProfile: StudentOSData["profile"]) => void;
  throwNotification?: (text: string, type?: "success" | "info" | "warning") => void;
  notificationHistory?: any[];
  notificationMute?: boolean;
  notificationDuration?: number;
  onToggleMute?: () => void;
  onChangeDuration?: (duration: number) => void;
  onClearHistory?: () => void;
  onTriggerMockNotif?: (text: string, type: "success" | "info" | "warning") => void;
}

export default function SettingsScreen({ 
  data, 
  onUpdateProfile, 
  throwNotification,
  notificationHistory = [],
  notificationMute = false,
  notificationDuration = 5000,
  onToggleMute,
  onChangeDuration,
  onClearHistory,
  onTriggerMockNotif
}: SettingsScreenProps) {
  // Contrast mode state from localStorage
  const [contrastMode, setContrastMode] = useState<"auto" | "light" | "dark">(() => {
    return (localStorage.getItem("studentos_contrast_mode") as any) || "auto";
  });

  // Profile forms
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

  const handleModeChange = (mode: "auto" | "light" | "dark") => {
    setContrastMode(mode);
    localStorage.setItem("studentos_contrast_mode", mode);
    
    const root = document.documentElement;
    // Remove both force classes
    root.classList.remove("force-light", "force-dark");
    
    if (mode === "light") {
      root.classList.add("force-light");
    } else if (mode === "dark") {
      root.classList.add("force-dark");
    }
    
    if (throwNotification) {
      throwNotification(
        `System mode swapped to: ${mode === "auto" ? "Theme Default" : mode === "light" ? "High-Contrast Light" : "High-Contrast Dark"}`, 
        "success"
      );
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: profileForm.name.trim(),
      college: profileForm.college.trim(),
      major: profileForm.major.trim(),
      gpa: profileForm.gpa.trim(),
      semester: profileForm.semester.trim(),
      skills: profileForm.skills.split(",").map(s => s.trim()).filter(Boolean)
    });
    if (throwNotification) {
      throwNotification("Student Profile metadata synchronized", "success");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-black student-text-title tracking-tight flex items-center gap-2">
          <Sliders className="w-6 h-6 text-indigo-505" />
          Settings Configuration
        </h2>
        <p className="text-xs student-text-muted mt-0.5">Force visual contracts or fine-tune academic profile variables</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* LEFT COMPONENT: STYLING & CONTRAST MODES */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-6 student-card">
            <h3 className="text-sm font-bold student-text-title mb-1 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" />
              Forced Contrast Modes
            </h3>
            <p className="text-[11px] student-text-muted mb-4 leading-relaxed">
              Force Light or Dark backgrounds system-wide, retaining active theme vibrant accents.
            </p>

            <div className="space-y-2.5">
              {[
                { id: "auto", title: "Theme Default (Auto)", desc: "Match base theme shading preset", icon: Sparkles, activeStyle: "border-indigo-500/50 text-indigo-300 bg-indigo-500/5" },
                { id: "light", title: "Force Light Mode", desc: "Clean, high-readability off-white background", icon: Sun, activeStyle: "border-amber-500/50 text-amber-500 bg-amber-500/5" },
                { id: "dark", title: "Force Dark Mode", desc: "Pure high-contrast midnight aesthetics", icon: Moon, activeStyle: "border-cyan-500/50 text-cyan-400 bg-cyan-500/5" }
              ].map((modeOpt) => {
                const Icon = modeOpt.icon;
                const isSelected = contrastMode === modeOpt.id;
                return (
                  <button
                    key={modeOpt.id}
                    onClick={() => handleModeChange(modeOpt.id as any)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected 
                        ? modeOpt.activeStyle
                        : "border-white/5 hover:border-white/10 hover:bg-white/5 text-gray-400"
                    }`}
                  >
                    <div className="p-2 bg-black/10 rounded-xl mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">{modeOpt.title}</span>
                      <span className="text-[10px] student-text-muted block mt-0.5">{modeOpt.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 student-card">
            <h3 className="text-sm font-bold student-text-title mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-500" />
              Persistence Diagnostics
            </h3>
            <p className="text-[10px] student-text-muted leading-relaxed mb-4">
              Authorized active firebase collection mapped to Cloud Firestore database <span className="font-mono text-emerald-400">users</span>.
            </p>
            <div className="bg-black/25 rounded-xl p-3 border border-white/5 font-mono text-[9px] text-gray-400 space-y-1">
              <div>DATABASE STATUS: <span className="text-emerald-400 font-bold">ONLINE</span></div>
              <div>RECOGNIZED UID: {data.profile?.name ? data.profile.name.substring(0, 3) + "***" : "N/A"}</div>
              <div>CLOUD SYNCHRONIZED: YES</div>
            </div>
          </div>

          <div className="p-6 student-card space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold student-text-title flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-indigo-400" />
                Notification Center
              </h3>
              <span className="text-[10px] font-mono select-none px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 font-bold">
                MGR
              </span>
            </div>

            <p className="text-[10px] student-text-muted leading-relaxed">
              Fine-tune alert durations, audio synthesizer cues, or trigger live sandbox notifications.
            </p>

            <div className="space-y-4">
              {/* Sound & Dismiss speed controls */}
              <div className="grid grid-cols-2 gap-3">
                {onToggleMute && (
                  <button
                    type="button"
                    onClick={onToggleMute}
                    className={`flex flex-col justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      notificationMute
                        ? "bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/10 text-rose-400"
                        : "bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    <div className="flex items-center gap-1 font-bold text-[10px]">
                      {notificationMute ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      SYNTH AUDIO
                    </div>
                    <span className="text-[9px] font-mono mt-1 font-bold">
                      {notificationMute ? "MUTED" : "ACTIVE CHIME"}
                    </span>
                  </button>
                )}

                {onChangeDuration && (
                  <div className="bg-[#121624]/60 border border-white/5 p-2.5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-gray-400 font-bold">DISMISS SPEED</span>
                    <select
                      value={notificationDuration}
                      onChange={(e) => onChangeDuration(Number(e.target.value))}
                      className="bg-[#0b0c14] text-[10px] border border-white/10 rounded-lg p-1 text-white focus:outline-none focus:border-indigo-500 mt-1 font-semibold"
                    >
                      <option value={3000}>3 Seconds</option>
                      <option value={5000}>5 Seconds</option>
                      <option value={8000}>8 Seconds</option>
                      <option value={0}>Infinite (Freeze)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Sandbox dispatch area */}
              {onTriggerMockNotif && (
                <div className="bg-black/15 p-3 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-[9px] text-gray-400 font-mono block font-bold">ALERT SIMULATOR</span>
                  <div className="flex gap-1">
                    {(["success", "info", "warning"] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          const customMsgs = {
                            success: "🎉 Simulated success: Task completed and verified by cloud OS!",
                            info: "💡 Simulated info: Synchronized active course syllabus tracking logs.",
                            warning: "⚠️ Simulated alert: Missing attendance threshold detected; log roll."
                          };
                          onTriggerMockNotif(customMsgs[t], t);
                        }}
                        className={`flex-1 py-1 text-[8px] uppercase tracking-wider font-extrabold rounded-lg transition-all cursor-pointer ${
                          t === "success" 
                            ? "bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20"
                            : t === "warning"
                            ? "bg-rose-500/10 border border-rose-500/15 text-rose-400 hover:bg-rose-500/20"
                            : "bg-indigo-500/10 border border-indigo-500/15 text-indigo-400 hover:bg-indigo-500/20"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* History stats */}
              <div className="bg-white/[0.01] p-3 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold">HISTORICAL LOG FILES</span>
                  <span className="text-[9px] text-gray-400 font-mono">{notificationHistory.length} alerts recorded</span>
                </div>
                {notificationHistory.length > 0 && onClearHistory && (
                  <button
                    type="button"
                    onClick={() => {
                      onClearHistory();
                      if (throwNotification) {
                        throwNotification("Cleared all alert registry history", "info");
                      }
                    }}
                    className="flex items-center gap-1 text-[10px] text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 p-2 py-1 rounded-xl cursor-pointer transition-all border border-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COMPONENT: PROFILE CUSTOMIZER */}
        <div className="md:col-span-7">
          <form onSubmit={handleSaveProfile} className="p-6 student-card space-y-6">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold student-text-title">Academic Profile Identity</h3>
                <p className="text-[10px] student-text-muted">Updates the digital twin & advisor memory algorithms</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-400 font-mono block mb-1">STUDENT NAME</label>
                <input 
                  type="text" 
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="e.g. Alex Mercer"
                  className="w-full student-input px-3.5 py-2.5 text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-mono block mb-1">COLLEGE / INSTITUTION</label>
                <input 
                  type="text" 
                  value={profileForm.college}
                  onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })}
                  placeholder="e.g. Stanford University"
                  className="w-full student-input px-3.5 py-2.5 text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-mono block mb-1">MAJOR FIELD</label>
                <input 
                  type="text" 
                  value={profileForm.major}
                  onChange={(e) => setProfileForm({ ...profileForm, major: e.target.value })}
                  placeholder="e.g. Computer Science"
                  className="w-full student-input px-3.5 py-2.5 text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-mono block mb-1">CURRENT SEMESTER</label>
                <select 
                  value={profileForm.semester}
                  onChange={(e) => setProfileForm({ ...profileForm, semester: e.target.value })}
                  className="w-full student-input px-3.5 py-2.5 text-xs focus:outline-none"
                >
                  <option className="bg-[#1e1e2f]" value="1st Semester">1st Semester</option>
                  <option className="bg-[#1e1e2f]" value="2nd Semester">2nd Semester</option>
                  <option className="bg-[#1e1e2f]" value="3rd Semester">3rd Semester</option>
                  <option className="bg-[#1e1e2f]" value="4th Semester">4th Semester</option>
                  <option className="bg-[#1e1e2f]" value="5th Semester">5th Semester</option>
                  <option className="bg-[#1e1e2f]" value="6th Semester">6th Semester</option>
                  <option className="bg-[#1e1e2f]" value="7th Semester">7th Semester</option>
                  <option className="bg-[#1e1e2f]" value="8th Semester">8th Semester</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-mono block mb-1">CURRENT GPA</label>
                <input 
                  type="text" 
                  value={profileForm.gpa}
                  onChange={(e) => setProfileForm({ ...profileForm, gpa: e.target.value })}
                  placeholder="e.g. 3.85"
                  className="w-full student-input px-3.5 py-2.5 text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-mono block mb-1">SKILLS / TAGS (COMMA SEPARATED)</label>
                <input 
                  type="text" 
                  value={profileForm.skills}
                  onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                  placeholder="e.g. React, Python, Cloud Computing"
                  className="w-full student-input px-3.5 py-2.5 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                type="submit"
                className="student-btn px-5 py-2.5 text-xs font-bold cursor-pointer hover:shadow-indigo-500/10 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save and Update Profile</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
