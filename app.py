from flask import Flask
from routes.auth_routes import auth_bp
from routes.budget_routes import budget_bp
from routes.expense_routes import expense_bp
from routes.category_routes import category_bp
from routes.report_routes import report_analytics_bp

def create_app():
    app = Flask(__name__)

    # contains api endpoints to establish connection to front end inside Flask upon initialization
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(budget_bp)
    app.register_blueprint(expense_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(report_analytics_bp)


if __name__ == "__main__":
    create_app().run(debug=True)


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

