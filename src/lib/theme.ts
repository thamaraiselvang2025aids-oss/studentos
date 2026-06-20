export type ThemeKey = "astral" | "neon" | "emerald" | "frost";

export interface ThemeStyles {
  bg: string;
  card: string;
  btn: string;
  badge: string;
  subtle: string;
  textAccent: string;
  textMuted: string;
  borderAccent: string;
  glowLeft: string;
  glowRight: string;
  label: string;
  input: string;
  textTitle: string;
  bgDarker: string;
  roundedMain: string;
  roundedCard: string;
}

export const themes: Record<ThemeKey, ThemeStyles> = {
  astral: {
    bg: "bg-[#090D1A] text-white",
    card: "bg-white/[0.03] border border-white/10 hover:border-indigo-500/25 backdrop-blur-md shadow-xl shadow-black/40",
    btn: "bg-indigo-500 hover:bg-indigo-600 text-white shadow shadow-indigo-500/30 border border-indigo-500/20",
    badge: "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20",
    subtle: "bg-black/25 text-gray-400 border border-white/5",
    textAccent: "text-indigo-400",
    textMuted: "text-gray-400",
    borderAccent: "border-indigo-500/35",
    glowLeft: "bg-indigo-600",
    glowRight: "bg-purple-600",
    label: "text-gray-500 font-mono font-bold text-[10px] tracking-wider",
    input: "bg-black/20 text-white border border-white/10 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500",
    textTitle: "text-white font-bold",
    bgDarker: "bg-black/35",
    roundedMain: "rounded-[32px] md:rounded-[40px]",
    roundedCard: "rounded-[24px] md:rounded-[28px]"
  },
  neon: {
    bg: "bg-[#03020A] text-slate-100",
    card: "bg-slate-950/45 border-2 border-pink-500/15 hover:border-pink-500/40 backdrop-blur-xl shadow-2xl shadow-pink-500/5",
    btn: "bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-600/40 border border-pink-500/30",
    badge: "bg-pink-500/10 text-pink-300 border border-pink-500/20",
    subtle: "bg-slate-900/60 text-slate-300 border border-pink-500/10",
    textAccent: "text-pink-400",
    textMuted: "text-slate-400",
    borderAccent: "border-pink-500/45",
    glowLeft: "bg-pink-600",
    glowRight: "bg-cyan-500",
    label: "text-pink-500/80 font-mono font-black text-[9px] tracking-widest",
    input: "bg-slate-950/60 text-white border border-pink-500/20 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-pink-550 focus:ring-1 focus:ring-pink-500/35",
    textTitle: "text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300 font-extrabold",
    bgDarker: "bg-slate-950/80",
    roundedMain: "rounded-2xl",
    roundedCard: "rounded-xl"
  },
  emerald: {
    bg: "bg-[#040E0D] text-[#E8F5E9]",
    card: "bg-emerald-950/15 border border-emerald-500/20 hover:border-emerald-400/45 backdrop-blur-lg shadow-lg shadow-emerald-950/40",
    btn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow shadow-emerald-600/35 border border-emerald-500/20",
    badge: "bg-emerald-500/10 text-emerald-300 border border-emerald-400/20",
    subtle: "bg-emerald-950/40 text-emerald-100/70 border border-emerald-500/10",
    textAccent: "text-emerald-400",
    textMuted: "text-emerald-600/90",
    borderAccent: "border-emerald-500/30",
    glowLeft: "bg-emerald-600",
    glowRight: "bg-teal-600",
    label: "text-emerald-500/70 font-mono font-semibold text-[10px] tracking-wider",
    input: "bg-[#061B19] text-emerald-100 border border-emerald-500/20 px-3 py-2 rounded-[18px] text-xs focus:outline-none focus:border-emerald-450",
    textTitle: "text-emerald-200 font-bold",
    bgDarker: "bg-[#030A09]/70",
    roundedMain: "rounded-[36px] md:rounded-[48px]",
    roundedCard: "rounded-[24px] md:rounded-[36px]"
  },
  frost: {
    bg: "bg-slate-50 text-slate-900",
    card: "bg-white/60 border border-slate-200/80 hover:border-indigo-300/60 backdrop-blur-xl shadow-lg shadow-slate-100/80",
    btn: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/15 border border-indigo-500/10",
    badge: "bg-indigo-505/10 text-indigo-700 border border-indigo-500/15 bg-indigo-50",
    subtle: "bg-slate-100 text-slate-700 border border-slate-200/80",
    textAccent: "text-indigo-600",
    textMuted: "text-slate-500",
    borderAccent: "border-indigo-350",
    glowLeft: "bg-indigo-300",
    glowRight: "bg-sky-300",
    label: "text-slate-500 font-mono font-medium text-[10px] tracking-wider",
    input: "bg-white text-slate-900 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100",
    textTitle: "text-slate-800 font-extrabold",
    bgDarker: "bg-slate-100/50",
    roundedMain: "rounded-3xl",
    roundedCard: "rounded-2xl"
  }
};
