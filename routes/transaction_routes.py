# routes/transaction_routes.py

from flask import Blueprint, request, jsonify
from services.transaction_service import TransactionService

transaction_bp = Blueprint("transactions", __name__)


# -----------------------------------------------------------
# ADD TRANSACTION
# -----------------------------------------------------------
@transaction_bp.post("/")
def add_transaction():
    data = request.get_json() or {}

    user_id = data.get("user_id")
    category = data.get("category_name")
    amount = data.get("amount")
    note = data.get("note", "")

    if not all([user_id, category, amount]):
        return jsonify({"success": False, "message": "Missing required fields"}), 400

    response = TransactionService.add_transaction(user_id, category, amount, note)
    status = 200 if response.get("success") else 400

    return jsonify(response), status


# -----------------------------------------------------------
# LIST ALL USER TRANSACTIONS
# -----------------------------------------------------------
@transaction_bp.get("/")
def list_transactions():
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"success": False, "message": "user_id required"}), 400

    response = TransactionService.list_transactions(user_id)
    return jsonify(response), 200


# -----------------------------------------------------------
# SUMMARY (total spent, by-category totals)
# -----------------------------------------------------------
@transaction_bp.get("/summary")
def get_summary():
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"success": False, "message": "user_id required"}), 400

    response = TransactionService.get_summary(user_id)
    return jsonify(response), 200
