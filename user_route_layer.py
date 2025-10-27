from flask import Blueprint, request, jsonify
from services.user_service import add_user_service, list_users_service
"""API calls for front end, blueprint, and session handling"""

user_bp = Blueprint('user', __name__)

@user_bp.route('/register', methods=['POST'])
def add_user():
    data = request.get_json()
    result = add_user_service(data)
    return jsonify(result)

@user_bp.route("/users", methods=['GET'])
def get_users():
    users = list_users_service()
    return jsonify(users)
