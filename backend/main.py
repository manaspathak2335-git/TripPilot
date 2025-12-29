from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import random
import os
import time
import requests
from dotenv import load_dotenv
from FlightRadar24 import FlightRadar24API

# --- LOAD SECRETS ---
load_dotenv()

# --- CONFIGURATION ---
fr_api = FlightRadar24API()

# Securely load keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
AVIATIONSTACK_API_KEY = os.getenv("AVIATIONSTACK_API_KEY")

if not GEMINI_API_KEY:
    print("❌ CRITICAL ERROR: GEMINI_API_KEY not found! Did you create the .env file?")
if not AVIATIONSTACK_API_KEY:
    print("⚠️ WARNING: AVIATIONSTACK_API_KEY not found! Airport data will use fallback.")

# --- SMART SORTING DATA (Your Feature) ---
BUSY_ROUTES = {
    frozenset(["DEL", "BOM"]), frozenset(["BOM", "DEL"]),
    frozenset(["DEL", "BLR"]), frozenset(["BLR", "DEL"]),
    frozenset(["BOM", "BLR"]), frozenset(["BLR", "BOM"]),
    frozenset(["DEL", "CCU"]), frozenset(["CCU", "DEL"]),
    frozenset(["DEL", "HYD"]), frozenset(["HYD", "DEL"]),
    frozenset(["BOM", "GOI"]), frozenset(["GOI", "BOM"]),
    frozenset(["MAA", "DEL"]), frozenset(["DEL", "MAA"]),
}

MAJOR_HUBS = {"DEL", "BOM", "BLR", "HYD", "MAA", "CCU", "GOI", "PNQ", "AMD", "COK"}

# --- AIRPORT CACHE (Teammate's Feature) ---
AIRPORTS_CACHE = None
AIRPORTS_CACHE_TIME = None
AIRPORTS_CACHE_DURATION = 2400  # 40 minutes

# Configure Gemini
try:
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-flash-latest') 
        print("✅ Gemini Configured Successfully")
    else:
        model = None
        print("⚠️ Gemini Key Missing - AI will be offline")
except Exception as e:
    print(f"Gemini Config Error: {e}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FlightRequest(BaseModel):
    icao24: str 

class ChatRequest(BaseModel):
    message: str
    context: str = "General Query"

# --- SIMULATION FALLBACK ---
def generate_simulation():
    print("⚠️ USING SIMULATION DATA (Connection Error or No Flights) ⚠️")
    flights = []
    backup_routes = [
        ("DEL", "BOM", "IGO202", "IndiGo"),
        ("BOM", "BLR", "AIC405", "Air India"),
        ("CCU", "DEL", "VTI707", "Vistara"),
        ("BLR", "GOI", "IGO55", "IndiGo"),
        ("HYD", "MAA", "SEJ332", "SpiceJet")
    ]
    
    for i in range(25):
        route = random.choice(backup_routes)
        flights.append({
            "id": f"sim_{i}",
            "flightNumber": route[2],
            "airline": route[3],
            "origin": route[0],
            "destination": route[1],
            "lat": 20.59 + random.uniform(-8, 8),
            "lon": 78.96 + random.uniform(-8, 8),
            "heading": random.randint(0, 360),
            "altitude": random.randint(15000, 38000),
            "speed": random.randint(250, 480),
            "status": "In Air"
        })
    return flights

# --- HELPER: GET AIRPORTS (Teammate's Feature) ---
def get_aviationstack_airports():
    global AIRPORTS_CACHE, AIRPORTS_CACHE_TIME
    
    # Check cache
    if AIRPORTS_CACHE is not None and AIRPORTS_CACHE_TIME is not None:
        elapsed = time.time() - AIRPORTS_CACHE_TIME
        if elapsed < AIRPORTS_CACHE_DURATION:
            return AIRPORTS_CACHE
    
    if not AVIATIONSTACK_API_KEY:
        return AIRPORTS_CACHE if AIRPORTS_CACHE else None
    
    try:
        url = "http://api.aviationstack.com/v1/airports"
        params = {'access_key': AVIATIONSTACK_API_KEY, 'country_code': 'IN', 'limit': 100}
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if 'data' in data:
                indian_airports = [
                    ap for ap in data['data'] 
                    if ap.get('country_iso2') == 'IN' or ap.get('country_code') == 'IN'
                ]
                if indian_airports:
                    AIRPORTS_CACHE = indian_airports
                    AIRPORTS_CACHE_TIME = time.time()
                    return indian_airports
    except Exception as e:
        print(f"❌ AviationStack Connection Error: {e}")
    
    return AIRPORTS_CACHE

# --- ENDPOINTS ---

@app.get("/api/flights/active")
def get_active_flights_india():
    # --- YOUR LOGIC (FlightRadar24 + Priority Sorting) ---
    try:
        bounds = "37,6,68,97" 
        real_flights = fr_api.get_flights(bounds=bounds)
        processed_flights = []
        
        for f in real_flights:
            flight_num = getattr(f, 'callsign', 'Unknown')
            
            airline_name = "Unknown Airline"
            if hasattr(f, 'airline_short_name'):
                airline_name = f.airline_short_name
            elif hasattr(f, 'airline_icao'):
                airline_name = f.airline_icao
            
            origin = getattr(f, 'origin_airport_iata', 'N/A')
            dest = getattr(f, 'destination_airport_iata', 'N/A')
            
            if origin == 'N/A' or dest == 'N/A':
                continue

            # SCORING LOGIC
            priority_score = 0
            if frozenset([origin, dest]) in BUSY_ROUTES:
                priority_score = 3
            elif origin in MAJOR_HUBS and dest in MAJOR_HUBS:
                priority_score = 2
            elif origin in MAJOR_HUBS or dest in MAJOR_HUBS:
                priority_score = 1
            
            processed_flights.append({
                "id": f.id,
                "flightNumber": flight_num,
                "airline": airline_name,
                "origin": origin,
                "destination": dest,
                "lat": f.latitude,
                "lon": f.longitude,
                "heading": f.heading,
                "altitude": f.altitude,
                "speed": f.ground_speed, 
                "status": "In Air",
                "priority": priority_score
            })
            
        if not processed_flights:
            return {"flights": generate_simulation()}
            
        sorted_flights = sorted(
            processed_flights, 
            key=lambda x: (x['priority'], x['altitude']), 
            reverse=True
        )[:50]
        
        return {"flights": sorted_flights}

    except Exception as e:
        print(f"FlightRadar Error: {e}")
        return {"flights": generate_simulation()}

@app.get("/api/airports")
def get_airports():
    """Get Indian airports (Teammate's Endpoint)"""
    airports_data = get_aviationstack_airports()
    if not airports_data: return {"airports": []}
    
    airports = []
    for ap in airports_data:
        if ap.get('latitude') and ap.get('longitude'):
            airports.append({
                "code": ap.get('iata_code') or ap.get('icao_code', ''),
                "name": ap.get('airport_name', 'Unknown Airport'),
                "city": ap.get('city_name', 'Unknown City'),
                "lat": float(ap.get('latitude', 0)),
                "lng": float(ap.get('longitude', 0)),
                "country": ap.get('country_name', 'India'),
                "timezone": ap.get('timezone', 'Asia/Kolkata')
            })
    return {"airports": airports}

@app.post("/api/track-flight")
def track_flight(request: FlightRequest):
    return {
        "flight_info": {"live": True, "altitude": 32000, "velocity": 450},
        "ai_analysis": "**Analysis:** Flight is on standard approach path."
    }

@app.post("/api/chat")
def chat_with_copilot(request: ChatRequest):
    if not model: return {"response": "AI Offline."}
    
    system_instruction = """
    You are 'Captain Gemini', an expert pilot assistant for TripPilot.
    CONTEXT: Use the provided context (Origins, Destinations) to answer queries.
    """
    try:
        full_prompt = f"{system_instruction}\n\nCURRENT CONTEXT: {request.context}\n\nUSER QUESTION: {request.message}"
        response = model.generate_content(full_prompt)
        return {"response": response.text}
    except Exception as e:
        print(f"AI Error: {e}")
        return {"response": "I'm experiencing radio interference."}