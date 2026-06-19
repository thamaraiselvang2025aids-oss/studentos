export interface Profile {
  name: string;
  college: string;
  major: string;
  gpa: string;
  semester: string;
  skills: string[];
  mobile?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  attendance: number;
  targetAttendance: number;
  score: number;
  studyHours: number;
  chapters?: string[]; // optional chapters list
  files?: Array<{ name: string; url?: string; date: string }>; // optional files upload array
  examDate?: string; // Optional upcoming exam date string (YYYY-MM-DD)
}

export interface Task {
  id: string;
  title: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  deadline: string;
  status: "Todo" | "In Progress" | "Done";
  subjectId?: string; // optional active subject course affiliation
}

export interface Project {
  id: string;
  title: string;
  description: string;
  problem: string;
  tech: string[];
  codeUrl: string;
  demoUrl: string;
  progress: number;
  deadline: string;
  members: string[];
}

export interface Hackathon {
  id: string;
  name: string;
  status: "Applied" | "Accepted" | "Submitted" | "Won" | "Rejected";
  date: string;
  submissionTitle: string;
  prize?: string;
  certificateUrl?: string;
  members: string[];
  projectLink?: string;
}

export interface Internship {
  id: string;
  company: string;
  role: string;
  status: "Applied" | "Interviewing" | "Offer" | "Rejected";
  interviewDate?: string;
  feedback?: string;
  offerLetter?: string;
}

export interface Achievement {
  id: string;
  title: string;
  type: string;
  issuer: string;
  date: string;
  documentUrl?: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  type: "Resume" | "Mark Sheets" | "Research Papers" | "Project Reports" | "Notes";
  folder: string;
  date: string;
  ocrContent?: string;
  tags: string[];
}

export interface Goal {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
  category: "Academic" | "Career" | "Personal" | "Research";
}

export interface DiaryEntry {
  id: string;
  date: string;
  mood: string;
  content: string;
  reflection?: string;
}

export interface StudentOSData {
  profile: Profile;
  subjects: Subject[];
  tasks: Task[];
  projects: Project[];
  hackathons: Hackathon[];
  internships: Internship[];
  achievements: Achievement[];
  documents: DocumentFile[];
  goals: Goal[];
  diary_entries: DiaryEntry[];
}
