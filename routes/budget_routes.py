from flask import Blueprint, request, jsonify
# Blueprint allows to organize a flask application into modular reusable components to register the API in main application in order to combine the blueprints into one single application.
# independently made for easier combination into one application inside app.py
budget_bp = Blueprint("budget", __name__)

@budget_bp.route("/budgets", methods=["GET"])
def get_budget(budget_id):
    if request.method == budget_id:
        total_amount = request.args.get("amount")
        if total_amount is None:
            return jsonify({"success": False, "message": "Invalid JSON"}), 400
        else:
            total_amount = float(total_amount)
            return total_amount, budget_id

    #parse data to request data from specific resource
    # can only request data but not modify
    return jsonify({"budget": 0, "status": "ok"})

