import requests
import os
import sys
from dotenv import load_dotenv

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables
load_dotenv()

AVIATIONSTACK_API_KEY = os.getenv("AVIATIONSTACK_API_KEY")

def test_aviationstack_api():
    """Test AviationStack API key and fetch airports in India"""
    
    if not AVIATIONSTACK_API_KEY:
        print("[ERROR] AVIATIONSTACK_API_KEY not found in .env file!")
        print("   Please add it to backend/.env file:")
        print("   AVIATIONSTACK_API_KEY=your_api_key_here")
        return False
    
    masked_key = f"{AVIATIONSTACK_API_KEY[:10]}...{AVIATIONSTACK_API_KEY[-4:]}" if len(AVIATIONSTACK_API_KEY) > 14 else "***"
    print(f"[TEST] Testing AviationStack API with key: {masked_key}")
    print()
    
    try:
        url = "http://api.aviationstack.com/v1/airports"
        params = {
            'access_key': AVIATIONSTACK_API_KEY,
            'country_code': 'IN',
            'limit': 10  # Just test with 10 airports first
        }
        
        print("[FETCH] Fetching airports in India from AviationStack...")
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check if request was successful
            if 'error' in data:
                error_info = data.get('error', {})
                print(f"[ERROR] API Error: {error_info.get('info', 'Unknown error')}")
                if 'code' in error_info:
                    print(f"   Error Code: {error_info['code']}")
                if error_info.get('code') == 101:
                    print("   This usually means: Invalid API key or subscription plan doesn't allow this endpoint")
                return False
            
            if 'data' in data:
                airports = data['data']
                print(f"[SUCCESS] Found {len(airports)} airports")
                print()
                print("Sample airports:")
                for i, airport in enumerate(airports[:5], 1):
                    print(f"  {i}. {airport.get('airport_name', 'N/A')}")
                    print(f"     Code: {airport.get('iata_code', 'N/A') or airport.get('icao_code', 'N/A')}")
                    print(f"     City: {airport.get('city_name', 'N/A')}")
                    print(f"     Location: {airport.get('latitude', 'N/A')}, {airport.get('longitude', 'N/A')}")
                    print()
                
                # Test full fetch
                # Check if these are actually Indian airports
                indian_airports = [ap for ap in airports if ap.get('country_name') == 'India' or ap.get('country_code') == 'IN']
                print(f"[INFO] Indian airports in response: {len(indian_airports)} out of {len(airports)}")
                
                if indian_airports:
                    print("\nIndian airports found:")
                    for i, airport in enumerate(indian_airports[:5], 1):
                        print(f"  {i}. {airport.get('airport_name', 'N/A')}")
                        print(f"     Code: {airport.get('iata_code', 'N/A') or airport.get('icao_code', 'N/A')}")
                        print(f"     City: {airport.get('city_name', 'N/A')}")
                        print(f"     Country: {airport.get('country_name', 'N/A')}")
                        print()
                
                # Test full fetch
                print("[TEST] Testing full fetch (up to 100 airports)...")
                params['limit'] = 100
                full_response = requests.get(url, params=params, timeout=10)
                if full_response.status_code == 200:
                    full_data = full_response.json()
                    if 'data' in full_data:
                        total_count = len(full_data['data'])
                        indian_count = len([ap for ap in full_data['data'] if ap.get('country_name') == 'India' or ap.get('country_code') == 'IN'])
                        print(f"[SUCCESS] Full fetch successful! Total airports: {total_count}")
                        print(f"[INFO] Indian airports: {indian_count}")
                    else:
                        print("[WARNING] Full fetch returned no data")
                else:
                    print(f"[WARNING] Full fetch returned status {full_response.status_code}")
                
                return True
            else:
                print("[ERROR] No 'data' field in response")
                print(f"   Response: {data}")
                return False
        else:
            print(f"[ERROR] API Request Failed!")
            print(f"   Status Code: {response.status_code}")
            print(f"   Response: {response.text}")
            
            if response.status_code == 101:
                print("   This means: Invalid API access key")
            elif response.status_code == 103:
                print("   This means: API functionality not available for your subscription plan")
            elif response.status_code == 104:
                print("   This means: Monthly usage limit exceeded")
            
            return False
            
    except requests.exceptions.Timeout:
        print("[ERROR] Connection Timeout: The API took too long to respond")
        return False
    except requests.exceptions.ConnectionError:
        print("[ERROR] Connection Error: Could not connect to AviationStack API")
        print("   Check your internet connection")
        return False
    except Exception as e:
        print(f"[ERROR] Unexpected Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("AviationStack API Key Test")
    print("=" * 60)
    print()
    
    success = test_aviationstack_api()
    
    print()
    print("=" * 60)
    if success:
        print("[PASS] TEST PASSED - API Key is working!")
    else:
        print("[FAIL] TEST FAILED - Please check your API key")
    print("=" * 60)

