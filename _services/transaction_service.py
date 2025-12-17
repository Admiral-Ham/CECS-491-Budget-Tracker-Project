# services/transaction_service.py

from data.transactions_model import TransactionsModel
from data.budget_model import BudgetModel


class TransactionService:

    # ---------------------------------------------------------
    # ADD TRANSACTION (with validation + category checking)
    # ---------------------------------------------------------
    @staticmethod
    def add_transaction(user_id: str, category: str, amount, note="") -> dict:
        if not all([user_id, category]):
            return {"success": False, "message": "user_id and category required"}

        try:
            amount = float(amount)
        except:
            return {"success": False, "message": "Amount invalid"}

        if amount <= 0:
            return {"success": False, "message": "Amount must be > 0"}

        # Validate category exists in user's budget
        budget = BudgetModel.find_by_user_id(user_id)
        if not budget or category not in budget.get("categories", []):
            return {"success": False, "message": "Category not in budget"}

        result = TransactionsModel.add_transaction(user_id, category, amount, note)

        if not result.acknowledged:
            return {"success": False, "message": "Failed to add transaction"}

        return {
            "success": True,
            "message": "Transaction added",
        }

    # ---------------------------------------------------------
    # LIST ALL TRANSACTIONS
    # ---------------------------------------------------------
    @staticmethod
    def list_transactions(user_id: str) -> dict:
        txs = TransactionsModel.get_transactions_for_user(user_id)

        # Convert datetime to string
        for t in txs:
            if hasattr(t.get("date"), "isoformat"):
                t["date"] = t["date"].isoformat()

        return {
            "success": True,
            "transactions": txs
        }

    # ---------------------------------------------------------
    # CALCULATE SUMMARY FOR USER
    # ---------------------------------------------------------
    @staticmethod
    def get_summary(user_id: str) -> dict:
        txs = TransactionsModel.get_transactions_for_user(user_id)

        total_spent = sum(t.get("amount", 0) for t in txs)

        by_category = {}
        for t in txs:
            cat = t.get("category_name", "Uncategorized")
            by_category.setdefault(cat, 0)
            by_category[cat] += t.get("amount", 0)

        return {
            "success": True,
            "total_spent": total_spent,
            "by_category": by_category,
            "transaction_count": len(txs),
        }
