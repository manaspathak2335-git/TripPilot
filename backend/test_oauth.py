import requests

# --- REPLACE WITH YOUR NEW CREDENTIALS ---
CLIENT_ID = 'manaspathak11041-api-client' 
CLIENT_SECRET = 'kRIXvc1OIrircnJEnxZd8c3QbdJz6hK1'

# OpenSky Auth URLs (Standard for their Keycloak/OAuth setup)
TOKEN_URL = "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token"
API_URL = "https://opensky-network.org/api/states/all"

def get_access_token():
    print(f"🔐 Attempting to get Access Token using Client ID: {CLIENT_ID[:5]}...")
    
    # 1. The Handshake (Exchange ID/Secret for Token)
    payload = {
        'grant_type': 'client_credentials',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }
    
    try:
        response = requests.post(TOKEN_URL, data=payload, timeout=10)
        
        if response.status_code == 200:
            token = response.json().get('access_token')
            print("✅ Token Received!")
            return token
        else:
            print(f"❌ Token Failed: {response.status_code}")
            print(response.text)
            return None
            
    except Exception as e:
        print(f"CRITICAL ERROR (Token): {e}")
        return None

def get_flights(token):
    print("✈️ Fetching Flight Data with Token...")
    
    # 2. The Request (Use Token in Header)
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    # Add coordinates for India to keep response small
    params = {
        'lamin': 6.0, 'lomin': 68.0, 
        'lamax': 37.0, 'lomax': 97.0
    }
    
    try:
        response = requests.get(API_URL, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            count = len(data.get('states', []) or [])
            print(f"✅ SUCCESS! Found {count} real flights over India.")
            return data
        else:
            print(f"❌ API Failed: {response.status_code}")
            print(response.text)
            return None
            
    except Exception as e:
        print(f"CRITICAL ERROR (API): {e}")

# --- EXECUTE ---
if __name__ == "__main__":
    token = get_access_token()
    if token:
        get_flights(token)