import React, { useState } from "react";
import { 
  Plus, Trash2, Calendar, ClipboardList, Columns, 
  Layers, CheckCircle, BookOpen, Clock, ChevronUp, Search 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task, Subject } from "../types";

interface TaskAcademicProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, "id">) => void;
  onUpdateTaskStatus: (id: string, status: Task["status"]) => void;
  onDeleteTask: (id: string) => void;
  subjects: Subject[];
  onAddSubject: (subject: Omit<Subject, "id">) => void;
  onUpdateAttendance: (id: string, change: number) => void;
  onUpdateSubject: (subject: Subject) => void;
  onDeleteSubject?: (id: string) => void;
  throwNotification?: (text: string, type?: "success" | "info" | "warning") => void;
}

export default function TaskAcademic({ 
  tasks, onAddTask, onUpdateTaskStatus, onDeleteTask, 
  subjects, onAddSubject, onUpdateAttendance, onUpdateSubject,
  onDeleteSubject, throwNotification
}: TaskAcademicProps) {
  
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [filterCat, setFilterCat] = useState<string>("All");
  const [taskSearchQuery, setTaskSearchQuery] = useState<string>("");

  // Add Task Modal local fields
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCat, setTaskCat] = useState("Academics");
  const [taskPriority, setTaskPriority] = useState<"High" | "Medium" | "Low">("High");
  const [taskDeadline, setTaskDeadline] = useState("2026-06-15");
  const [taskSubId, setTaskSubId] = useState("");

  // States for chapters and simulated files uploads per subject
  const [newChapterText, setNewChapterText] = useState<{ [subjectId: string]: string }>({});
  const [newFileName, setNewFileName] = useState<{ [subjectId: string]: string }>({});

  // Add Subject local fields
  const [subName, setSubName] = useState("");
  const [subCode, setSubCode] = useState("");
  const [subCodeNum, setSubCodeNum] = useState(85);

  // Inline Add Subject fields inside daily attendance block
  const [showAddClassInline, setShowAddClassInline] = useState(false);
  const [inlineSubName, setInlineSubName] = useState("");
  const [inlineSubCode, setInlineSubCode] = useState("");
  const [inlineMinAttend, setInlineMinAttend] = useState(85);

  const handleCreateSubjectInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineSubName.trim() || !inlineSubCode.trim()) {
      if (throwNotification) {
        throwNotification("Please fill in both the Class Name and Course Code!", "warning");
      }
      return;
    }
    const safeCode = inlineSubCode.trim().toUpperCase();
    onAddSubject({
      name: inlineSubName.trim(),
      code: safeCode,
      attendance: 80,
      targetAttendance: inlineMinAttend,
      score: 90,
      studyHours: 4,
      chapters: [],
      files: []
    });
    setInlineSubName("");
    setInlineSubCode("");
    setShowAddClassInline(false);
    if (throwNotification) {
      throwNotification(`Successfully created and registered dynamic course: ${safeCode}!`, "success");
    }
  };

  // Subject Edit modal/inline state
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubName, setEditSubName] = useState("");
  const [editSubCode, setEditSubCode] = useState("");
  const [editSubAttendance, setEditSubAttendance] = useState(80);
  const [editSubTarget, setEditSubTarget] = useState(85);
  const [editSubScore, setEditSubScore] = useState(90);
  const [editSubHours, setEditSubHours] = useState(5);

  const startEditingSubject = (sub: Subject) => {
    setEditingSubId(sub.id);
    setEditSubName(sub.name);
    setEditSubCode(sub.code);
    setEditSubAttendance(sub.attendance);
    setEditSubTarget(sub.targetAttendance);
    setEditSubScore(sub.score || 90);
    setEditSubHours(sub.studyHours || 5);
  };

  const handleSaveSubjectEdit = () => {
    if (!editingSubId) return;
    const originalSub = subjects.find(s => s.id === editingSubId);
    if (!originalSub) return;
    
    onUpdateSubject({
      ...originalSub,
      name: editSubName,
      code: editSubCode,
      attendance: editSubAttendance,
      targetAttendance: editSubTarget,
      score: editSubScore,
      studyHours: editSubHours
    });
    setEditingSubId(null);
    if (throwNotification) {
      throwNotification("Subject track metrics successfully saved & synchronized!", "success");
    }
  };

  // Daily attendance fields
  const [logDate, setLogDate] = useState("2026-06-11");
  const [selectedSubId, setSelectedSubId] = useState("");
  const [logStatus, setLogStatus] = useState<"Presented" | "Absent">("Presented");
  const [attendanceLogs, setAttendanceLogs] = useState<Array<{ id: string, date: string, subjectId: string, status: "Presented" | "Absent" }>>([
    { id: "log-1", date: "2026-06-10", subjectId: "sub-1", status: "Presented" },
    { id: "log-2", date: "2026-06-09", subjectId: "sub-2", status: "Presented" }
  ]);

  const handleLogTodayAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubId) {
      if (throwNotification) {
        throwNotification("Please select an active subject course to log class roll!", "warning");
      } else {
        alert("Please select an active subject to log class roll!");
      }
      return;
    }
    const newLog = {
      id: `log-${Date.now()}`,
      date: logDate,
      subjectId: selectedSubId,
      status: logStatus
    };
    setAttendanceLogs([newLog, ...attendanceLogs]);
    
    // Recalculate attendance
    onUpdateAttendance(selectedSubId, logStatus === "Presented" ? 3 : -4);
    
    const msg = `Roll logged successfully! Course attendance index adjusted: ${logStatus === "Presented" ? "+3%" : "-4%"}`;
    if (throwNotification) {
      throwNotification(msg, "success");
    } else {
      alert(msg);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    onAddTask({
      title: taskTitle,
      category: taskCat,
      priority: taskPriority,
      deadline: taskDeadline,
      status: "Todo",
      subjectId: taskSubId || undefined
    });
    setTaskTitle("");
    setTaskSubId("");
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !subCode.trim()) return;
    onAddSubject({
      name: subName,
      code: subCode,
      attendance: 80,
      targetAttendance: subCodeNum,
      score: 90,
      studyHours: 4,
      chapters: [],
      files: []
    });
    setSubName("");
    setSubCode("");
  };

  const categories = ["All", "Academics", "Projects", "Internships", "Hackathons"];
  const categoryFiltered = filterCat === "All" ? tasks : tasks.filter(t => t.category === filterCat);
  const filteredTasks = categoryFiltered.filter(t => {
    const q = taskSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      (t.category && t.category.toLowerCase().includes(q)) ||
      (t.priority && t.priority.toLowerCase().includes(q))
    );
  });

  // Status mapping for kanban lanes
  const lanes: Task["status"][] = ["Todo", "In Progress", "Done"];

  return (
    <div className="space-y-8">
      
      {/* SECTION 1: TASK MANAGEMENT OS */}
      <div className="p-6 student-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold student-text-title tracking-tight">OS Task Hub & Kanban</h2>
            <p className="text-xs student-text-muted mt-0.5">Control priority milestones offline or with cloud integration</p>
          </div>

          {/* Toggle Views & Filters Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-black/25 p-1 rounded-xl border border-white/5 flex gap-1">
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg flex items-center gap-1.5 text-xs transition-all cursor-pointer ${viewMode === "list" ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" : "text-gray-400 hover:text-white"}`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button 
                onClick={() => setViewMode("kanban")}
                className={`p-2 rounded-lg flex items-center gap-1.5 text-xs transition-all cursor-pointer ${viewMode === "kanban" ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" : "text-gray-400 hover:text-white"}`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Kanban View</span>
              </button>
            </div>

            {/* Task Search Bar */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={taskSearchQuery}
                onChange={(e) => setTaskSearchQuery(e.target.value)}
                className="bg-black/25 text-xs text-gray-200 border border-white/10 pl-9 pr-8 py-2 rounded-xl focus:outline-none focus:border-indigo-500/50 w-full sm:w-48 transition-all"
              />
              {taskSearchQuery && (
                <button 
                  type="button" 
                  onClick={() => setTaskSearchQuery("")} 
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-405 hover:text-white text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            <select 
              value={filterCat} 
              onChange={(e) => setFilterCat(e.target.value)}
              className="bg-black/25 text-xs text-gray-200 border border-white/10 px-3 py-2 rounded-xl focus:outline-none"
            >
              {categories.map(c => (
                <option key={c} value={c} className="bg-[#1e1e2f]">{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Task Entry Form */}
        <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-12 gap-4 student-card-inner p-4 mb-6">
          <div className="md:col-span-3">
            <label className="text-[10px] text-gray-400 font-mono block mb-1">TASK TITLE</label>
            <input 
              type="text" 
              placeholder="e.g. outline Cloud computations..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full student-input px-3 py-2 text-xs focus:outline-none transition-all"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] text-gray-400 font-mono block mb-1">CATEGORY</label>
            <select 
              value={taskCat} 
              onChange={(e) => setTaskCat(e.target.value)}
              className="w-full student-input px-3 py-2 text-xs focus:outline-none"
            >
              <option className="bg-[#1e1e2f]" value="Academics">Academics</option>
              <option className="bg-[#1e1e2f]" value="Projects">Projects</option>
              <option className="bg-[#1e1e2f]" value="Internships">Internships</option>
              <option className="bg-[#1e1e2f]" value="Hackathons">Hackathons</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] text-gray-400 font-mono block mb-1">ASSOCIATED SUBJECT</label>
            <select 
              value={taskSubId} 
              onChange={(e) => setTaskSubId(e.target.value)}
              className="w-full student-input px-3 py-2 text-xs focus:outline-none"
            >
              <option className="bg-[#1e1e2f]" value="">-- None --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id} className="bg-[#1e1e2f]">{s.name} ({s.code})</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3 flex gap-2">
            <div className="w-1/2">
              <label className="text-[10px] text-gray-400 font-mono block mb-1">PRIORITY</label>
              <select 
                value={taskPriority} 
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="w-full student-input px-3 py-2 text-xs focus:outline-none"
              >
                <option className="bg-[#1e1e2f]" value="High">High</option>
                <option className="bg-[#1e1e2f]" value="Medium">Medium</option>
                <option className="bg-[#1e1e2f]" value="Low">Low</option>
              </select>
            </div>
            <div className="w-1/2">
              <label className="text-[10px] text-gray-400 font-mono block mb-1">DUE DATE</label>
              <input 
                type="date"
                value={taskDeadline}
                onChange={(e) => setTaskDeadline(e.target.value)}
                className="w-full student-input px-3 py-2 text-xs focus:outline-none"
              />
            </div>
          </div>
          <div className="md:col-span-2 flex items-end">
            <button 
              type="submit"
              className="w-full py-2 student-btn text-xs font-semibold flex items-center justify-center gap-1 transition-all shadow-lg cursor-pointer h-[38px]"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        </form>

        {/* Dynamic Views Rendering */}
        <AnimatePresence mode="wait">
          {viewMode === "list" ? (
            <motion.div 
              key="list-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2.5"
            >
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 student-text-muted text-xs">No active tasks recorded under {filterCat}. Enjoy some coffee!</div>
              ) : (
                filteredTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between student-card-inner p-4 hover:shadow transition-all">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox"
                        checked={task.status === "Done"}
                        onChange={() => onUpdateTaskStatus(task.id, task.status === "Done" ? "Todo" : "Done")}
                        className="w-4 h-4 rounded border-gray-600 text-indigo-500 focus:ring-0 cursor-pointer bg-black/20"
                      />
                      <div>
                        <span className={`text-sm font-semibold leading-relaxed tracking-wide ${task.status === "Done" ? "text-gray-500 line-through font-normal" : "student-text-title"}`}>
                          {task.title}
                        </span>
                        <div className="flex gap-2 items-center flex-wrap text-[10px] student-text-muted font-mono mt-0.5">
                          <span className="bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 text-indigo-400">{task.category}</span>
                          {task.subjectId && (
                            <>
                              <span>|</span>
                              <span className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/10 text-cyan-400 font-bold">
                                📚 {subjects.find(s => s.id === task.subjectId)?.code || "Course"}
                              </span>
                            </>
                          )}
                          <span>|</span>
                          <span className={`capitalize font-semibold ${task.priority === "High" ? "text-rose-400" : task.priority === "Medium" ? "text-amber-400" : "text-gray-450"}`}>
                            {task.priority} Priority
                          </span>
                          <span>|</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {task.deadline}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select 
                        value={task.status}
                        onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as any)}
                        className="bg-black/30 border border-white/10 text-[10px] text-gray-300 font-mono px-2 py-1.5 rounded-xl outline-none"
                      >
                        <option className="bg-[#1e1e2f]" value="Todo">Todo</option>
                        <option className="bg-[#1e1e2f]" value="In Progress">In Progress</option>
                        <option className="bg-[#1e1e2f]" value="Done">Done</option>
                      </select>
                      <button 
                        onClick={() => onDeleteTask(task.id)}
                        className="p-2 hover:bg-rose-500/10 hover:text-rose-400 text-gray-400 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="kanban-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {lanes.map(lane => {
                const laneTasks = filteredTasks.filter(t => t.status === lane);
                return (
                  <div key={lane} className="student-card-inner p-4 flex flex-col min-h-[300px]">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-gray-300 font-mono">{lane.toUpperCase()}</span>
                      <span className="text-xs bg-white/5 py-0.5 px-2 rounded-lg text-gray-400 font-mono font-semibold">{laneTasks.length}</span>
                    </div>

                    <div className="space-y-2.5 flex-1 overflow-y-auto">
                      {laneTasks.map(task => (
                        <div key={task.id} className="bg-white/[0.03] border border-white/5 hover:border-indigo-500/20 p-3.5 rounded-xl transition-all space-y-2 group">
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-xs font-semibold text-white leading-normal group-hover:text-indigo-300 transition-colors">
                              {task.title}
                            </span>
                            <button 
                              onClick={() => onDeleteTask(task.id)}
                              className="text-gray-500 hover:text-rose-400 p-0.5 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5 text-[9px] font-mono">
                            <span className="bg-indigo-500/15 text-indigo-400 py-0.5 px-1.5 rounded">{task.category}</span>
                            {task.subjectId && (
                              <span className="bg-cyan-500/15 text-cyan-400 py-0.5 px-1.5 rounded font-extrabold">
                                📚 {subjects.find(s => s.id === task.subjectId)?.code || "Course"}
                              </span>
                            )}
                            <span className={`py-0.5 px-1.5 rounded font-semibold ${task.priority === "High" ? "bg-rose-500/10 text-rose-400" : "bg-gray-500/10 text-gray-305"}`}>
                              {task.priority}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[9px] text-gray-500 border-t border-white/5 pt-2 mt-1">
                            <span>Due: {task.deadline}</span>
                            <div className="flex gap-1 font-sans">
                              {lane !== "Todo" && (
                                <button 
                                  onClick={() => onUpdateTaskStatus(task.id, lane === "Done" ? "In Progress" : "Todo")}
                                  className="text-indigo-400 font-semibold cursor-pointer"
                                >
                                  ← Back
                                </button>
                              )}
                              {lane !== "Done" && (
                                <button 
                                  onClick={() => onUpdateTaskStatus(task.id, lane === "Todo" ? "In Progress" : "Done")}
                                  className="text-emerald-400 font-semibold cursor-pointer"
                                >
                                  Move →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 2: ACADEMICS MANAGER */}
      <div className="p-6 student-card">
        <h2 className="text-xl font-bold student-text-title tracking-tight mb-4">Course Track Attendance & Prep</h2>
        
        {/* Core metrics tracker subjects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map(sub => {
            const compliant = sub.attendance >= sub.targetAttendance;
            const isEditing = editingSubId === sub.id;

            if (isEditing) {
              return (
                <div key={sub.id} className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-4 text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[10px] uppercase font-mono text-indigo-400 font-bold">Edit Course Metrics</span>
                    <span className="text-[9px] font-mono text-gray-500">{sub.code}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="col-span-2">
                      <label className="text-[9px] text-gray-400 font-mono tracking-wider uppercase block mb-1">Subject Name</label>
                      <input 
                        type="text" 
                        value={editSubName}
                        onChange={(e) => setEditSubName(e.target.value)}
                        className="w-full bg-black/25 text-white border border-white/10 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-indigo-500 font-sans"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-400 font-mono tracking-wider uppercase block mb-1">Course Code</label>
                      <input 
                        type="text" 
                        value={editSubCode}
                        onChange={(e) => setEditSubCode(e.target.value)}
                        className="w-full bg-black/25 text-white border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-400 font-mono tracking-wider uppercase block mb-1">Prep Score target / actual</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100"
                        value={editSubScore}
                        onChange={(e) => setEditSubScore(Number(e.target.value))}
                        className="w-full bg-black/25 text-white border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-400 font-mono tracking-wider uppercase block mb-1">Current Attendance (%)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100"
                        value={editSubAttendance}
                        onChange={(e) => setEditSubAttendance(Number(e.target.value))}
                        className="w-full bg-black/25 text-white border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-400 font-mono tracking-wider uppercase block mb-1">Target Attendance (%)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100"
                        value={editSubTarget}
                        onChange={(e) => setEditSubTarget(Number(e.target.value))}
                        className="w-full bg-black/25 text-white border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[9px] text-gray-400 font-mono tracking-wider uppercase block mb-1">Weekly Study Hours Allowed</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="50"
                        value={editSubHours}
                        onChange={(e) => setEditSubHours(Number(e.target.value))}
                        className="w-full bg-black/25 text-white border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 gap-2">
                    {onDeleteSubject && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to completely remove "${sub.name}" (${sub.code}) and all its associated metrics?`)) {
                            onDeleteSubject(sub.id);
                            setEditingSubId(null);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/10 hover:border-rose-500/20 text-[11px] cursor-pointer font-medium flex items-center gap-1 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove Course Track
                      </button>
                    )}
                    <div className="flex gap-2 ml-auto">
                      <button 
                        type="button"
                        onClick={() => setEditingSubId(null)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white text-[11px] cursor-pointer font-medium"
                      >
                        Cancel
                      </button>
                      <button 
                        type="button"
                        onClick={handleSaveSubjectEdit}
                        className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 text-[11px] cursor-pointer"
                      >
                        Save Setup
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={sub.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-0.5">{sub.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-gray-500 tracking-wider bg-white/5 py-0.5 px-2 rounded-lg">{sub.code}</span>
                      <button 
                        onClick={() => startEditingSubject(sub)}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono hover:underline cursor-pointer select-none"
                      >
                        [Edit Course Setup]
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold font-mono ${compliant ? "text-emerald-400" : "text-amber-400"}`}>
                      {sub.attendance}%
                    </span>
                    <span className="block text-[9px] text-gray-500 uppercase font-mono mt-0.5">TARGET: {sub.targetAttendance}%</span>
                  </div>
                </div>

                {/* Progress bar tracking attendance complies */}
                <div className="w-full bg-black/30 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${compliant ? "bg-emerald-500" : "bg-amber-500"}`} 
                    style={{ width: `${sub.attendance}%` }}
                  />
                </div>

                <div className="flex flex-wrap justify-between items-center pt-2 gap-2">
                  <div className="flex gap-1.5 items-center text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Study allocated: <strong className="text-white font-mono">{sub.studyHours}h</strong>/wk</span>
                  </div>
                  
                  {/* Attendance modifier controls */}
                  <div className="flex gap-1">
                    <button 
                      onClick={() => onUpdateAttendance(sub.id, -5)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-[#ff0505]/10 hover:bg-[#ff0000]/20 border border-red-500/10 font-mono text-rose-400 rounded-lg select-none"
                    >
                      Missed Class (-5%)
                    </button>
                    <button 
                      onClick={() => onUpdateAttendance(sub.id, 5)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/10 font-mono text-emerald-400 rounded-lg select-none"
                    >
                      Attended Call (+5%)
                    </button>
                  </div>
                </div>

                {/* Chapters Management Subsection */}
                <div className="pt-2.5 border-t border-white/5 space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-mono text-indigo-300 font-bold block">📖 Syllabus Chapters ({sub.chapters?.length || 0})</span>
                  </div>

                  {sub.chapters && sub.chapters.length > 0 ? (
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {sub.chapters.map((ch, index) => (
                        <div key={index} className="flex items-center gap-1 bg-white/5 border border-white/5 text-[9px] text-gray-300 py-0.5 px-2 rounded">
                          <span className="truncate max-w-[120px]">{ch}</span>
                          <button
                            type="button"
                            title="Remove Chapter"
                            onClick={() => {
                              const updatedChapters = sub.chapters?.filter((_, i) => i !== index) || [];
                              onUpdateSubject({ ...sub, chapters: updatedChapters });
                            }}
                            className="text-gray-500 hover:text-rose-400 font-bold ml-1 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9px] text-gray-500 italic font-sans">No linked course syllabus chapters. Add one beneath!</p>
                  )}

                  <div className="flex gap-1">
                    <input 
                      type="text"
                      placeholder="Add Chapter (e.g. Chapter 1: Paxos)"
                      value={newChapterText[sub.id] || ""}
                      onChange={(e) => setNewChapterText({ ...newChapterText, [sub.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = newChapterText[sub.id]?.trim();
                          if (val) {
                            const updatedChapters = [...(sub.chapters || []), val];
                            onUpdateSubject({ ...sub, chapters: updatedChapters });
                            setNewChapterText({ ...newChapterText, [sub.id]: "" });
                          }
                        }
                      }}
                      className="flex-1 bg-black/40 border border-white/10 px-2 py-1 text-[10px] rounded-lg text-white placeholder-gray-600 focus:outline-[#6366f1]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newChapterText[sub.id]?.trim();
                        if (val) {
                          const updatedChapters = [...(sub.chapters || []), val];
                          onUpdateSubject({ ...sub, chapters: updatedChapters });
                          setNewChapterText({ ...newChapterText, [sub.id]: "" });
                        }
                      }}
                      className="px-2 py-1 bg-indigo-600 text-white font-bold rounded-lg text-[10px]"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Course Upload Materials Subsection */}
                <div className="pt-2.5 border-t border-white/5 space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-mono text-cyan-300 font-bold block">📁 Uploaded Files ({sub.files?.length || 0})</span>
                  </div>

                  {sub.files && sub.files.length > 0 ? (
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {sub.files.map((file, index) => (
                        <div key={index} className="flex justify-between items-center bg-black/35 border border-white/5 p-1 px-1.5 rounded text-[9px] w-full">
                          <span className="text-gray-300 truncate pr-2" title={file.name}>📄 {file.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[8px] text-gray-500 font-mono">{file.date}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedFiles = sub.files?.filter((_, i) => i !== index) || [];
                                onUpdateSubject({ ...sub, files: updatedFiles });
                              }}
                              className="text-gray-500 hover:text-rose-400 font-bold text-xs"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9px] text-gray-500 italic font-sans">No files linked for this course.</p>
                  )}

                  <div className="flex gap-1">
                    <input 
                      type="text"
                      placeholder="Upload File (e.g. syllabus_v1.pdf)"
                      value={newFileName[sub.id] || ""}
                      onChange={(e) => setNewFileName({ ...newFileName, [sub.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = newFileName[sub.id]?.trim();
                          if (val) {
                            const updatedFiles = [...(sub.files || []), { name: val, date: new Date().toISOString().substring(0, 10) }];
                            onUpdateSubject({ ...sub, files: updatedFiles });
                            setNewFileName({ ...newFileName, [sub.id]: "" });
                          }
                        }
                      }}
                      className="flex-1 bg-black/40 border border-white/10 px-2 py-1 text-[10px] rounded-lg text-white placeholder-gray-600 focus:outline-[#06b6d4]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newFileName[sub.id]?.trim();
                        if (val) {
                          const updatedFiles = [...(sub.files || []), { name: val, date: new Date().toISOString().substring(0, 10) }];
                          onUpdateSubject({ ...sub, files: updatedFiles });
                          setNewFileName({ ...newFileName, [sub.id]: "" });
                        }
                      }}
                      className="px-2 py-1 bg-cyan-600 text-white font-bold rounded-lg text-[10px]"
                    >
                      Upload
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Subject Section Inline */}
        <hr className="border-t border-white/5 my-6" />
        <h3 className="text-sm font-bold text-gray-300 mb-3 block uppercase font-mono tracking-wide">Incorporate New Subject Semester Registry</h3>
        <form onSubmit={handleCreateSubject} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            type="text" 
            placeholder="Course Name (e.g. Distributed Consensus...)"
            value={subName}
            onChange={(e) => setSubName(e.target.value)}
            className="bg-black/20 text-white border border-white/10 px-3 py-2 rounded-xl text-xs focus:outline-none"
          />
          <input 
            type="text" 
            placeholder="Course Code (e.g. CS-901)"
            value={subCode}
            onChange={(e) => setSubCode(e.target.value)}
            className="bg-black/20 text-white border border-white/10 px-3 py-2 rounded-xl text-xs focus:outline-none"
          />
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-1.5">
              <span className="text-[10px] text-gray-500 font-mono uppercase truncate">Min Attend:</span>
              <input 
                type="number"
                min="50"
                max="100"
                value={subCodeNum}
                onChange={(e) => setSubCodeNum(Number(e.target.value))}
                className="w-14 bg-black/20 text-white font-mono text-xs border border-white/10 px-1 py-2 rounded-lg text-center focus:outline-none"
              />
            </div>
            <button 
              type="submit"
              className="py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow shadow-indigo-500/10 cursor-pointer"
            >
              Add Course <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* SUBSECTION: DAILY ACTION ROLL LOGS */}
        <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider font-mono">Daily Attendance Summary of Class</h3>
              <p className="text-[11px] student-text-muted">Register daily class roll calls to dynamically recalculate attendance indices</p>
            </div>
            
            <div className="flex bg-black/40 border border-white/5 rounded-xl px-3 py-1 items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-mono text-emerald-400">Dynamic Roll Synchronizer</span>
            </div>
          </div>

          {/* Quick inline class/subject adder info bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/[0.01] border border-white/5 p-3.5 rounded-2xl gap-2">
            <div className="text-[11px] text-gray-300">
              <span className="font-extrabold text-indigo-400">Have customized subject courses?</span> Register as many other subjects or classes as you attend and track them dynamically!
            </div>
            <button
              type="button"
              onClick={() => setShowAddClassInline(!showAddClassInline)}
              className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 active:scale-95 text-[11px] font-semibold rounded-xl flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {showAddClassInline ? "Close Creator" : "Add Custom Class"}
            </button>
          </div>

          <AnimatePresence>
            {showAddClassInline && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleCreateSubjectInline}
                className="overflow-hidden p-4 bg-indigo-500/[0.03] border border-indigo-500/15 rounded-2xl space-y-4 text-xs"
              >
                <div className="flex items-center gap-2 pb-1.5 border-b border-indigo-500/10">
                  <span className="p-1 px-2 rounded-lg bg-indigo-500/10 text-indigo-400 font-mono text-[9px] font-bold">CLASS GENERATOR</span>
                  <span className="text-[11px] text-gray-200 font-bold">Register Dynamic Classroom Registry</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-[9px] text-gray-400 font-mono block mb-1">CLASS / COURSE NAME</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Advanced Operating Systems"
                      value={inlineSubName}
                      onChange={(e) => setInlineSubName(e.target.value)}
                      className="w-full bg-[#0a0d14] text-white border border-white/10 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-400 font-mono block mb-1 font-bold">CLASS / COURSE CODE</label>
                    <input 
                      type="text" 
                      placeholder="e.g. CS-452"
                      value={inlineSubCode}
                      onChange={(e) => setInlineSubCode(e.target.value)}
                      className="w-full bg-[#0a0d14] text-white border border-white/10 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-400 font-mono block mb-1">TARGET ATTENDANCE (%)</label>
                    <div className="flex gap-2">
                      <input 
                        type="number"
                        min="50"
                        max="100"
                        value={inlineMinAttend}
                        onChange={(e) => setInlineMinAttend(Number(e.target.value))}
                        className="w-20 bg-[#0a0d14] text-white font-mono border border-white/10 px-3 py-2 rounded-xl text-center focus:outline-none"
                      />
                      <button 
                        type="submit"
                        className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md text-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Save Class
                      </button>
                    </div>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogTodayAttendance} className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 bg-black/15 rounded-2xl border border-white/5 text-xs">
            <div>
              <label className="text-[9px] text-gray-400 font-mono block mb-1">CHOOSE LOG DATE</label>
              <input 
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full student-input p-2 text-xs text-white bg-black/20"
              />
            </div>

            <div>
              <label className="text-[9px] text-gray-400 font-mono block mb-1">SELECT SUBJECT COURSE</label>
              <select
                value={selectedSubId}
                onChange={(e) => setSelectedSubId(e.target.value)}
                className="w-full student-input p-2 text-xs text-white bg-[#0e1117] border border-white/10"
              >
                <option value="">-- Choose active class --</option>
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.id} className="bg-[#1e1e2f] text-white">{sub.name} ({sub.code})</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 items-end">
              <div className="w-1/2">
                <label className="text-[9px] text-gray-400 font-mono block mb-1">LOG STATUS</label>
                <select
                  value={logStatus}
                  onChange={(e) => setLogStatus(e.target.value as any)}
                  className="w-full student-input p-2 text-xs text-white bg-[#0e1117] border border-white/10"
                >
                  <option value="Presented">Attended ✅</option>
                  <option value="Absent">Absent ❌</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-1/2 py-2.5 student-btn font-bold text-xs"
              >
                Register Roll
              </button>
            </div>
          </form>

          {/* Display logs */}
          <div className="space-y-2 mt-3">
            <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase">RECENT LOGGED DAYS REGISTRY</h4>
            <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1.5 scrollbar-none">
              {attendanceLogs.length === 0 ? (
                <p className="text-[11px] student-text-muted italic">No daily roll inputs logged yet. Put your today class log above!</p>
              ) : (
                attendanceLogs.map(log => {
                  const matchingSub = subjects.find(s => s.id === log.subjectId);
                  return (
                    <div key={log.id} className="p-3 rounded-xl bg-white/[0.01] border border-white/5 flex justify-between items-center text-xs animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-gray-500">{log.date}</span>
                        <span className="text-gray-400 font-bold">|</span>
                        <span className="text-white font-semibold">{matchingSub ? matchingSub.name : "Advanced Engineering Core"}</span>
                        <span className="font-mono text-[10px] bg-white/5 px-1.5 rounded text-gray-400">{matchingSub ? matchingSub.code : "GEN-99"}</span>
                      </div>
                      
                      <span className={`font-bold font-mono px-2.5 py-0.5 rounded ${log.status === "Presented" ? "bg-emerald-500/10 text-emerald-400 font-semibold" : "bg-rose-500/10 text-rose-400"}`}>
                        {log.status === "Presented" ? "Attended" : "Absent"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
