from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

# Create Flask application
app = Flask(__name__)

# Allow KivyMD (mobile or desktop) to access Flask
CORS(app)

# Read MongoDB URI and DB name from environment
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "budgettracker")

# Create MongoDB connection
cluster = "mongodb+srv://technicsolutions:technicsolutions491a@technicsolutions.kpxzyep.mongodb.net/?retryWrites=true&w=majority&appName=TechnicSolutions"
client = MongoClient(cluster)
db = client.budgettracker

# Try connecting to the database
try:
    client.admin.command("ping")
    print("Connected to MongoDB successfully.")
except Exception as e:
    print(f"MongoDB connection failed: {e}")


# ----------------------------
# TEST ENDPOINT — backend health check
# ----------------------------
@app.route("/test", methods=["GET"])
def test():
    """Simple test to ensure backend + DB + front-end all connect."""
    return jsonify({
        "status": "ok",
        "message": "Backend connected",
        "database": DB_NAME
    })


# ----------------------------
# TEST ENDPOINT — returns sample category data
# ----------------------------
@app.route("/categories", methods=["GET"])
def get_categories():
    """Return fake test categories to be consumed by KivyMD"""
    sample_data = [
        {"category": "Rent", "amount": 1250},
        {"category": "Groceries", "amount": 350},
        {"category": "Bills", "amount": 220},
    ]
    return jsonify(sample_data)


# ----------------------------
# Start Flask
# ----------------------------
if __name__ == "__main__":
    app.run(debug=True)