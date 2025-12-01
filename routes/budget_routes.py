from flask import Blueprint, request, jsonify

# Blueprint allows to organize a flask application into modular reusable components to register the API in main application in order to combine the blueprints into one single application.
# independently made for easier combination into one application inside app.py
budget_bp = Blueprint("budget", __name__)

@budget_bp.get("/budget")
def get_budget():
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"success": False, "message": "budget_id is required"}), 400

    result = BudgetService.get_budget_user(user_id)
    return jsonify(result)
