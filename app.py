from flask import Flask, request, jsonify
# blueprints from routes folder, contains API endpoints
# blueprints are used here to register the apps url prefix to flask in order to run the APIs.
from routes.auth_routes import auth_bp
from routes.budget_routes import budget_bp
#from routes.expense_routes import expense_bp
#from routes.
app = Flask(__name__)

# Registering blueprints 
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(budget_bp, url_prefix="/budget")

#testing login api
"""@app.post("/login")
def login():
    data = request.json()
    username = data.get("username")
    password = data.get("password")

    if username == "TechnicSolutions" and password == "1234":
        return jsonify({"success": True, "message": "Login Ok"})
    else:
        return jsonify({"success": False, "message": "Login Failed"})"""

if __name__ == "__main__":
    app.run(debug=True)

