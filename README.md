# TripPilot - Online Flight Tracker

## This project is an AI-powered flight tracking and travel assistance platform that integrates real-time flight updates with interactive maps, essential travel information, and AI chatbot–driven personalization.

**URL**: to be updated

## Features
- Display live flights on interactive maps showing source and destination locations along with real-time flight status.
- Monitor flight progress and location in real time, including arrivals, departures, and delay updates.
- Provides AI powered Active Assistance.
- Offers step-by-step recommendations for rebooking, compensation, and support.
- AI-powered itinerary planner that creates personalized travel plans based on traveler preferences and trip type.
- Personalized notifications delivered at the right time based on the passenger’s flight details, routes, and travel schedule.
- Display information geographically using interactive maps.
- Two-way communication via an AI chatbot.

## Requirements

### Frontend
- Node.js (v18+ recommended)
- npm or bun

**Key technologies & libraries**
- React
- Vite
- Tailwind CSS
- MapLibre GL / Leaflet (interactive maps)
- React Router
- TanStack React Query
- Firebase
- Framer Motion

> Full frontend dependency list is available in `package.json`.

---

### Backend
- Python 3.9+
- pip
- virtual environment (recommended)

**Key technologies & libraries**
- FastAPI
- Uvicorn
- Pydantic
- Requests
- Google Generative AI (Gemini)

> Full backend dependency list is available in `requirements.txt`.

---

## Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
AVIATIONSTACK_API_KEY=your_aviationstack_api_key_here
```

> **Note**: Get your AviationStack API key from [aviationstack.com](https://aviationstack.com/)

### 1️⃣ Run the Backend (FastAPI)

Open a terminal and navigate to the backend directory:

```bash
cd backend
```
Create and activate a virtual environment:
```bash
python -m venv venv
venv\Scripts\activate   # Windows

```
Install dependencies:
```bash
pip install -r requirements.txt
```
Start the backend server:
```bash
python -m uvicorn main:app --reload
```
Backend runs at:
```bash
http://127.0.0.1:8000
```
API documentation:
```bash
http://127.0.0.1:8000/docs
```

## 2️⃣ Run the Frontend (React + Vite)
Open a new terminal window and go to the project root:
```bash
cd TripPilot
npm install
npm run dev

```
Frontend runs at:
```bash
http://localhost:8080

```


## License
This project is for educational/demo



