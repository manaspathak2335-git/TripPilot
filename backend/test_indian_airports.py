import requests
import json

def test_indian_airports():
    """Test if API returns Indian airports"""
    try:
        response = requests.get('http://localhost:8000/api/airports', timeout=10)
        data = response.json()
        airports = data.get('airports', [])
        
        print(f"Total airports returned: {len(airports)}")
        
        if airports:
            print("\nFirst 10 airports:")
            for i, ap in enumerate(airports[:10], 1):
                print(f"  {i}. {ap.get('code')}: {ap.get('name')}")
                print(f"     City: {ap.get('city')}, Country: {ap.get('country')}")
                print(f"     Location: {ap.get('lat')}, {ap.get('lng')}")
                print()
            
            # Count Indian airports
            indian_count = len([a for a in airports if 'India' in str(a.get('country', ''))])
            print(f"Indian airports: {indian_count} out of {len(airports)}")
            
            if indian_count > 0:
                print("\n[SUCCESS] Indian airports are being returned!")
            else:
                print("\n[WARNING] No Indian airports found in response")
        else:
            print("\n[ERROR] No airports returned")
            
    except Exception as e:
        print(f"[ERROR] {e}")

if __name__ == "__main__":
    test_indian_airports()

