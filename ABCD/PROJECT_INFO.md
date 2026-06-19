# StudentOS AI - Personal Academic Operating System & Career Twin

Welcome to the production-ready source architecture of **StudentOS AI**. This repository is pre-configured with a modular multi-platform blueprint incorporating:
1. **Frontend**: Clean Architecture Flutter Mobile App using Riverpod.
2. **Backend**: FastAPI High-Performance Asynchronous Python Backend.
3. **Database**: Firestore Collections & PostgreSQL Schemas.
4. **AI Engine**: @google/genai Gemini Integration.

---

## 📂 Modular Folder Structure

### Flutter Mobile App (`/flutter_studentos`)
```text
flutter_studentos/
├── pubspec.yaml                 # Package management, Fl-Chart, Google Fonts, and Riverpod State.
├── assets/                      # Application icons, document templates & fonts.
└── lib/
    ├── main.dart                # Application bootstrap with dark glassmorphic styling filters.
    ├── models/
    │   └── student_model.dart   # Pydantic-equivalent Dart classes for Academics, Tasks & Papers.
    ├── views/
    │   ├── dashboard_view.dart  # Glassmorphic card metrics grid, exam countdowns & live notifications.
    │   ├── task_manager_view.dart # Kanban grid and calendar toggle nodes.
    │   └── career_twin_view.dart # Skill gap analyzers and Placement Readiness score indicators.
    └── providers/
        └── student_state.dart   # Riverpod async sync engine pointing to FastAPI server.
```

### FastAPI Backend (`/fastapi_studentos`)
```text
fastapi_studentos/
├── main.py                     # FastAPI application router, OCR pipelines & prediction calculations.
├── database.py                 # SQLAlchemy relational session mapping or Firestore context connections.
├── models.py                   # SQL definitions of the student database clusters.
└── requirements.txt            # Python dependencies (fastapi, uvicorn, pydantic, google-genai, sqlalchemy).
```

---

## 🗄️ Database Collections (Firestore Schema)

### `users`
```json
{
  "uid": "USER_ID",
  "name": "Alex Mercer",
  "college": "Stanford University",
  "major": "Computer Science & AI",
  "gpa": 3.92,
  "skills": ["Python", "Dart", "Flutter", "Firebase", "TypeScript", "TensorFlow", "FastAPI"]
}
```

### `tasks`
```json
{
  "id": "TASK_ID",
  "uid": "USER_ID",
  "title": "Outline ML Term Paper",
  "category": "Academics",
  "priority": "High",
  "deadline": "2026-06-14",
  "status": "In Progress"
}
```

### `projects`
```json
{
  "id": "PROJECT_ID",
  "title": "StudentOS AI Core",
  "description": "All-in-one personal operating system.",
  "tech": ["Flutter", "FastAPI", "Gemini AI"],
  "progress": 85,
  "codeUrl": "https://github.com/...",
  "members": ["Alex Mercer", "Devin Smith"]
}
```

---

## 🚀 Professional Deployment Guide

### Running FastAPI Locally
1. Navigate to the FastAPI directory:
   ```bash
   cd fastapi_studentos
   ```
2. Create and active a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate # On Windows: venv\\Scripts\\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set your Environment Variables:
   ```bash
   export GEMINI_API_KEY="your_api_key_here"
   ```
5. Boot up the local server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Running Flutter Application
1. Navigate to the Flutter directory:
   ```bash
   cd flutter_studentos
   ```
2. Resolve Dart packages:
   ```bash
   flutter pub get
   ```
3. Run on local simulator/device:
   ```bash
   flutter run -d chrome # Or android/ios
   ```

---

## 📡 API Documentation & Endpoints

| Endpoint | Method | Payload | Function |
|---|---|---|---|
| `/api/profile` | `GET` | None | Retrieves user digital attributes. |
| `/api/ocr-extract` | `POST` | `multipart/form-data` | Extract text metadata from uploaded Marksheets & Certificates. |
| `/api/ai/chatbot` | `POST` | `{ "prompt": "" }` | Ground queries with respect to student projects/milestones. |
| `/api/ai/success-predictor` | `POST` | GPA & Skill array | Predict placement readiness and startup success indexes. |
