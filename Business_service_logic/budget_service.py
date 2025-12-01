from config.db import db
from datetime import datetime

class BudgetService:

    @staticmethod
    def get_budget_user(user_id):
        budget = BudgetModel.find_by_user_id(user_id)

        if not budget:
            return {"success:" False, "message": "Budget not found"}

        return {
            "success": True,
            "budget": budget
        }
# any other logic to handle here:












"""from config.db import db
from datetime import datetime

default_categories = ["Needs", "Saves", "Wants"] #business logic

def create_budget(user_id, total_amount):
    existing_budget = db.budgets.find_one({"user_id": user_id})
    if existing_budget:
        raise ValueError("Budget already exists for this user")

    budget_document = {
        "user_id": user_id,
        "total_amount": total_amount,
        "categories": default_categories,
        "created_at": datetime.utcnow(),
    }

    if len(budget_document["categories"]) < 1:
        raise ValueError("Budget must have at least one category")

    db.budgets.insert_one(budget_document)
    return {"message": "Budget created successfully"}"""
