# routes/budget_routes.py

from flask import Blueprint, request, jsonify
from services.budget_service import BudgetService

budget_bp = Blueprint("budget", __name__)


# -----------------------------------------------------------
# GET BUDGET
# -----------------------------------------------------------
@budget_bp.get("/")
def get_budget():
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"success": False, "message": "user_id required"}), 400

    response = BudgetService.get_or_create_budget(user_id)
    return jsonify(response), 200


# -----------------------------------------------------------
# ADD CATEGORY
# -----------------------------------------------------------
@budget_bp.post("/category")
def add_category():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    category_name = data.get("category_name")

    if not all([user_id, category_name]):
        return jsonify({"success": False, "message": "user_id and category_name required"}), 400

    response = BudgetService.add_category(user_id, category_name)
    status = 200 if response.get("success") else 400
    return jsonify(response), status


# -----------------------------------------------------------
# RENAME CATEGORY
# -----------------------------------------------------------
@budget_bp.put("/category")
def rename_category():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    old_name = data.get("old_name")
    new_name = data.get("new_name")

    if not all([user_id, old_name, new_name]):
        return jsonify({"success": False, "message": "user_id, old_name, new_name required"}), 400

    response = BudgetService.rename_category(user_id, old_name, new_name)
    status = 200 if response.get("success") else 400
    return jsonify(response), status


# -----------------------------------------------------------
# DELETE CATEGORY
# -----------------------------------------------------------
@budget_bp.delete("/category")
def delete_category():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    category_name = data.get("category_name")

    if not all([user_id, category_name]):
        return jsonify({"success": False, "message": "user_id and category_name required"}), 400

    response = BudgetService.remove_category(user_id, category_name)
    status = 200 if response.get("success") else 400
    return jsonify(response), status


# -----------------------------------------------------------
# LIST CATEGORIES
# -----------------------------------------------------------
@budget_bp.get("/categories")
def list_categories():
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"success": False, "message": "user_id required"}), 400

    response = BudgetService.list_categories(user_id)
    return jsonify(response), 200
