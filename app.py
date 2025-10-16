from flask import Flask
from routes.user_routes import user_bp
from routes.expense_routes import expense_bp
from routes.budget_routes import budget_bp
from routes.report import report_bp

app = Flask(__name__) # initialized the flask application for backend

# retrieves the database
db = get_db()

# Register blueprints
app.register_blueprint(user_bp, expense_bp, budget_bp, report_bp)
#endpoint group for api

if __name__ == "__main__":
    app.run(debug=True, port=5000)


