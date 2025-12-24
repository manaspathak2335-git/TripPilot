from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import requests
import random
from datetime import datetime

# --- CREDENTIALS (WORKING) ---
CLIENT_ID = 'manaspathak11041-api-client'
CLIENT_SECRET = 'kRIXvc1OIrircnJEnxZd8c3QbdJz6hK1' 
GEMINI_API_KEY = "AIzaSyA1jboZoiYvNAESsBly8AdQCy11DqBJLI4"

# --- CONFIGURATION ---
TOKEN_URL = "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token"
API_URL = "https://opensky-network.org/api/states/all"

# Global Token Storage (Simple Caching)
CURRENT_TOKEN = None

# Configure Gemini
try:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
except:
    print("Gemini Config Error (Ignore if key is missing)")

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

def get_access_token():
    """Gets a new OAuth2 token from OpenSky"""
    global CURRENT_TOKEN
    print("🔐 Requesting new OpenSky Access Token...")
    
    payload = {
        'grant_type': 'client_credentials',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }
    
    try:
        response = requests.post(TOKEN_URL, data=payload, timeout=5)
        if response.status_code == 200:
            token = response.json().get('access_token')
            CURRENT_TOKEN = token
            print("✅ Token refreshed successfully.")
            return token
        else:
            print(f"❌ Token Failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"CRITICAL ERROR (Token): {e}")
        return None

def get_opensky_data(params):
    """Helper to fetch data, handling token refresh automatically"""
    global CURRENT_TOKEN
    
    # 1. Get token if we don't have one
    if not CURRENT_TOKEN:
        if not get_access_token():
            return None

    headers = {'Authorization': f'Bearer {CURRENT_TOKEN}'}
    
    try:
        # 2. Try fetching data
        response = requests.get(API_URL, headers=headers, params=params, timeout=10)
        
        # 3. If 401 Unauthorized, token expired. Refresh and retry ONCE.
        if response.status_code == 401:
            print("⚠️ Token expired. Refreshing...")
            if get_access_token():
                headers = {'Authorization': f'Bearer {CURRENT_TOKEN}'}
                response = requests.get(API_URL, headers=headers, params=params, timeout=10)
            else:
                return None

        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ OpenSky API Error: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"Connection Error: {e}")
        return None

@app.get("/api/flights/active")
def get_active_flights_india():
    # India Bounding Box
    params = {'lamin': 6.0, 'lomin': 68.0, 'lamax': 37.0, 'lomax': 97.0}
    
    data = get_opensky_data(params)
    
    if not data or 'states' not in data or data['states'] is None:
        print("⚠️ No data received. Sending empty list.")
        return {"flights": []}

    flights = []
    # Process the raw data
    for s in data['states']: 
        # Skip invalid planes (No lat/lon)
        if s[5] is None or s[6] is None:
            continue
            
        flights.append({
            "icao24": s[0],
            "callsign": s[1].strip() if s[1] else "Unknown",
            "lat": s[6],
            "lon": s[5],
            "heading": s[10] if len(s) > 10 and s[10] else 0,
            "altitude": s[7] if len(s) > 7 and s[7] else 0,
            "velocity": s[9] if len(s) > 9 and s[9] else 0,
            "status": "In Air" 
        })
        
    print(f"✅ Served {len(flights)} LIVE flights to Frontend.")
    return {"flights": flights}

@app.post("/api/track-flight")
def track_flight(request: FlightRequest):
    # Fetch specific flight details
    params = {'icao24': request.icao24}
    data = get_opensky_data(params)
    
    flight_info = {}
    if data and data['states']:
        s = data['states'][0]
        flight_info = {
            "icao24": s[0],
            "callsign": s[1].strip(),
            "lat": s[6],
            "lon": s[5],
            "altitude": s[7],
            "velocity": s[9],
            "live": True
        }
    
    # Gemini Analysis
    if flight_info:
        prompt = f"""
        Analyze flight {flight_info.get('callsign')} (ICAO: {request.icao24}).
        Altitude: {flight_info.get('altitude')}m. Speed: {flight_info.get('velocity')}m/s.
        Tell the user:
        1. Is it cruising or landing?
        2. Speed in km/h.
        Short summary.
        """
        try:
            ai_response = model.generate_content(prompt)
            analysis = ai_response.text
        except:
            analysis = "AI analysis currently unavailable."
    else:
        analysis = "Flight data unavailable for detailed analysis."

    return {
        "flight_info": flight_info,
        "ai_analysis": analysis
    }