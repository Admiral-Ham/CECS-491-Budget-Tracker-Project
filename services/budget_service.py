# services/budget_service.py

from data.budget_model import BudgetModel


class BudgetService:

    @staticmethod
    def get_or_create_budget(user_id: str) -> dict:
        """Returns the user's budget or creates one if not found."""
        budget = BudgetModel.find_by_user_id(user_id)

        if not budget:
            BudgetModel.create_budget(user_id, name="Default Budget")
            budget = BudgetModel.find_by_user_id(user_id)

        budget["_id"] = str(budget["_id"])
        return {"success": True, "budget": budget}

    @staticmethod
    def add_category(user_id: str, category: str) -> dict:
        """Add a category ensuring uniqueness."""
        if not category:
            return {"success": False, "message": "Category name required"}

        budget = BudgetModel.find_by_user_id(user_id)
        if not budget:
            BudgetModel.create_budget(user_id, "Default Budget")
            budget = BudgetModel.find_by_user_id(user_id)

        categories = budget.get("categories", [])

        if category in categories:
            return {"success": False, "message": "Category already exists"}

        BudgetModel.add_category_budget(user_id, category)
        updated = BudgetModel.find_by_user_id(user_id)
        updated["_id"] = str(updated["_id"])

        return {
            "success": True,
            "message": f"Category '{category}' added",
            "budget": updated
        }

    @staticmethod
    def rename_category(user_id: str, old: str, new: str) -> dict:
        """Renames a category and ensures it doesn't conflict."""
        if not all([old, new]):
            return {"success": False, "message": "Both names required"}

        budget = BudgetModel.find_by_user_id(user_id)
        if not budget:
            return {"success": False, "message": "Budget not found"}

        categories = budget.get("categories", [])

        if old not in categories:
            return {"success": False, "message": "Category to rename not found"}

        if new in categories:
            return {"success": False, "message": "New category already exists"}

        BudgetModel.rename_category_in_budget(user_id, old, new)
        updated = BudgetModel.find_by_user_id(user_id)
        updated["_id"] = str(updated["_id"])

        return {
            "success": True,
            "message": f"Category renamed to '{new}'",
            "budget": updated
        }

    @staticmethod
    def remove_category(user_id: str, category: str) -> dict:
        """Removes a category without deleting transactions."""
        budget = BudgetModel.find_by_user_id(user_id)

        if not budget:
            return {"success": False, "message": "Budget not found"}

        categories = budget.get("categories", [])
        if category not in categories:
            return {"success": False, "message": "Category not found"}

        BudgetModel.remove_category_budget(user_id, category)
        updated = BudgetModel.find_by_user_id(user_id)
        updated["_id"] = str(updated["_id"])

        return {
            "success": True,
            "message": f"Category '{category}' removed",
            "budget": updated
        }

    @staticmethod
    def list_categories(user_id: str) -> dict:
        """Return list of category strings for user."""
        categories = BudgetModel.get_all_categories(user_id, None)
        return {"success": True, "categories": categories or []}
