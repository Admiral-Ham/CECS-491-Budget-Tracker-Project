from flask import Blueprint, request, jsonify
# Blueprint allows to organize a flask application into modular reusable components to register the API in main application in order to combine the blueprints into one single application.
# independently made for easier combination into one application inside app.py
category_bp = Blueprint("category", __name__)

@category_bp.get("/categories")
def get_categories():
    categories = ["Food", "Rent", "Transport", "Personal" ]

    return jsonify({
        "success": True,
        "categories": categories
    })