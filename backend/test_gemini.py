import requests
import json

# Test 1: Health check
print("=== Test 1: Health Check ===")
try:
    response = requests.get('http://localhost:5000/api/gemini/health')
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")
except Exception as e:
    print(f"Error: {e}\n")

# Test 2: Chat request
print("=== Test 2: Chat Request ===")
try:
    response = requests.post(
        'http://localhost:5000/api/gemini/chat',
        json={'message': 'Bonjour'},
        headers={'Content-Type': 'application/json'}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
