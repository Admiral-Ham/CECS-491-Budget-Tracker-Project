# routes/auth_routes.py

from flask import Blueprint, request, jsonify
from services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    """Register a new user using AuthService."""
    data = request.get_json() or {}
    response = AuthService.register(data)
    status = 200 if response.get("success") else 400
    return jsonify(response), status


@auth_bp.post("/login")
def login():
    """User login endpoint."""
    data = request.get_json() or {}
    response = AuthService.login(data)
    status = 200 if response.get("success") else 401
    return jsonify(response), status
