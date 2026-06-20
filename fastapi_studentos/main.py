from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import uvicorn
from datetime import datetime

app = FastAPI(
    title="StudentOS AI Backend API",
    description="Production-ready FastAPI backend powering academics, hackathons, documents, career twin analysis, and vector search simulations.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------
# DATABASE SCHEMAS & PYDANTIC MODELS
# ----------------------------------------------------

class StudentProfile(BaseModel):
    name: str
    college: str
    major: str
    gpa: float
    semester: str
    skills: List[str]

class Subject(BaseModel):
    id: str
    name: str
    code: str
    attendance: int
    targetAttendance: int
    score: int
    studyHours: float

class Task(BaseModel):
    id: str
    title: str
    category: str
    priority: str
    deadline: str
    status: str

class Project(BaseModel):
    id: str
    title: str
    description: str
    problem: str
    tech: List[str]
    codeUrl: str
    demoUrl: str
    progress: int
    deadline: str
    members: List[str]

class Hackathon(BaseModel):
    id: str
    name: str
    status: str  # Applied, Accepted, Won, Submitted, Rejected
    date: str
    submissionTitle: str
    prize: Optional[str] = None
    certificateUrl: Optional[str] = None
    members: List[str]
    projectLink: Optional[str] = None

class Internship(BaseModel):
    id: str
    company: str
    role: str
    status: str
    interviewDate: Optional[str] = None
    feedback: Optional[str] = None
    offerLetter: Optional[str] = None

class Document(BaseModel):
    id: str
    name: str
    type: str  # Resume, Mark Sheets, Research Papers, Notes
    folder: str
    date: str
    ocrContent: Optional[str] = None
    tags: List[str]

class Goal(BaseModel):
    id: str
    title: str
    targetDate: str
    completed: bool
    category: str

class DiaryEntry(BaseModel):
    id: str
    date: str
    mood: str
    content: str
    reflection: str

# ----------------------------------------------------
# REUSABLE MOCK DATA STORE (Equivalent to Firestore/PostgreSQL Router)
# ----------------------------------------------------

MOCK_PROFILE = StudentProfile(
    name="Alex Mercer",
    college="Stanford University",
    major="Computer Science & AI",
    gpa=3.92,
    semester="6th Semester",
    skills=["Python", "Dart", "Flutter", "Firebase", "TypeScript", "TensorFlow", "FastAPI"]
)

# ----------------------------------------------------
# ROUTE ENDPOINTS
# ----------------------------------------------------

@app.get("/")
def read_root():
    return {"status": "online", "message": "Welcome to StudentOS AI core backend engine."}

@app.get("/api/profile", response_model=StudentProfile)
async def get_profile():
    return MOCK_PROFILE

@app.put("/api/profile", response_model=StudentProfile)
async def update_profile(profile: StudentProfile):
    global MOCK_PROFILE
    MOCK_PROFILE = profile
    return MOCK_PROFILE

@app.post("/api/ocr-extract")
async def extract_ocr(file: UploadFile = File(...)):
    """
    OCR Extraction Module using Gemini 3.5 Flash or PyPDF2 / Tesseract
    Classifies documents (certificates, transcript, papers) based on terms.
    """
    content_name = file.filename
    # Simulate OCR parsing
    extracted_text = f"Simulated OCR extract for official file {content_name}. Verifies participant Alex Mercer successfully qualified."
    category = "Certificate" if "cert" in content_name.lower() else "Document"
    return {
        "filename": content_name,
        "ocr_content": extracted_text,
        "category": category,
        "tags": ["extracted", "ocr", "verified"],
        "analyzed_at": datetime.utcnow().isoformat()
    }

@app.post("/api/ai/chatbot")
async def chat_bot(prompt: str, chat_history: List[dict] = []):
    """
    Gemini Chatbot Endpoint
    Instructed with structured student credentials context for vector answers.
    """
    # In real FastAPI, call GoogleGenAI REST API or @google/genai module
    # with GEMINI_API_KEY environment variable.
    api_key = os.getenv("GEMINI_API_KEY", "NOT_CONFIGURED")
    return {
        "status": "success",
        "response": f"Reply for '{prompt}'. Core student Alex Mercer possesses master skills in Flutter, FastAPI, and GPA 3.92. (Gemini Core Active: {api_key != 'NOT_CONFIGURED'})",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/ai/memory")
async def semantic_search(query: str):
    """
    AI Memory Vector database search
    Simulates cosine matches with Gemini Embeddings.
    """
    return {
        "query": query,
        "matches": [
            {
                "id": "p1",
                "title": "StudentOS Workspace Tool",
                "type": "project",
                "similarity": 0.88,
                "snippet": "All-in-one personal academic manager with cross-platform synchronization."
            }
        ]
    }

@app.post("/api/ai/success-predictor")
async def predict_success(gpa: float, skills: List[str]):
    """
    AI Placement and Success predictors
    """
    readiness_score = int(gpa * 20 + len(skills) * 2.5)
    readiness_score = min(readiness_score, 100)
    return {
        "placement_readiness": readiness_score,
        "internship_chances": min(readiness_score + 5, 100),
        "startup_readiness": 75 if len(skills) > 4 else 50,
        "radar_chart_metrics": {
            "academic": gpa / 4.0 * 100,
            "skills": min(len(skills) * 12, 100),
            "projects": 90,
            "hackathons": 80
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
