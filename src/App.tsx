import React, { useState, useEffect } from "react";
import { 
  GraduationCap, LayoutDashboard, CheckSquare, Trophy, 
  Sparkles, FolderHeart, BookLock, UserCog, Sun, Moon, Cpu, Info,
  Smartphone, Laptop, Users, Star, MessageSquare, Bell
} from "lucide-react";
import { StudentOSData, Task, Subject, DocumentFile, DiaryEntry, Hackathon, Internship } from "./types";
import { motion, AnimatePresence } from "motion/react";

// Import custom sections
import Dashboard from "./components/Dashboard";
import TaskAcademic from "./components/TaskAcademic";
import HackathonInternship from "./components/HackathonInternship";
import Vault from "./components/Vault";
import AIDiaryMemory from "./components/AIDiaryMemory";
import CareerTwin from "./components/CareerTwin";
import AIChatbot from "./components/AIChatbot";
import ExamPrep from "./components/ExamPrep";
import LoginScreen from "./components/LoginScreen";
import SettingsScreen from "./components/SettingsScreen";
import NotificationCenter, { NotificationLogItem } from "./components/NotificationCenter";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./lib/firebase";
import { doc, getDoc, setDoc, collection, onSnapshot, deleteDoc } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "./lib/firestore-error";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isMobileEmulator, setIsMobileEmulator] = useState<boolean>(true);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);

  // System notification queue
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; type: "success" | "info" | "warning" }>>([]);
  
  // Notification history and settings state
  const [showNotificationCenter, setShowNotificationCenter] = useState<boolean>(false);
  const [notificationMute, setNotificationMute] = useState<boolean>(() => {
    return localStorage.getItem("studentos_notifications_mute") === "true";
  });
  const [notificationDuration, setNotificationDuration] = useState<number>(() => {
    const raw = localStorage.getItem("studentos_notifications_duration");
    return raw !== null ? Number(raw) : 5000;
  });
  const [notificationHistory, setNotificationHistory] = useState<NotificationLogItem[]>(() => {
    try {
      const stored = localStorage.getItem("studentos_notification_history");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Keep history synced in localStorage
  useEffect(() => {
    localStorage.setItem("studentos_notification_history", JSON.stringify(notificationHistory));
  }, [notificationHistory]);

  useEffect(() => {
    localStorage.setItem("studentos_notifications_mute", String(notificationMute));
  }, [notificationMute]);

  useEffect(() => {
    localStorage.setItem("studentos_notifications_duration", String(notificationDuration));
  }, [notificationDuration]);

  // Dynamic sound synthesizer for pleasant app alarms
  const playNotificationSound = (type: "success" | "info" | "warning", isMuted: boolean) => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (type === "success") {
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        gain1.gain.setValueAtTime(0.06, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.15);
        
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
          gain2.gain.setValueAtTime(0.06, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.25);
        }, 80);
      } else if (type === "warning") {
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.frequency.setValueAtTime(293.66, ctx.currentTime); // D4
        gain1.gain.setValueAtTime(0.1, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.35);
      } else {
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.frequency.setValueAtTime(440.00, ctx.currentTime); // A4
        gain1.gain.setValueAtTime(0.06, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.25);
      }
    } catch (err) {
      console.warn("Audio Context blocked or failed to initialize", err);
    }
  };

  const throwNotification = async (text: string, type: "success" | "info" | "warning" = "success") => {
    const id = `notif-${Date.now()}`;
    
    // Play sound and raise local temporary banner toast immediately
    playNotificationSound(type, notificationMute);
    setNotifications(prev => [...prev, { id, text, type }]);
    if (notificationDuration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, notificationDuration);
    }

    if (auth.currentUser) {
      try {
        const ref = doc(db, "users", auth.currentUser.uid, "notifications", id);
        await setDoc(ref, {
          id,
          title: "System Alert",
          message: text,
          type,
          timestamp: new Date().toISOString(),
          read: false,
          category: "system"
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}/notifications/${id}`);
      }
    } else {
      // Offline/local fallback: append to list state manually
      setNotificationHistory(prev => [
        { id, text, type, timestamp: new Date().toISOString(), read: false },
        ...prev
      ].slice(0, 50));
    }
  };

  const handleMarkRead = async (id: string) => {
    if (!auth.currentUser) {
      setNotificationHistory(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      return;
    }
    try {
      const ref = doc(db, "users", auth.currentUser.uid, "notifications", id);
      await setDoc(ref, { read: true }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}/notifications/${id}`);
    }
  };

  const handleMarkAllRead = async () => {
    if (!auth.currentUser) {
      setNotificationHistory(prev => prev.map(n => ({ ...n, read: true })));
      throwNotification("All notifications marked as read", "info");
      return;
    }
    try {
      for (const notif of notificationHistory) {
        if (!notif.read) {
          const ref = doc(db, "users", auth.currentUser.uid, "notifications", notif.id);
          await setDoc(ref, { read: true }, { merge: true });
        }
      }
      throwNotification("All notifications marked as read", "info");
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!auth.currentUser) {
      setNotificationHistory(prev => prev.filter(n => n.id !== id));
      return;
    }
    try {
      const ref = doc(db, "users", auth.currentUser.uid, "notifications", id);
      await deleteDoc(ref);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${auth.currentUser.uid}/notifications/${id}`);
    }
  };

  const handleClearHistory = async () => {
    if (!auth.currentUser) {
      setNotificationHistory([]);
      return;
    }
    try {
      for (const notif of notificationHistory) {
        const ref = doc(db, "users", auth.currentUser.uid, "notifications", notif.id);
        await deleteDoc(ref);
      }
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  const handleTriggerMockNotif = async (text: string, type: "success" | "info" | "warning") => {
    const id = `mock-${Date.now()}`;
    if (!auth.currentUser) {
      throwNotification(text, type);
      return;
    }
    try {
      const ref = doc(db, "users", auth.currentUser.uid, "notifications", id);
      await setDoc(ref, {
        id,
        title: "Simulation Lab Alert",
        message: text,
        type,
        timestamp: new Date().toISOString(),
        read: false,
        category: "custom"
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}/notifications/${id}`);
    }
  };



  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Track authenticated student profile using real Firebase Authentication & Firestore
  const [userLogin, setUserLogin] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [activeTheme, setActiveTheme] = useState<"astral" | "neon" | "emerald" | "frost" | "coal font">(() => {
    const saved = localStorage.getItem("studentos_theme") || "astral";
    return saved.replace("theme-", "") as any;
  });
  const [appData, setAppData] = useState<StudentOSData | null>(null);
  const [synced, setSynced] = useState(true);
  const [hasLoadedFromFirestore, setHasLoadedFromFirestore] = useState(false);

  // Clean raw theme value from wrapper tags
  const cleanTheme = String(activeTheme).replace("theme-", "").split(" ")[0] as any;

  useEffect(() => {
    localStorage.setItem("studentos_theme", cleanTheme);
    const root = document.documentElement;
    root.className = ""; // reset root class
    root.classList.add(`theme-${cleanTheme}`);
    
    // Support force-light or force-dark modes independent of theme
    const storedContrast = localStorage.getItem("studentos_contrast_mode") || "auto";
    if (storedContrast === "light") {
      root.classList.add("force-light");
    } else if (storedContrast === "dark") {
      root.classList.add("force-dark");
    }
  }, [cleanTheme]);

  // Load app data from local Express backend JSON datastore
  const loadAppData = async () => {
    try {
      const res = await fetch("/api/student/data");
      const json = await res.json();
      setAppData(json);
    } catch (e) {
      console.error("Local fullstack database load failed, starting offline state.", e);
    }
  };

  useEffect(() => {
    loadAppData();
  }, []);

  // Real-time Firestore notification subscription listener
  useEffect(() => {
    if (!auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}/notifications`;
    const notifCollectionRef = collection(db, "users", auth.currentUser.uid, "notifications");
    
    const unsubscribe = onSnapshot(notifCollectionRef, (snapshot) => {
      const fetchedNotifications: NotificationLogItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetchedNotifications.push({
          id: docSnap.id,
          text: data.message || "",
          type: data.type || "info",
          timestamp: data.timestamp || new Date().toISOString(),
          read: data.read || false
        });
      });
      
      fetchedNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setNotificationHistory(prev => {
        const prevIds = new Set(prev.map(p => p.id));
        fetchedNotifications.forEach(notif => {
          if (!prevIds.has(notif.id) && !notif.read) {
            playNotificationSound(notif.type, notificationMute);
            const toastId = `toast-${notif.id}-${Date.now()}`;
            setNotifications(active => [...active, { id: toastId, text: notif.text, type: notif.type }]);
            if (notificationDuration > 0) {
              setTimeout(() => {
                setNotifications(active => active.filter(n => n.id !== toastId));
              }, notificationDuration);
            }
          }
        });
        return fetchedNotifications;
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    
    return () => unsubscribe();
  }, [auth.currentUser, notificationMute, notificationDuration]);

  // Automated deadline, exams, and internship alerts scanner
  useEffect(() => {
    if (!auth.currentUser || !appData || !hasLoadedFromFirestore) return;

    const scanAndProcessAlerts = async () => {
      const uid = auth.currentUser!.uid;
      const today = new Date();
      const threeDaysLater = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
      const sevenDaysLater = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));

      // 1. Scan Tasks for upcoming deadlines (due in <= 3 days, not Done)
      const tasksToAlert = appData.tasks.filter(t => {
        if (t.status === "Done") return false;
        if (!t.deadline) return false;
        const dl = new Date(t.deadline);
        return dl >= today && dl <= threeDaysLater;
      });

      for (const t of tasksToAlert) {
        const notifId = `deadline-${t.id}`;
        if (!notificationHistory.some(h => h.id === notifId)) {
          const ref = doc(db, "users", uid, "notifications", notifId);
          await setDoc(ref, {
            id: notifId,
            title: "Task Deadline Alert",
            message: `⚠️ Upcoming task deadline: "${t.title}" is due on ${t.deadline}!`,
            type: "warning",
            timestamp: new Date().toISOString(),
            read: false,
            category: "deadline"
          });
        }
      }

      // 2. Scan Subjects for upcoming Exam Dates (due in <= 7 days)
      const subjectsToAlert = appData.subjects.filter(sub => {
        if (!sub.examDate) return false;
        const examD = new Date(sub.examDate);
        return examD >= today && examD <= sevenDaysLater;
      });

      for (const sub of subjectsToAlert) {
        const notifId = `exam-${sub.id}`;
        if (!notificationHistory.some(h => h.id === notifId)) {
          const ref = doc(db, "users", uid, "notifications", notifId);
          await setDoc(ref, {
            id: notifId,
            title: "Upcoming Exam Warning",
            message: `🎓 Exam Alert: Upcoming ${sub.code} (${sub.name}) exam is scheduled on ${sub.examDate}! Target: ${sub.score || 90}/100.`,
            type: "info",
            timestamp: new Date().toISOString(),
            read: false,
            category: "exam"
          });
        }
      }

      // 3. Scan Internships for interview dates (<= 3 days) or status notifications
      for (const intern of appData.internships) {
        if (intern.status === "Interviewing" && intern.interviewDate) {
          const interviewD = new Date(intern.interviewDate);
          if (interviewD >= today && interviewD <= threeDaysLater) {
            const notifId = `internship-interview-${intern.id}`;
            if (!notificationHistory.some(h => h.id === notifId)) {
              const ref = doc(db, "users", uid, "notifications", notifId);
              await setDoc(ref, {
                id: notifId,
                title: "Internship Interview Schedule",
                message: `💼 Interview: Your slot with ${intern.company} for "${intern.role}" is on ${intern.interviewDate}! Check syllabus prep catalog.`,
                type: "success",
                timestamp: new Date().toISOString(),
                read: false,
                category: "internship"
              });
            }
          }
        }

        const statusNotifId = `internship-status-${intern.id}-${intern.status}`;
        if (!notificationHistory.some(h => h.id === statusNotifId)) {
          const ref = doc(db, "users", uid, "notifications", statusNotifId);
          let text = `💼 Pipeline Info: ${intern.company} application status updated to "${intern.status}" for the "${intern.role}" position.`;
          let type: "success" | "info" | "warning" = "info";
          
          if (intern.status === "Offer") {
            text = `🎉 OFFER ISSUED! Congratulations! ${intern.company} offered you the "${intern.role}" internship placement!`;
            type = "success";
          } else if (intern.status === "Rejected") {
            text = `💼 Pipeline update: ${intern.company} concluded candidates review for "${intern.role}". Refine your projects and re-dispatch!`;
            type = "warning";
          }

          await setDoc(ref, {
            id: statusNotifId,
            title: "Internship Status Update",
            message: text,
            type,
            timestamp: new Date().toISOString(),
            read: false,
            category: "internship"
          });
        }
      }
    };

    scanAndProcessAlerts().catch(err => console.error("Error running push alerts scan:", err));
  }, [appData, hasLoadedFromFirestore, auth.currentUser]);

  // Listen for real Firebase auth session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          let snap;
          try {
            snap = await getDoc(userDocRef);
          } catch (firestoreErr) {
            handleFirestoreError(firestoreErr, OperationType.GET, `users/${firebaseUser.uid}`);
          }
          if (snap && snap.exists()) {
            const userData = snap.data();
            setUserLogin(userData);
          } else {
            const fallbackUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || "Admin Student",
              mobile: "",
              college: "",
              major: "",
              semester: "1st Semester"
            };
            setUserLogin(fallbackUser);
          }
        } catch (err) {
          console.error("Error reading Firestore user profile:", err);
        }
      } else {
        setUserLogin(null);
        setHasLoadedFromFirestore(false);
        loadAppData();
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Merge Firestore data into appData once both become available
  useEffect(() => {
    if (appData && userLogin && !hasLoadedFromFirestore) {
      const updated = {
        ...appData,
        profile: {
          ...appData.profile,
          name: userLogin.name || "",
          college: userLogin.college || "",
          major: userLogin.major || "",
          semester: userLogin.semester || "1st Semester"
        },
        tasks: userLogin.tasks || appData.tasks,
        subjects: userLogin.subjects || appData.subjects,
        documents: userLogin.documents || appData.documents,
        internships: userLogin.internships || appData.internships
      };
      setAppData(updated);
      setHasLoadedFromFirestore(true);
    } else if (appData && !userLogin && hasLoadedFromFirestore) {
      setHasLoadedFromFirestore(false);
    }
  }, [appData, userLogin, hasLoadedFromFirestore]);

  // Sync user tasks, subjects, documents, and internships to their specific Firestore document
  const syncUserDataToFirestore = async (data: StudentOSData) => {
    if (!auth.currentUser) return;
    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userDocRef, {
        tasks: data.tasks || [],
        subjects: data.subjects || [],
        documents: data.documents || [],
        internships: data.internships || []
      }, { merge: true });
    } catch (firestoreErr) {
      handleFirestoreError(firestoreErr, OperationType.WRITE, `users/${auth.currentUser.uid}`);
    }
  };

  // Trigger sync on appData updates
  useEffect(() => {
    if (appData && auth.currentUser && hasLoadedFromFirestore) {
      syncUserDataToFirestore(appData);
    }
  }, [appData, hasLoadedFromFirestore]);

  // Post synchronized updates back to Express backend server
  const syncWithServer = async (updatedData: StudentOSData) => {
    setAppData(updatedData);
    setSynced(false);
    try {
      await fetch("/api/student/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      setSynced(true);
    } catch (e) {
      console.error("Could not sync with local storage Server database.", e);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserLogin(null);
    } catch (err) {
      console.error("Failed to sign out", err);
    }
  };

  if (checkingAuth || !appData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#090D1A] text-white gap-3 select-none">
        <Cpu className="w-8 h-8 text-indigo-400 animate-spin" />
        <span className="font-mono text-xs text-indigo-300">Booting StudentOS AI Core Nodes...</span>
      </div>
    );
  }

  if (!userLogin) {
    return <LoginScreen />;
  }

  // State mutators proxying sync
  const handleAddTask = (newTask: Omit<Task, "id font">) => {
    const taskObj: Task = {
      ...newTask,
      id: `task-${Date.now()}`
    };
    const updated = {
      ...appData,
      tasks: [taskObj, ...appData.tasks]
    };
    syncWithServer(updated);
    throwNotification(`Added task: "${newTask.title}"`, "success");
  };

  const handleUpdateTaskStatus = (id: string, status: Task["status"]) => {
    const updated = {
      ...appData,
      tasks: appData.tasks.map(t => t.id === id ? { ...t, status } : t)
    };
    syncWithServer(updated);
    throwNotification(`Updated milestone status to ${status}`, "info");
  };

  const handleDeleteTask = (id: string) => {
    const updated = {
      ...appData,
      tasks: appData.tasks.filter(t => t.id !== id)
    };
    syncWithServer(updated);
    throwNotification("Task removed from active board", "warning");
  };

  const handleAddSubject = (newSub: Omit<Subject, "id">) => {
    const subObj: Subject = {
      ...newSub,
      id: `sub-${Date.now()}`
    };
    const updated = {
      ...appData,
      subjects: [...appData.subjects, subObj]
    };
    syncWithServer(updated);
    throwNotification(`Subject "${newSub.code}" added to grading book`, "success");
  };

  const handleUpdateAttendance = (id: string, change: number) => {
    const updated = {
      ...appData,
      subjects: appData.subjects.map(s => {
        if (s.id === id) {
          const finalVal = Math.min(100, Math.max(0, s.attendance + change));
          return { ...s, attendance: finalVal };
        }
        return s;
      })
    };
    syncWithServer(updated);
    throwNotification("Syllabus attendance logs updated", "info");
  };

  const handleUpdateSubject = (updatedSub: Subject) => {
    const updated = {
      ...appData,
      subjects: appData.subjects.map(s => s.id === updatedSub.id ? updatedSub : s)
    };
    syncWithServer(updated);
    throwNotification(`Exam goals for "${updatedSub.code}" updated`, "success");
  };

  const handleDeleteSubject = (id: string) => {
    const originalSub = appData.subjects.find(s => s.id === id);
    const updated = {
      ...appData,
      subjects: appData.subjects.filter(s => s.id !== id)
    };
    syncWithServer(updated);
    throwNotification(`Subject "${originalSub?.code || 'Course'}" removed successfully`, "warning");
  };

  const handleAddHackathon = (newHack: Omit<Hackathon, "id">) => {
    const hackObj: Hackathon = {
      ...newHack,
      id: `hack-${Date.now()}`
    };
    const updated = {
      ...appData,
      hackathons: [hackObj, ...appData.hackathons]
    };
    syncWithServer(updated);
  };

  const handleAddInternship = (newIntern: Omit<Internship, "id text">) => {
    const internObj: Internship = {
      ...newIntern,
      id: `intern-${Date.now()}`
    };
    const updated = {
      ...appData,
      internships: [internObj, ...appData.internships]
    };
    syncWithServer(updated);
  };

  const handleUpdateInternshipStatus = (id: string, status: Internship["status"]) => {
    const updated = {
      ...appData,
      internships: appData.internships.map(i => i.id === id ? { ...i, status } : i)
    };
    syncWithServer(updated);
  };

  const handleUploadDocument = (newDoc: Omit<DocumentFile, "id" | "date">) => {
    const docObj: DocumentFile = {
      ...newDoc,
      id: `doc-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10)
    };
    const updated = {
      ...appData,
      documents: [docObj, ...appData.documents]
    };
    syncWithServer(updated);
    throwNotification(`Document uploaded successfully: "${newDoc.name}"`, "success");
  };

  const handleAddDiaryEntry = (newEntry: Omit<DiaryEntry, "id" | "date font">) => {
    const diaryObj: DiaryEntry = {
      ...newEntry,
      id: `de-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10)
    };
    const updated = {
      ...appData,
      diary_entries: [diaryObj, ...appData.diary_entries]
    };
    syncWithServer(updated);
    throwNotification("Diary entry logged & smart analyzed", "success");
  };

  // Nav menus descriptors
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tasks", label: "Tasks & Academics", icon: CheckSquare },
    { id: "exams", label: "Exam Preparation", icon: Star },
    { id: "hackathons", label: "Careers & Hacks", icon: Trophy },
    { id: "vault", label: "AI Document Vault", icon: FolderHeart },
    { id: "diary", label: "AI Diary & Brain", icon: BookLock },
    { id: "career_twin", label: "Digital Twin OS", icon: Sparkles },
    { id: "chatbot", label: "AI Co-Pilot Advisor", icon: Cpu },
    { id: "settings", label: "System Settings", icon: UserCog }
  ];

  const renderScreen = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard 
            data={appData} 
            onNavigate={(tab) => setActiveTab(tab)} 
            onUpdateProfile={async (updatedProfile) => {
              const updated = {
                ...appData,
                profile: updatedProfile
              };
              syncWithServer(updated);
              
              if (auth.currentUser) {
                try {
                  const userDocRef = doc(db, "users", auth.currentUser.uid);
                  try {
                    await setDoc(userDocRef, {
                      uid: auth.currentUser.uid,
                      email: auth.currentUser.email || "",
                      name: updatedProfile.name,
                      college: updatedProfile.college || "",
                      major: updatedProfile.major || "",
                      semester: updatedProfile.semester || "1st Semester",
                      mobile: updatedProfile.mobile || "",
                      updatedAt: new Date().toISOString()
                    }, { merge: true });
                  } catch (firestoreErr) {
                    handleFirestoreError(firestoreErr, OperationType.WRITE, `users/${auth.currentUser.uid}`);
                  }
                  
                  setUserLogin({
                    uid: auth.currentUser.uid,
                    email: auth.currentUser.email || "",
                    name: updatedProfile.name,
                    college: updatedProfile.college || "",
                    major: updatedProfile.major || "",
                    semester: updatedProfile.semester || "1st Semester",
                    mobile: updatedProfile.mobile || ""
                  });
                } catch (err) {
                  console.error("Failed to sync updated profile to Firestore", err);
                }
              }
            }}
          />
        );
      case "tasks":
        return (
          <TaskAcademic 
            tasks={appData.tasks}
            onAddTask={handleAddTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
            subjects={appData.subjects}
            onAddSubject={handleAddSubject}
            onUpdateAttendance={handleUpdateAttendance}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
            throwNotification={throwNotification}
          />
        );
      case "exams":
        return (
          <ExamPrep 
            subjects={appData.subjects}
            onUpdateSubject={handleUpdateSubject}
            onAddSubject={handleAddSubject}
            documents={appData.documents}
            throwNotification={throwNotification}
          />
        );
      case "hackathons":
        return (
          <HackathonInternship 
            hackathons={appData.hackathons}
            internships={appData.internships}
            onAddHackathon={handleAddHackathon}
            onAddInternship={handleAddInternship}
            onUpdateInternshipStatus={handleUpdateInternshipStatus}
          />
        );
      case "vault":
        return (
          <Vault 
            documents={appData.documents}
            onUploadDocument={handleUploadDocument}
            throwNotification={throwNotification}
          />
        );
      case "diary":
        return (
          <AIDiaryMemory 
            diary={appData.diary_entries}
            onAddDiaryEntry={handleAddDiaryEntry}
          />
        );
      case "career_twin":
        return <CareerTwin data={appData} />;
      case "chatbot":
        return <AIChatbot />;
      case "settings":
        return (
          <SettingsScreen 
            data={appData} 
            onUpdateProfile={async (updatedProfile) => {
              const updated = {
                ...appData,
                profile: updatedProfile
              };
              syncWithServer(updated);
              
              if (auth.currentUser) {
                try {
                  const userDocRef = doc(db, "users", auth.currentUser.uid);
                  try {
                    await setDoc(userDocRef, {
                      uid: auth.currentUser.uid,
                      email: auth.currentUser.email || "",
                      name: updatedProfile.name,
                      college: updatedProfile.college || "",
                      major: updatedProfile.major || "",
                      semester: updatedProfile.semester || "1st Semester",
                      mobile: updatedProfile.mobile || "",
                      updatedAt: new Date().toISOString()
                    }, { merge: true });
                  } catch (firestoreErr) {
                    handleFirestoreError(firestoreErr, OperationType.WRITE, `users/${auth.currentUser.uid}`);
                  }
                  
                  setUserLogin({
                    uid: auth.currentUser.uid,
                    email: auth.currentUser.email || "",
                    name: updatedProfile.name,
                    college: updatedProfile.college || "",
                    major: updatedProfile.major || "",
                    semester: updatedProfile.semester || "1st Semester",
                    mobile: updatedProfile.mobile || ""
                  });
                } catch (err) {
                  console.error("Failed to sync updated profile to Firestore", err);
                }
              }
            }}
            throwNotification={throwNotification}
            notificationHistory={notificationHistory}
            notificationMute={notificationMute}
            notificationDuration={notificationDuration}
            onToggleMute={() => setNotificationMute(!notificationMute)}
            onChangeDuration={(duration) => setNotificationDuration(duration)}
            onClearHistory={handleClearHistory}
            onTriggerMockNotif={handleTriggerMockNotif}
          />
        );
      default:
        return (
          <Dashboard 
            data={appData} 
            onNavigate={(tab) => setActiveTab(tab)} 
            onUpdateProfile={async (updatedProfile) => {
              const updated = {
                ...appData,
                profile: updatedProfile
              };
              syncWithServer(updated);
              
              if (auth.currentUser) {
                try {
                  const userDocRef = doc(db, "users", auth.currentUser.uid);
                  try {
                    await setDoc(userDocRef, {
                      uid: auth.currentUser.uid,
                      email: auth.currentUser.email || "",
                      name: updatedProfile.name,
                      college: updatedProfile.college || "",
                      major: updatedProfile.major || "",
                      semester: updatedProfile.semester || "1st Semester",
                      mobile: updatedProfile.mobile || "",
                      updatedAt: new Date().toISOString()
                    }, { merge: true });
                  } catch (firestoreErr) {
                    handleFirestoreError(firestoreErr, OperationType.WRITE, `users/${auth.currentUser.uid}`);
                  }
                  
                  setUserLogin({
                    uid: auth.currentUser.uid,
                    email: auth.currentUser.email || "",
                    name: updatedProfile.name,
                    college: updatedProfile.college || "",
                    major: updatedProfile.major || "",
                    semester: updatedProfile.semester || "1st Semester",
                    mobile: updatedProfile.mobile || ""
                  });
                } catch (err) {
                  console.error("Failed to sync updated profile to Firestore", err);
                }
              }
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen transition-all duration-500 student-bg pb-12 font-sans overflow-x-hidden">
      
      {/* BACKGROUND DECORATIVE ORBS WITH ACTIVE THEME SHADES */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          style={{ opacity: "var(--active-decor-orbs-opacity, 0.22)" }}
          className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[140px] transition-colors duration-500 ${
            cleanTheme === "astral" ? "bg-indigo-600" :
            cleanTheme === "neon" ? "bg-pink-600 animate-pulse" :
            cleanTheme === "emerald" ? "bg-emerald-600" :
            cleanTheme === "coal" ? "bg-cyan-900/40" :
            "bg-indigo-300"
          }`} 
        />
        <div 
          style={{ opacity: "var(--active-decor-orbs-opacity, 0.24)" }}
          className={`absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full blur-[160px] transition-colors duration-500 ${
            cleanTheme === "astral" ? "bg-purple-600" :
            cleanTheme === "neon" ? "bg-cyan-500 animate-pulse" :
            cleanTheme === "emerald" ? "bg-teal-600" :
            cleanTheme === "coal" ? "bg-neutral-800" :
            "bg-sky-305"
          }`} 
        />
      </div>

      {/* TOP HEAD REGION */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b select-none bg-[#090d1a]/80 border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 min-h-[4rem] flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500 text-white rounded-xl shadow shadow-indigo-500/25">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base font-sans tracking-tight block">StudentOS AI</span>
              <span className="text-[10px] text-indigo-400 font-mono block leading-none font-bold uppercase tracking-wide">
                🎓 Active Profile: {userLogin?.name}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            
            {/* View layout mode switch */}
            <div className="flex bg-black/35 p-1 rounded-2xl border border-white/5">
              <button
                onClick={() => setIsMobileEmulator(true)}
                className={`px-3 py-1.5 text-[11px] font-mono rounded-xl transition-all flex items-center gap-1 cursor-pointer ${isMobileEmulator ? "bg-white/10 text-white font-bold" : "text-gray-400 hover:text-white"}`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile App</span>
              </button>
              <button
                onClick={() => setIsMobileEmulator(false)}
                className={`px-3 py-1.5 text-[11px] font-mono rounded-xl transition-all flex items-center gap-1 cursor-pointer ${!isMobileEmulator ? "bg-white/10 text-white font-bold" : "text-gray-400 hover:text-white"}`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Expanded PC</span>
              </button>
            </div>

            {/* Premium Theme Selector Pill Toolbar */}
            <div className="flex items-center gap-1 bg-black/35 p-1 rounded-2xl border border-white/5">
              {[
                { id: "astral", label: "🌌 Astral", color: "bg-indigo-500" },
                { id: "neon", label: "💖 Neon", color: "bg-pink-500" },
                { id: "emerald", label: "🌿 Emerald", color: "bg-emerald-500" },
                { id: "frost", label: "❄️ Frost", color: "bg-indigo-400" },
                { id: "coal", label: "🖤 Coal", color: "bg-cyan-500" }
              ].map((themeOpt) => (
                <button
                  key={themeOpt.id}
                  title={`${themeOpt.label} theme`}
                  onClick={() => setActiveTheme(themeOpt.id as any)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-xl transition-all duration-300 select-none flex items-center gap-1 cursor-pointer ${
                    cleanTheme === themeOpt.id
                      ? "bg-white/10 text-white shadow-sm border border-white/10 font-bold scale-[1.03]"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${themeOpt.color}`} />
                  <span>{themeOpt.label.split(" ")[1]}</span>
                </button>
              ))}
            </div>

            {userLogin && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotificationCenter(!showNotificationCenter)}
                  className={`relative p-2 rounded-xl transition-all border duration-200 cursor-pointer flex items-center justify-center ${
                    showNotificationCenter
                      ? "bg-indigo-500/20 border-indigo-500/30 text-white"
                      : "bg-black/35 hover:bg-white/5 border-white/5 text-gray-400 hover:text-white"
                  }`}
                  title="System Notifications"
                >
                  <Bell className={`w-3.5 h-3.5 ${notificationHistory.some(h => !h.read) ? "animate-bounce" : ""}`} />
                  {notificationHistory.some(h => !h.read) && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[8px] font-extrabold rounded-full flex items-center justify-center text-white scale-90 border border-[#090d1a]">
                      {notificationHistory.filter(h => !h.read).length}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {showNotificationCenter && (
                    <NotificationCenter
                      history={notificationHistory}
                      isMuted={notificationMute}
                      duration={notificationDuration}
                      onToggleMute={() => setNotificationMute(!notificationMute)}
                      onChangeDuration={(newMs) => setNotificationDuration(newMs)}
                      onClearHistory={handleClearHistory}
                      onMarkAllRead={handleMarkAllRead}
                      onMarkRead={handleMarkRead}
                      onDeleteLog={handleDeleteLog}
                      onTriggerMockNotif={handleTriggerMockNotif}
                      onClose={() => setShowNotificationCenter(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
            )}

            {userLogin && (
              <button 
                onClick={handleLogout} 
                className="px-3 py-1.5 text-[10px] font-mono font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all border border-rose-500/20 shadow-sm cursor-pointer flex items-center gap-1 shrink-0"
              >
                Sign Out 🚪
              </button>
            )}

          </div>

        </div>
      </nav>

      {/* RENDER BASED ON INTERACTIVE SIMULATOR DECISION */}
      {isMobileScreen ? (
        /* RESPONSIVE FULL-SCREEN MOBILE VIEW WITH BOTTOM NAVBAR */
        <div className="flex flex-col relative min-h-[calc(100vh-4rem)] w-full text-white font-sans animate-fadeIn">
          {/* Mobile workspace viewport */}
          <div className="flex-1 px-4 pt-3.5 pb-28 select-none relative" id="mobile-viewport">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="h-full"
              >
                {renderScreen()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dynamic Bottom Tab Bar (sticky bottom nav bar for mobile screens) */}
          <div className="fixed bottom-0 inset-x-0 bg-black/95 backdrop-blur-lg border-t border-white/5 px-2 py-3 h-20 flex justify-around items-center z-40">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "tasks", label: "Academics", icon: CheckSquare },
              { id: "exams", label: "Exam Prep", icon: Star },
              { id: "chatbot", label: "AI Copilot", icon: Cpu }
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); }}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all cursor-pointer ${
                    active 
                      ? "text-cyan-400 font-bold scale-102" 
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[8.5px] font-bold tracking-tight font-sans leading-none">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : isMobileEmulator ? (
        <div className="flex flex-col items-center justify-center py-8 relative z-10 w-full animate-fadeIn font-sans">
          
          {/* Outer physical smartphone device bezel frame */}
          <div className="relative w-full max-w-[400px] bg-black/40 p-3.5 rounded-[56px] border border-white/5 shadow-2xl backdrop-blur-md">
            
            {/* Inner dynamic bounds with curves */}
            <div className="relative w-full h-[82vh] min-h-[640px] max-h-[800px] bg-[#0b0c10] rounded-[44px] border-[10px] border-slate-800 shadow-inner overflow-hidden flex flex-col">
              
              {/* Dynamic camera island/notch */}
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-black rounded-full z-50 flex items-center justify-center">
                <span className="w-2.5 h-2.5 bg-neutral-900 rounded-full border border-neutral-800" />
                <span className="w-1.5 h-1.5 bg-emerald-500/80 rounded-full ml-auto mr-3 animate-pulse" />
              </div>

              {/* Mobile device top network status bar details */}
              <div className="sticky top-0 z-40 bg-black/60 backdrop-blur-lg flex justify-between items-center px-6 pt-3 pb-2 text-[10px] font-mono text-gray-400 font-bold select-none leading-none border-b border-white/5">
                <span>09:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] tracking-tighter text-cyan-400 font-extrabold bg-cyan-950/20 px-1 py-0.5 rounded border border-cyan-500/10">5G READY</span>
                  <span>📶</span>
                  <span>🔋 98%</span>
                </div>
              </div>

              {/* Active Mobile subdivision screen workspace viewport */}
              <div className="flex-1 overflow-y-auto px-4 pt-3.5 pb-28 scroll-smooth select-none relative" id="mobile-viewport">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="h-full"
                  >
                    {renderScreen()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Dynamic Bottom Tab Bar (mobile app bottom nav hierarchy) */}
              <div className="absolute bottom-0 inset-x-0 bg-black/90 backdrop-blur-lg border-t border-white/5 px-2 py-3 h-20 flex justify-around items-center z-40">
                {[
                  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                  { id: "tasks", label: "Academics", icon: CheckSquare },
                  { id: "exams", label: "Exam Prep", icon: Star },
                  { id: "chatbot", label: "AI Copilot", icon: Cpu }
                ].map(tab => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); }}
                      className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all cursor-pointer ${
                        active 
                          ? "text-cyan-400 font-bold scale-102" 
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[8.5px] font-bold tracking-tight font-sans leading-none">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* SWIPE HOME BUTTON GRAPHIC */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/20 rounded-full z-50 pointer-events-none" />

            </div>
          </div>

          <p className="text-[10px] text-gray-500 font-mono mt-4 tracking-wider text-center max-w-sm px-6">
            📱 StudentOS Physical App Sandbox Sandbox v3.4 • Built inside active workspaces. Switch coordinates above!
          </p>
        </div>
      ) : (
        /* BODY CONSOLE HUB FOR EXPANDED VIEW */
        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT NAV BAR */}
          <aside className="col-span-1 space-y-3.5 select-none font-sans">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest px-3 mb-2 font-bold block">
              Navigation Rails
            </div>

            <nav className="space-y-1.5 shrink-0 flex flex-col">
              {navItems.map(item => {
                const Icon = item.icon;
                const matches = activeTab === item.id;
                return (
                  <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold select-none transition-all cursor-pointer ${
                      matches 
                        ? "student-btn font-bold scale-[1.02]" 
                        : (cleanTheme !== "frost" 
                            ? "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent" 
                            : "text-gray-650 hover:text-black hover:bg-black/5 border border-transparent")
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <hr className={`border-t ${cleanTheme !== "frost" ? "border-white/5" : "border-black/5"} my-6`} />

            {/* Quick info box */}
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${cleanTheme !== "frost" ? "bg-white/[0.02] border-white/5 text-gray-400" : "bg-white border-black/5 text-gray-600"}`}>
              <div className="flex items-center gap-1.5 font-bold text-gray-250 text-[11px] font-sans">
                <Info className="w-4 h-4 text-indigo-400" />
                <span className={cleanTheme !== "frost" ? "text-white" : "text-black"}>Workspace bundle exports</span>
              </div>
              <p className="font-mono text-[10px]">
                Complete Flutter packages and FastAPI backends are generated inside `/flutter_studentos` and `/fastapi_studentos` paths ready to download!
              </p>
            </div>
          </aside>

          {/* RIGHT CORE SCREEN AREA */}
          <main className="col-span-1 lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="h-full"
              >
                {renderScreen()}
              </motion.div>
            </AnimatePresence>
          </main>

        </div>
      )}

      {/* FLOATING SYSTEM NOTIFICATIONS WATERFALL */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm w-full font-sans select-none pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`p-4 rounded-2xl shadow-xl border flex items-center gap-3 backdrop-blur-md pointer-events-auto ${
                n.type === "success" 
                  ? "bg-emerald-500/10 border-[#10b981]/20 text-emerald-300"
                  : n.type === "warning"
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
                  : "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                n.type === "success" ? "bg-emerald-400" : n.type === "warning" ? "bg-rose-400" : "bg-indigo-400"
              } animate-ping`} />
              <span className="text-xs font-semibold leading-relaxed">{n.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
