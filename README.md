# AI Resume Analyzer

A fresher-friendly full-stack project that analyzes resumes using Gemini AI and returns:
- Overall score
- ATS score
- Strengths
- Weaknesses
- Improvement suggestions

## Tech Stack

- Frontend: React
- Backend: Node.js + Express
- AI Model: Google Gemini
- File Parsing: `pdf-parse`

## Project Structure

- `client` - React app (UI)
- `server` - Express API for PDF parsing + AI analysis

## Local Setup

### 1) Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 2) Add environment variables

Create `server/.env`:

```env
GEMINI_API_KEY=your_api_key_here
PORT=5000
```

Create `client/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:5000
```

### 3) Run locally

```bash
# terminal 1
cd server && node index.js

# terminal 2
cd client && npm start
```

## API Endpoint

- `POST /api/analyze`
  - form-data key: `resume` (PDF file)

## Notes

- The frontend already supports drag-and-drop PDF upload.
- The app also supports downloading the analysis report as PDF.
