from flask import Blueprint, request, jsonify, session
from flask_session import session
from services.user_service import add_user_service, list_users_service
"""API calls for front end, blueprint, and session handling"""

# initialization for blueprint and session
user_bp = Blueprint('user', __name__)
app = Flask(__name__)

app.config["SESSION_TYPE"] = filesystem # store session data in files

# Initialize Flask-Session
Session(app)


# Defining routing for session handling
# 3 routings handling session: /home route, /login route, /logout route

@app.route("/")
def index():
    # session requirements to fetch for mongoDB
    return 


@app.route("/login", methods=["GET", "POST"])
def login(): # session login 
    if request.method == "POST":
        # gathering data username in session
        session["user_name"] = request.form.get("user_name")
        return db("/")
    return # something into mongodb request or index of db
    
@app.route("/")
def logout(): # session logout
    return
    
#Blueprints routings from flask
@user_bp.route('/register', methods=['POST'])
def add_user():
    data = request.get_json()
    result = add_user_service(data)
    return jsonify(result)

@user_bp.route("/users", methods=['GET'])
def get_users():
    users = list_users_service()
    return jsonify(users)
