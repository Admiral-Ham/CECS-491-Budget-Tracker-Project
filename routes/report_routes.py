from flask import Blueprint, request, jsonify

# Blueprint allows to organize a flask application into modular reusable components to register the API in main application in order to combine the blueprints into one single application.
# independently made for easier combination into one application inside app.py
report_analytics_bp = Blueprint("report_analytics", __name__)


@report_analytics_bp.get("/report")
def get_report():
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"success": False, "message": "user_id is required"}), 400

     return jsonify({
        "success": True,
        "user_id": user_id,
        "summary": {
            "monthly_spending": 520.00,
            "savings": 230.00,
            "category_breakdown": {}
        }
    })
