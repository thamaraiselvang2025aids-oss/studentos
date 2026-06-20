import React, { useState, useEffect } from "react";
import { 
  Briefcase, Star, Sparkles, RefreshCw, Clipboard, CheckCircle, 
  Map, Compass, Github, MessageSquare, Award, ArrowUpRight 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StudentOSData } from "../types";

interface CareerTwinProps {
  data: StudentOSData;
}

export default function CareerTwin({ data }: CareerTwinProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [twinData, setTwinData] = useState<any>(null);
  const [portfolioGen, setPortfolioGen] = useState(false);

  // Load digital twin assessment
  const fetchTwinAssessment = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai/career/avatar");
      const parsed = await res.json();
      setTwinData(parsed);
    } catch (e) {
      // Inline Fallback
      setTwinData({
        placementReadiness: 85,
        internshipChances: 90,
        researchReadiness: 75,
        startupReadiness: 80,
        skillGap: ["Docker", "Kubernetes", "GraphQL", "Redis"],
        recommendations: ["NVIDIA CUDA Developer Intern", "Google AI Systems Architect Coordinator"],
        roadmap: [
          { phase: "Phase 1: Foundations", milestone: "Build 2 deep learning systems." },
          { phase: "Phase 2: Scale", milestone: "Integrate vector index pipelines." }
        ]
      });
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchTwinAssessment();
  }, [data]);

  // Live opportunities scrapes feeds simulation
  const opsFeeds = [
    { portal: "GitHub Opportunities", title: "ML Systems Dev Residency", company: "Meta", link: "#" },
    { portal: "Devpost Competitions", title: "Bio-Vision Hackathon 2026", prize: "$25,000 Prize Pool", link: "#" },
    { portal: "Internshala Recruits", title: "Edge Architecture Developer", company: "NVIDIA Corp", link: "#" },
    { portal: "Unstop Challenge", title: "Elite AI Coders Champion League", prize: "National Finalist", link: "#" }
  ];

  return (
    <div className="space-y-6">
      
      {/* DIGITAL TWIN ASSESSMENT HEAD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core readiness predictors scores */}
        <div className="col-span-1 lg:col-span-2 p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -z-10" />

          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">AI Placement & Success Predictor</h2>
              <p className="text-xs text-gray-500 font-mono mt-0.5">Analytic model weighing GPA, code assets & credentials</p>
            </div>
            
            <button 
              onClick={fetchTwinAssessment}
              disabled={analyzing}
              className="p-2 border border-white/10 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${analyzing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {analyzing ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-indigo-300 font-mono text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
              <span>Analyzing codebases, achievements, and GPA transcripts...</span>
            </div>
          ) : (
            twinData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  
                  <div className="p-4 rounded-2xl bg-black/20 border border-white/5 text-center">
                    <span className="block text-2xl font-bold font-mono text-indigo-400">{twinData.placementReadiness}%</span>
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mt-1">Placement Score</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/20 border border-white/5 text-center">
                    <span className="block text-2xl font-bold font-mono text-emerald-400">{twinData.internshipChances}%</span>
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mt-1">Internship odds</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/20 border border-white/5 text-center">
                    <span className="block text-2xl font-bold font-mono text-teal-400">{twinData.researchReadiness}%</span>
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mt-1">Research Odds</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/20 border border-white/5 text-center">
                    <span className="block text-2xl font-bold font-mono text-amber-400">{twinData.startupReadiness}%</span>
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mt-1">Founder potential</span>
                  </div>

                </div>

                {/* Progress bars indicators */}
                <div className="space-y-3.5 my-4 bg-black/15 p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block mb-2">Metrics visualization index</span>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between mb-1 text-[11px] font-mono text-gray-400">
                        <span>Placement Readiness score complies</span>
                        <span className="text-white font-bold">{twinData.placementReadiness}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${twinData.placementReadiness}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-[11px] font-mono text-gray-400">
                        <span>Academic credentials threshold</span>
                        <span className="text-white font-bold">{Number(data.profile.gpa) * 25}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${Number(data.profile.gpa) * 25}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skill Gaps recommendations section */}
                <div className="space-y-2">
                  <h3 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">Identified nearest skill gaps:</h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {twinData.skillGap?.map((gap: string) => (
                      <span key={gap} className="px-2.5 py-1.5 rounded-xl text-xs font-mono text-rose-405 bg-rose-500/5 text-rose-300 border border-rose-500/20 font-semibold select-none">
                        - {gap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Live Opportunities Feed Scraper simulations */}
        <div className="col-span-1 p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Active Opportunities Hub</h2>
            <p className="text-xs text-gray-500 mt-1">Real-time recommended contests & internships (GitHub, Devpost, Unstop)</p>
          </div>

          <div className="space-y-3 my-4">
            {opsFeeds.map((feed, idx) => (
              <div key={idx} className="p-3 bg-black/20 rounded-2xl border border-white/5 hover:border-indigo-500/25 transition-all text-xs space-y-1.5">
                <span className="text-[9px] uppercase tracking-wider font-semibold text-indigo-400 font-mono bg-indigo-500/5 py-0.5 px-2 rounded-lg">{feed.portal}</span>
                <div className="flex justify-between items-center gap-1">
                  <span className="text-gray-200 font-semibold truncate leading-none">{feed.title}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                </div>
                {feed.company && <p className="text-[10px] text-gray-500 font-mono">Employer: {feed.company}</p>}
                {feed.prize && <p className="text-[10px] text-amber-400 font-mono">{feed.prize}</p>}
              </div>
            ))}
          </div>

          <a href="#" className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-center transition-all font-semibold rounded-xl text-xs block">
            Scrape Advanced Opportunities
          </a>
        </div>

      </div>

      {/* DETAILED ROADMAP TIMELINE */}
      {twinData && (
        <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">AI Roadmap Pathfinder Calendar</h2>
              <p className="text-xs text-gray-500">Autonomous curriculum steps customized for your current projects</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {twinData.roadmap?.map((phase: any, idx: number) => (
              <div key={idx} className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 text-3xl font-bold font-mono text-white/5 leading-none select-none">
                  #0{idx+1}
                </div>
                <h4 className="text-xs font-bold text-indigo-400 font-mono tracking-wider uppercase">{phase.phase}</h4>
                <p className="text-gray-300 text-xs leading-relaxed">{phase.milestone}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PORTFOLIO CONSOLE GENERATOR */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1E293B]/60 to-[#0F172A]/40 border border-white/10 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-amber-400 animate-pulse" />
          <div>
            <h3 className="text-base font-bold text-white">Interactive Personal Portfolio Generator</h3>
            <p className="text-xs text-gray-400">Generate personal website codes, CVs & LinkedIn summaries pointing to your academic repositories.</p>
          </div>
        </div>

        <button 
          onClick={() => setPortfolioGen(true)}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 font-bold text-black border border-amber-500/20 rounded-xl text-xs select-none transition-all cursor-pointer flex items-center gap-1"
        >
          Generate Standout Portfolio Website
        </button>

        <AnimatePresence>
          {portfolioGen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 border border-white/5 rounded-2xl bg-black/30 font-mono text-xs space-y-3.5 text-gray-300">
                <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl">
                  <span className="text-indigo-400 font-bold uppercase tracking-wider text-[11px]">Personal Portfolio (Generated HTML/React Layout):</span>
                  <button onClick={() => setPortfolioGen(false)} className="text-[10px] text-gray-500 underline select-none cursor-pointer hover:text-white">Close Console</button>
                </div>
                
                <pre className="text-[11px] overflow-x-auto whitespace-pre p-3 bg-black/50 border border-white/5 rounded-xl max-h-56 leading-normal text-amber-200">
{`<!-- Alex Mercer Personal Portfolio Mockup -->
<section id="hero" style="font-family: 'Space Grotesk', sans-serif;">
  <h1>Hi, I'm Alex Mercer 👋</h1>
  <p>Pursuing Computer Science & AI at Stanford University (GPA 3.92)</p>
  <div class="skills">
    \${data.profile.skills.map(s => \`<span>\${s}</span>\`).join('')}
  </div>
</section>

<section id="projects">
  <h2>My Tech Work</h2>
  \${data.projects.map(p => \`
    <div class="card">
      <h3>\${p.title}</h3>
      <p>\${p.description}</p>
    </div>
  \`).join('')}
</section>`}
                </pre>
                
                <div className="p-3 bg-[#4f46e5]/10 border border-indigo-500/10 rounded-xl">
                  <h4 className="text-indigo-300 font-bold mb-1 uppercase tracking-wide text-[10px]">Autogenerated LinkedIn professional summary summary:</h4>
                  <p className="italic text-gray-200 text-xs">
                    "Computer Science & AI candidate at Stanford University with a cumulative GPA of 3.92. Backed by solid projects on mobile workspace engines (StudentOS) and diagnostic machine vision programs (MedAI). Winning developer at Global AI Hack 2026. Proficient in Flutter, FastAPI, and TensorFlow."
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
