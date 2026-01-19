import requests
import json

print("=== Testing Gemini API ===\n")

try:
    response = requests.post(
        'http://localhost:5000/api/gemini/chat',
        json={'message': 'opcvm'},
        headers={'Content-Type': 'application/json'}
    )
    
    print(f"Status Code: {response.status_code}\n")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    
except Exception as e:
    print(f"ERROR: {e}")
