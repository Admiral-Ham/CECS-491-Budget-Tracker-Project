from flask import Blueprint, request, jsonify

# Blueprint allows to organize a flask application into modular reusable components to register the API in main application in order to combine the blueprints into one single application.
# independently made for easier combination into one application inside app.py
report_analytics_bp = Blueprint("report_analytics", __name__)


@report_analytics_bp.route("/report_analytics", methods=["GET"])
def get_report_analytics(user_id):
    if request.method == user_id:
        user_id = request.args.get("user_id")
        if user_id is None:
            return jsonify({"success": False, "message": "Invalid JSON"}), 400
    else:
        user_id = request.args.get("user_id")
        return jsonify({"success": True, "message": "Valid user_id"}),
    return user_id