import requests

BASE_URL = "http://127.0.0.1:5000"   # Flask server


def test_connection():
    """Ping the Flask server to verify connectivity."""
    try:
        response = requests.get(f"{BASE_URL}/test")
        return response.json()
    except:
        return {"status": "error", "message": "Cannot reach backend"}


def get_categories():
    """Get sample categories from Flask backend."""
    try:
        response = requests.get(f"{BASE_URL}/categories")
        return response.json()
    except:
        return []