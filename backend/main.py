from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import requests
import random
import os
import time
from dotenv import load_dotenv # Import the security tool

# --- LOAD SECRETS ---
load_dotenv() # This reads your hidden .env file

# --- CREDENTIALS ---
CLIENT_ID = 'manaspathak11041-api-client'
CLIENT_SECRET = 'kRIXvc1OIrircnJEnxZd8c3QbdJz6hK1' 

# 🔒 Securely load the keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
AVIATIONSTACK_API_KEY = os.getenv("AVIATIONSTACK_API_KEY")

if not GEMINI_API_KEY:
    print("❌ CRITICAL ERROR: GEMINI_API_KEY not found! Did you create the .env file?")

if not AVIATIONSTACK_API_KEY:
    print("⚠️ WARNING: AVIATIONSTACK_API_KEY not found! Airport data will use fallback.")

# --- CONFIGURATION ---
TOKEN_URL = "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token"
API_URL = "https://opensky-network.org/api/states/all"
CURRENT_TOKEN = None

# Cache for AviationStack airports (to avoid rate limits)
AIRPORTS_CACHE = None
AIRPORTS_CACHE_TIME = None
AIRPORTS_CACHE_DURATION = 2400  # 40 minutes in seconds

# Configure Gemini
try:
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        # using the 'latest' alias which is definitely supported
        model = genai.GenerativeModel('gemini-flash-latest') 
        print("✅ Gemini Configured Successfully (Secure Mode)")
    else:
        model = None
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
    print("⚠️ USING SIMULATION DATA (API Limit or Error) ⚠️")
    flights = []
    routes = [(28.55, 77.10), (19.09, 72.87), (12.97, 77.59), (13.08, 80.27), (22.57, 88.36)]
    airlines = ["IGO", "AIC", "VTI", "SEJ"]
    
    for i in range(25):
        start = random.choice(routes)
        flights.append({
            "icao24": f"sim_{i}",
            "callsign": f"{random.choice(airlines)}{random.randint(100,999)}",
            "lat": start[0] + random.uniform(-6, 6),
            "lon": start[1] + random.uniform(-6, 6),
            "heading": random.randint(0, 360),
            "altitude": random.randint(5000, 12000),
            "velocity": random.randint(200, 280),
            "status": "In Air"
        })
    return flights

# --- OAUTH HELPER ---
def get_access_token():
    global CURRENT_TOKEN
    payload = {'grant_type': 'client_credentials', 'client_id': CLIENT_ID, 'client_secret': CLIENT_SECRET}
    try:
        response = requests.post(TOKEN_URL, data=payload, timeout=5)
        if response.status_code == 200:
            CURRENT_TOKEN = response.json().get('access_token')
            return CURRENT_TOKEN
    except:
        return None
    return None

def get_opensky_data(params):
    global CURRENT_TOKEN
    if not CURRENT_TOKEN: get_access_token()
    
    headers = {'Authorization': f'Bearer {CURRENT_TOKEN}'}
    try:
        response = requests.get(API_URL, headers=headers, params=params, timeout=5)
        
        if response.status_code == 429: # Rate Limit
            print("❌ OpenSky Rate Limit (429) Hit!")
            return None
            
        if response.status_code == 401: # Token expired
            get_access_token()
            return None 

        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Connection Error: {e}")
    return None

def get_aviationstack_airports():
    """Fetch airports from AviationStack API and filter for India with caching to avoid rate limits"""
    global AIRPORTS_CACHE, AIRPORTS_CACHE_TIME
    
    # Check cache first
    if AIRPORTS_CACHE is not None and AIRPORTS_CACHE_TIME is not None:
        elapsed = time.time() - AIRPORTS_CACHE_TIME
        if elapsed < AIRPORTS_CACHE_DURATION:
            print(f"✅ Using cached airports data ({int(elapsed)}s old, {int(AIRPORTS_CACHE_DURATION - elapsed)}s remaining)")
            return AIRPORTS_CACHE
    
    if not AVIATIONSTACK_API_KEY:
        # Return cached data if available, even if expired
        if AIRPORTS_CACHE is not None:
            print("⚠️ No API key, returning stale cached airports")
            return AIRPORTS_CACHE
        return None
    
    try:
        url = "http://api.aviationstack.com/v1/airports"
        # Try to use country_code parameter first
        params = {
            'access_key': AVIATIONSTACK_API_KEY,
            'country_code': 'IN',
            'limit': 100  # Get up to 100 airports
        }
        response = requests.get(url, params=params, timeout=10)
        
        # Handle rate limit errors
        if response.status_code == 429:
            print("⚠️ AviationStack Rate Limit (429) Hit! Using cached data if available")
            if AIRPORTS_CACHE is not None:
                return AIRPORTS_CACHE
            return None
        elif response.status_code == 104:
            print("⚠️ AviationStack Monthly Usage Limit (104) Hit! Using cached data if available")
            if AIRPORTS_CACHE is not None:
                return AIRPORTS_CACHE
            return None
        elif response.status_code == 103:
            print("⚠️ AviationStack API functionality not available (103). Using cached data if available")
            if AIRPORTS_CACHE is not None:
                return AIRPORTS_CACHE
            return None
        
        if response.status_code == 200:
            data = response.json()
            
            # Check for API errors in response
            if 'error' in data:
                error_info = data.get('error', {})
                error_code = error_info.get('code')
                if error_code == 101:
                    print("❌ AviationStack: Invalid API access key")
                elif error_code == 103:
                    print("⚠️ AviationStack: API functionality not available. Using cached data if available")
                    if AIRPORTS_CACHE is not None:
                        return AIRPORTS_CACHE
                elif error_code == 104:
                    print("⚠️ AviationStack: Monthly usage limit exceeded. Using cached data if available")
                    if AIRPORTS_CACHE is not None:
                        return AIRPORTS_CACHE
                return None
            
            if 'data' in data:
                all_airports = data['data']
                
                # Filter for Indian airports (in case country_code parameter doesn't work)
                indian_airports = []
                for ap in all_airports:
                    country_name = str(ap.get('country_name', '')).lower()
                    country_code = str(ap.get('country_code', '')).upper()
                    country_iso2 = str(ap.get('country_iso2', '')).upper()
                    
                    # Check if it's India
                    if ('india' in country_name or 
                        country_code == 'IN' or 
                        country_iso2 == 'IN' or
                        ap.get('country_iso2') == 'IN'):
                        indian_airports.append(ap)
                
                if indian_airports:
                    print(f"✅ Found {len(indian_airports)} Indian airports from AviationStack")
                    # Cache the results
                    AIRPORTS_CACHE = indian_airports
                    AIRPORTS_CACHE_TIME = time.time()
                    return indian_airports
                else:
                    # If no Indian airports found, try fetching without country filter
                    # and then filter manually
                    print(f"⚠️ No Indian airports found with country filter. Trying broader search...")
                    params_no_filter = {
                        'access_key': AVIATIONSTACK_API_KEY,
                        'limit': 1000  # Get more airports to find Indian ones
                    }
                    response2 = requests.get(url, params=params_no_filter, timeout=15)
                    
                    # Handle rate limits on second request too
                    if response2.status_code == 429 or response2.status_code == 104:
                        print(f"⚠️ AviationStack Rate Limit Hit on second request! Using cached data if available")
                        if AIRPORTS_CACHE is not None:
                            return AIRPORTS_CACHE
                        return None
                    
                    if response2.status_code == 200:
                        data2 = response2.json()
                        if 'error' in data2:
                            print("⚠️ AviationStack Error in second request. Using cached data if available")
                            if AIRPORTS_CACHE is not None:
                                return AIRPORTS_CACHE
                            return None
                            
                        if 'data' in data2:
                            all_airports2 = data2['data']
                            indian_airports2 = []
                            for ap in all_airports2:
                                country_name = str(ap.get('country_name', '')).lower()
                                country_code = str(ap.get('country_code', '')).upper()
                                country_iso2 = str(ap.get('country_iso2', '')).upper()
                                
                                if ('india' in country_name or 
                                    country_code == 'IN' or 
                                    country_iso2 == 'IN'):
                                    indian_airports2.append(ap)
                            
                            if indian_airports2:
                                print(f"✅ Found {len(indian_airports2)} Indian airports after manual filtering")
                                # Cache the results
                                AIRPORTS_CACHE = indian_airports2
                                AIRPORTS_CACHE_TIME = time.time()
                                return indian_airports2
        else:
            print(f"❌ AviationStack API Error: {response.status_code}")
            print(response.text)
            # Return cached data if available on error
            if AIRPORTS_CACHE is not None:
                print("⚠️ Returning cached airports due to API error")
                return AIRPORTS_CACHE
    except Exception as e:
        print(f"❌ AviationStack Connection Error: {e}")
        # Return cached data on connection error
        if AIRPORTS_CACHE is not None:
            print("⚠️ Returning cached airports due to connection error")
            return AIRPORTS_CACHE
    
    # If we get here and have cached data, return it even if expired
    if AIRPORTS_CACHE is not None:
        print("⚠️ Returning stale cached airports (no fresh data available)")
        return AIRPORTS_CACHE
    
    return None

# --- ENDPOINTS ---

@app.get("/api/flights/active")
def get_active_flights_india():
    params = {'lamin': 6.0, 'lomin': 68.0, 'lamax': 37.0, 'lomax': 97.0}
    data = get_opensky_data(params)
    
    if not data or 'states' not in data or data['states'] is None:
        return {"flights": generate_simulation()}

    flights = []
    for s in data['states']: 
        if s[5] is None or s[6] is None: continue
        flights.append({
            "icao24": s[0],
            "callsign": s[1].strip() if s[1] else "Unknown",
            "lat": s[6], "lon": s[5],
            "heading": s[10] or 0, "altitude": s[7] or 0, "velocity": s[9] or 0,
            "status": "In Air" 
        })
        
    if len(flights) == 0: return {"flights": generate_simulation()}
    return {"flights": flights}

@app.post("/api/track-flight")
def track_flight(request: FlightRequest):
    return {
        "flight_info": {"live": True, "altitude": 32000, "velocity": 850},
        "ai_analysis": "**Analysis:** Flight is on standard approach path. Weather conditions are clear."
    }

@app.get("/api/airports")
def get_airports():
    """Get Indian airports from AviationStack API"""
    airports_data = get_aviationstack_airports()
    
    if not airports_data:
        # Fallback to empty array if API fails
        print("⚠️ No airports data from API, returning empty array")
        return {"airports": []}
    
    # Transform AviationStack data to our format
    airports = []
    for ap in airports_data:
        # Only include airports with valid coordinates
        if ap.get('latitude') and ap.get('longitude'):
            try:
                # Double-check it's India (additional safety check)
                country_name = str(ap.get('country_name', '')).lower()
                country_code = str(ap.get('country_code', '')).upper()
                country_iso2 = str(ap.get('country_iso2', '')).upper()
                
                if ('india' in country_name or 
                    country_code == 'IN' or 
                    country_iso2 == 'IN'):
                    airports.append({
                        "code": ap.get('iata_code') or ap.get('icao_code', ''),
                        "name": ap.get('airport_name', 'Unknown Airport'),
                        "city": ap.get('city_name', 'Unknown City'),
                        "lat": float(ap.get('latitude', 0)),
                        "lng": float(ap.get('longitude', 0)),
                        "country": ap.get('country_name', 'India'),
                        "timezone": ap.get('timezone', 'Asia/Kolkata')
                    })
            except (ValueError, TypeError) as e:
                print(f"⚠️ Skipping airport with invalid data: {e}")
                continue
    
    print(f"✅ Returning {len(airports)} Indian airports from AviationStack")
    return {"airports": airports}

@app.post("/api/chat")
def chat_with_copilot(request: ChatRequest):
    print(f"DEBUG: Chat Query: {request.message}")
    print(f"DEBUG: Context: {request.context}") # See what the frontend is sending
    
    if not model:
        return {"response": "AI System Offline (Check API Key)."}

    # Enhanced System Prompt for Context & Jargon
    system_instruction = """
    You are 'Captain Gemini', an expert pilot assistant for TripPilot.
    
    YOUR SUPERPOWERS:
    1. CONTEXT AWARENESS: Use the 'Current Context' provided below to answer questions about specific flights. 
       - If the user asks "Is it delayed?", check the context status.
       - If the user asks "How high are we?", check the context altitude.
    
    2. JARGON TRANSLATOR: If the user uses aviation terms (like 'Turbulence', 'Crosswind', 'Taxiing', 'Squawk'), 
       explain them in simple, fun terms for a passenger.
    
    TONE: Professional, reassuring, but concise (max 3 sentences).
    """
    
    try:
        # Combine System Prompt + Context + User Query
        full_prompt = f"{system_instruction}\n\nCURRENT CONTEXT: {request.context}\n\nUSER QUESTION: {request.message}"
        
        response = model.generate_content(full_prompt)
        return {"response": response.text}
    except Exception as e:
        print(f"AI Error: {e}")
        return {"response": "I'm experiencing radio interference. Please ask again."}