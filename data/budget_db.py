class BudgetModel:
  @staticmethod
  def find_by_user_id(user_id):
    return db.budgets.find_one({"user_id": user_id})

  @staticmethod
  def update_budget(budget_id, update_data):
    return db.budgets.update_one({"_id": budget_id}, {"": update_data})
