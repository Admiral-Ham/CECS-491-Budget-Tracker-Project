from flask import Blueprint, request, jsonify
from services.auth_service import AuthService

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.post("/auth/register")
def register():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Invalid JSON"}), 400

    response = AuthService().register(data)
    return jsonify(response)

@auth_bp.post("/login")
def login():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Invalid JSON"}), 400

    response = AuthService().login(data)
    return jsonify(response)
