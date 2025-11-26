from flask import Flask
from routes.category_routes import category_bp
from routes.expenses_routes import expense_bp

def start_app():
    app = Flask(__name__) # initialized the flask application for backend

# Register blueprints
app.register_blueprint(user_bp, category_bp, expense_bp, budget_bp, report_bp)
#endpoint group for api
return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
    


