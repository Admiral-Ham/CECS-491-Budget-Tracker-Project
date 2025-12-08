# routes/auth_routes.py

from flask import Blueprint, request, jsonify
from services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/register")
def register():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Invalid JSON"}), 400

    response = AuthService.register(data)
    status = 200 if response.get("success") else 400
    return jsonify(response), status


@auth_bp.post("/login")
def login():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Invalid JSON"}), 400

    response = AuthService.login(data)
    status = 200 if response.get("success") else 401  # unauthorized
    return jsonify(response), status
