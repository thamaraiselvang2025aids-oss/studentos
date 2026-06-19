import React, { useState } from "react";
import { 
  FolderOpen, Search, FileText, Sparkles, Tag, Plus, 
  UploadCloud, RefreshCw, Layers 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DocumentFile } from "../types";

interface VaultProps {
  documents: DocumentFile[];
  onUploadDocument: (doc: Omit<DocumentFile, "id" | "date">) => void;
  throwNotification?: (text: string, type?: "success" | "info" | "warning") => void;
}

export default function Vault({ documents, onUploadDocument, throwNotification }: VaultProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFolder, setActiveFolder] = useState<string>("All");
  const [simFile, setSimFile] = useState<string>("");
  const [simType, setSimType] = useState<DocumentFile["type"]>("Resume");
  
  const [loadingOcr, setLoadingOcr] = useState<string | null>(null);
  const [viewOcrId, setViewOcrId] = useState<string | null>(null);

  const folders = ["All", "Career", "Academics", "Certifications"];

  const handleUploadSim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simFile.trim()) return;

    const folder = simType === "Resume" ? "Career" : simType === "Mark Sheets" ? "Academics" : "Certifications";

    onUploadDocument({
      name: simFile,
      type: simType,
      folder: folder,
      tags: [simType.toLowerCase().replace(" ", "_"), "uploaded", "v1"],
      ocrContent: `Simulated OCR text for: ${simFile}. Authorized scan matches student Alex Mercer academic record.`
    });

    setSimFile("");
  };

  const triggerOCR = async (docId: string, docName: string) => {
    setLoadingOcr(docId);
    try {
      const res = await fetch("/api/ai/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docName: docName })
      });
      const parsed = await res.json();
      
      // We can update the document local reference or simply show modal
      setLoadingOcr(null);
      setViewOcrId(docId);
    } catch (e) {
      setLoadingOcr(null);
      if (throwNotification) {
        throwNotification("Connect GEMINI_API_KEY in settings for authentic multi-modal certificate analysis.", "warning");
      } else {
        alert("Connect GEMINI_API_KEY for authentic multi-modal certificate analysis.");
      }
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesFolder = activeFolder === "All" || doc.folder === activeFolder;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">AI Vault: Certificates & Documents</h2>
          <p className="text-xs text-gray-500 mt-0.5 font-mono">Simulate OCR-Tagging and unified search indexes</p>
        </div>

        {/* Directory switcher */}
        <div className="flex gap-1.5 p-1 bg-black/25 rounded-xl border border-white/5 w-fit">
          {folders.map(fold => (
            <button 
              key={fold}
              onClick={() => setActiveFolder(fold)}
              className={`px-3 py-1.5 text-xs rounded-lg select-none transition-all ${activeFolder === fold ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/15" : "text-gray-400 hover:text-white"}`}
            >
              {fold}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH AND DRAG SIMULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload form container */}
        <div className="col-span-1 p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <UploadCloud className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Upload New Credential</h3>
          </div>

          <form onSubmit={handleUploadSim} className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-400 font-mono block mb-1">FILE NAME</label>
              <input 
                type="text"
                placeholder="e.g. Stanford_Bio_Certificate.png"
                value={simFile}
                onChange={(e) => setSimFile(e.target.value)}
                className="w-full bg-black/20 text-white border border-white/10 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-mono block mb-1">DOCUMENT TYPE</label>
              <select 
                value={simType}
                onChange={(e) => setSimType(e.target.value as any)}
                className="w-full bg-black/20 text-white border border-white/10 px-2.5 py-2 rounded-xl text-xs focus:outline-none"
              >
                <option className="bg-[#1e1e2f]" value="Resume">Resume</option>
                <option className="bg-[#1e1e2f]" value="Mark Sheets">Mark Sheet / Transcript</option>
                <option className="bg-[#1e1e2f]" value="Research Papers">Research Paper</option>
                <option className="bg-[#1e1e2f]" value="Notes">Study Notes</option>
              </select>
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 font-semibold text-white text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-1.5"
            >
              Add with OCR indexing
            </button>
          </form>

          <div className="border border-dashed border-white/10 rounded-2xl p-4 text-center text-gray-500 text-xs bg-black/10 select-none">
            Drag and drop images, PDFs, marksheets or resumes directly here to simulate vector embedding creation.
          </div>
        </div>

        {/* Search & Results list */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search via keyword summaries or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-all font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-gray-500 text-xs">No matching credentials found in directory.</div>
            ) : (
              filteredDocs.map(doc => (
                <div key={doc.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all space-y-3 relative group">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-[#4f46e5]/10 border border-indigo-500/10 rounded-xl text-indigo-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-xs font-bold text-white truncate break-words" title={doc.name}>{doc.name}</h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-500 font-mono font-semibold">
                        <span className="uppercase">{doc.type}</span>
                        <span>•</span>
                        <span>Folder: {doc.folder}</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-t border-white/5" />

                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map(t => (
                        <span key={t} className="flex items-center gap-0.5 text-gray-400 font-semibold bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          <Tag className="w-2.5 h-2.5 text-gray-500" /> {t}
                        </span>
                      ))}
                    </div>

                    <button 
                      onClick={() => triggerOCR(doc.id, doc.name)}
                      disabled={loadingOcr === doc.id}
                      className="text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer select-none"
                    >
                      {loadingOcr === doc.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                      )}
                      <span>OCR Info</span>
                    </button>
                  </div>

                  {/* OCR Extra content display */}
                  <AnimatePresence>
                    {viewOcrId === doc.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 p-3 bg-black/35 border border-white/5 rounded-xl text-[11px] leading-relaxed text-gray-300 font-mono">
                          <p className="font-bold text-indigo-300 mb-1 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI OCR EXTRACTION PREVIEW:
                          </p>
                          {doc.ocrContent}
                          <button 
                            onClick={() => setViewOcrId(null)}
                            className="mt-2 block text-xs underline text-gray-500 hover:text-gray-300 select-none cursor-pointer"
                          >
                            Collapse OCR Panel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )))}
          </div>

        </div>

      </div>

    </div>
  );
}
