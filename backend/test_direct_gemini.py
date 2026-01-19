# Test direct de l'API Gemini
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Charger .env
load_dotenv()

# Configurer
API_KEY = os.getenv('GEMINI_API_KEY')
print(f"API Key loaded: {API_KEY[:20]}..." if API_KEY else "No API key found!")

try:
    genai.configure(api_key=AIzaSyAZAkKTV9ursRD21gBxNPS6sRmRHKHSy0g)
    model = genai.GenerativeModel('gemini-pro')
    
    print("\n=== Testing Gemini API directly ===")
    response = model.generate_content("Dis bonjour en français")
    print(f"✅ SUCCESS!")
    print(f"Response: {response.text}")
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    print(f"Error type: {type(e).__name__}")
