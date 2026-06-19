import React, { useState } from "react";
import { GraduationCap, Phone, User, LogIn, Sparkles, Mail, KeyRound, UserPlus, ArrowRight, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { auth, db } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/firestore-error";

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Sign up fields
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [college, setCollege] = useState("");
  const [major, setMajor] = useState("");
  const [semester, setSemester] = useState("1st Semester");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMsg("");
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Check if user doc exists in Firestore, if not create with defaults
      const userDocRef = doc(db, "users", user.uid);
      let snap;
      try {
        snap = await getDoc(userDocRef);
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.GET, `users/${user.uid}`);
      }
      
      if (snap && !snap.exists()) {
        try {
          await setDoc(userDocRef, {
            uid: user.uid,
            name: user.displayName || "Alex Mercer",
            email: user.email || "",
            mobile: user.phoneNumber || "",
            college: "Stanford University",
            major: "Computer Science",
            semester: "1st Semester",
            createdAt: new Date().toISOString()
          });
        } catch (firestoreErr) {
          handleFirestoreError(firestoreErr, OperationType.CREATE, `users/${user.uid}`);
        }
      }
    } catch (err: any) {
      console.error("Google Authentication Error:", err);
      setErrorMsg(err.message || "Failed to authorize with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (isSignUp) {
      const trimmedName = name.trim();
      const cleanMobile = mobile.trim();
      const cleanCollege = college.trim();
      const cleanMajor = major.trim();

      if (!trimmedName) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      if (!cleanMobile) {
        setErrorMsg("Please provide your registered mobile number.");
        return;
      }
      if (!cleanCollege) {
        setErrorMsg("Please enter your College / University name.");
        return;
      }
      if (!cleanMajor) {
        setErrorMsg("Please enter your Department / Major name.");
        return;
      }
      
      const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
      if (!phoneRegex.test(cleanMobile)) {
        setErrorMsg("Mobile number format is invalid. Please check the digits.");
        return;
      }

      try {
        setIsLoading(true);
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const uid = userCredential.user.uid;

        // Save profile metadata to Firestore under the doc uid
        try {
          await setDoc(doc(db, "users", uid), {
            uid,
            name: trimmedName,
            email: cleanEmail,
            mobile: cleanMobile,
            college: cleanCollege,
            major: cleanMajor,
            semester,
            createdAt: new Date().toISOString()
          });
        } catch (firestoreErr) {
          handleFirestoreError(firestoreErr, OperationType.CREATE, `users/${uid}`);
        }

      } catch (err: any) {
        console.error("Registration error:", err);
        if (err.code === "auth/email-already-in-use") {
          setErrorMsg("This email address is already registered.");
        } else if (err.code === "auth/invalid-email") {
          setErrorMsg("Please provide a valid email address.");
        } else if (err.code === "auth/operation-not-allowed") {
          setErrorMsg("Email/Password Auth is not enabled in Firebase Console. Please authorize with Google or enable Email/Password provider.");
        } else {
          setErrorMsg(err.message || "Failed to initialize student profile.");
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Login flow
      try {
        setIsLoading(true);
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } catch (err: any) {
        console.error("Login error:", err);
        if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
          setErrorMsg("Invalid email or password combination.");
        } else if (err.code === "auth/invalid-email") {
          setErrorMsg("Please provide a valid email address.");
        } else if (err.code === "auth/operation-not-allowed") {
          setErrorMsg("Email/Password Auth is not enabled in Firebase Console. Please authorize with Google or enable Email/Password provider.");
        } else {
          setErrorMsg(err.message || "Failed to authorize profile.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative p-4 overflow-hidden bg-[#0a0a14]">
      {/* Absolute graphic background blobs styling */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md p-8 rounded-[32px] bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl space-y-5 z-10"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-3">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight font-sans">
            StudentOS Identity Core
          </h2>
          <span className="text-[10px] text-indigo-400 font-mono block uppercase tracking-widest font-semibold">
            SECURE STUDENT MANAGEMENT GATEWAY
          </span>
        </div>

        {/* Instant Google Login Action (Works instantly out of the box!) */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 text-xs select-none disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4 mr-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" strokeWidth="0" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            <span>Sign in with Google Workspace</span>
          </button>
          
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="px-3 text-[10px] text-gray-500 font-mono tracking-widest uppercase">OR EMAIL ADDRESS</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-black/40 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMsg(""); }}
            className={`py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              !isSignUp ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Access Portfolio
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMsg(""); }}
            className={`py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              isSignUp ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Create Profile
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Universal auth field: Email */}
          <div>
            <label className="text-[10px] text-gray-400 font-mono tracking-wider uppercase block mb-1.5 ml-1">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <input 
                type="email"
                placeholder="Enter email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/25 text-white border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-sans transition-all"
                required
              />
            </div>
          </div>

          {/* Universal auth field: Password */}
          <div>
            <label className="text-[10px] text-gray-400 font-mono tracking-wider uppercase block mb-1.5 ml-1">
              PASSWORD SECURE KEY
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <input 
                type="password"
                placeholder="Min 6 characters..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/25 text-white border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-sans transition-all"
                required
              />
            </div>
          </div>

          {/* Additional signup profile fields */}
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4 pt-1"
            >
              <div>
                <label className="text-[10px] text-gray-400 font-mono tracking-wider uppercase block mb-1.5 ml-1">
                  STUDENT SURNAME / NAME
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input 
                    type="text"
                    placeholder="Enter Full Name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/25 text-white border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-sans transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-mono tracking-wider uppercase block mb-1.5 ml-1">
                  MOBILE PHONE NUMBER
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input 
                    type="text"
                    placeholder="e.g. +1 (555) 019-2834..."
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-black/25 text-white border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-sans transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-mono tracking-wider uppercase block mb-1.5 ml-1">
                  UNIVERSITY / COLLEGE NAME
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input 
                    type="text"
                    placeholder="e.g. Stanford University..."
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full bg-black/25 text-white border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-sans transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-mono tracking-wider uppercase block mb-1.5 ml-1">
                  DEPARTMENT / MAJOR PATHWAY
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Computer Science & AI..."
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full bg-black/25 text-white border border-white/10 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-sans transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-mono tracking-wider uppercase block mb-1.5 ml-1">
                  CURRENT SEMESTER
                </label>
                <select 
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full bg-[#0d1021] text-white border border-white/10 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all cursor-pointer font-sans font-medium"
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="3rd Semester">3rd Semester</option>
                  <option value="4th Semester">4th Semester</option>
                  <option value="5th Semester">5th Semester</option>
                  <option value="6th Semester">6th Semester</option>
                  <option value="7th Semester">7th Semester</option>
                  <option value="8th Semester">8th Semester</option>
                </select>
              </div>
            </motion.div>
          )}

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/15 p-3 rounded-xl text-rose-400 text-xs font-mono text-center">
              ⚠️ {errorMsg}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-extrabold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 cursor-pointer flex items-center justify-center gap-2 select-none disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>INITIALIZE PROFILE</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>AUTHORIZE PROFILE SESSION</span>
              </>
            )}
          </button>
        </form>

        {/* Informative Help Callout on how to activate Email/Password in console if they wish */}
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/15 rounded-xl text-[10px] text-indigo-300 font-sans flex items-start gap-2 leading-relaxed">
          <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Firebase Configuration Help:</span> By default, only Google Authorization is pre-enabled. To use custom Email/Password signup, enable the "Email/Password" provider in the Firebase Authentication Console.
          </div>
        </div>

        <div className="text-center pt-2 border-t border-white/5 flex items-center justify-center gap-1.5 text-[9px] text-gray-500 font-mono uppercase">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Real-time authentication powered securely by Firebase Core.</span>
        </div>
      </motion.div>
    </div>
  );
}
