from flask import Blueprint, request, jsonify
# Blueprint allows to organize a flask application into modular reusable components to register the API in main application in order to combine the blueprints into one single application.
# independently made for easier combination into one application inside app.py
transaction_bp = Blueprint("transaction", __name__)

@transaction_bp.get("/transaction")
def get_expense():
    budget_id = request.args.get("budget_id")

    if not budget_id:
        return jsonify({"success": False, "message": "budget_id is required"}), 400

    return jsonify({
        "success": True,
        "budget_id": budget_id,
        "expenses": [] #list of expenses
    })
