from flask import Blueprint, request, jsonify
# Blueprint allows to organize a flask application into modular reusable components to register the API in main application in order to combine the blueprints into one single application.
# independently made for easier combination into one application inside app.py
expense_bp = Blueprint("expense", __name__)

@expense_bp.route("/expense", methods=["GET"])
def get_expense(budget_id):
    if request.method == budget_id:
        budget_id = request.args.get("budget_id")
        if budget_id is None:
            return jsonify({"success": False, "message": "Invalid JSON"}), 400
    else:
        budget_id = request.args.get("budget_id")
        return jsonify({"success": True, "message": "Invalid JSON"})
    return budget_id


    #parse data to request data from specific resource
    # can only request data but not modify
