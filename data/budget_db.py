from data.db import db
from datetime import datetime
from schemas.budget_schema import Budget
from pydantic import ValidationError

class BudgetModel():

  @staticmethod
  def find_by_user_id(user_id: str):
    """
    Docstring for find_by_user_id
    
    :param user_id: User ID in string from
    :type user_id: str
    """
    return db.budgets.find_one({"user_id": user_id})
  
  @staticmethod
  def update_budget(user_id: str, update_data):
    return db.budgets.update_one({"user_id": user_id}, {"$set": update_data})
  
  @staticmethod
  def create_budget(user_id: str, name: str = "Unnamed Budget", total = 0):
    budget_doc = {
      "user_id": user_id, #Primary key
      "name": name,       #Primary Key
      "total_amount": total,
      "categories": [],
      "created_on": datetime.utcnow()
    }
    try:
      valid_budget = Budget.model_validate(budget_doc)
      valid_budget = valid_budget.model_dump(by_alias=True, exclude_none=True)
      return db.budgets.insert_one(valid_budget)
    except ValidationError as e:
      print("Validation error: ", e)

  @staticmethod
  def add_collection_budget(user_id: str, category_name: str):
    """
    Docstring for add_collection_budget
    
    :param user_id: String Version of User Object ID
    :type user_id: str
    :param category_name: String of Added Category
    :type category_name: str
    """
    return db.budgets.update_one({"user_id": user_id}, {"$addToSet": {"categories": category_name}}, upsert=False)
  
  @staticmethod
  def rename_collection_in_budget(user_id: str, category_name: str, new_name: str):
    """
    Docstring for rename_collection_in_budget
    
    :param user_id: Description
    :type user_id: str
    :param category_name: Description
    :type category_name: str
    :param new_name: Description
    :type new_name: str
    """
    return db.budgets.update_one({"user_id": user_id, "categories": category_name}, {"$set": {"categories.$": new_name}}, upsert=False)
  
  @staticmethod
  def remove_collection_budget(user_id: str, category_name: str):
    """
    Docstring for remove_collection_budget
    
    :param user_id: Description
    :type user_id: str
    :param category_name: Description
    :type category_name: str
    """
    return db.budgets.update_one({"user_id": user_id}, {"$pull": {"categories": category_name}}, upsert=False)
  
  @staticmethod
  def get_all_categories(user_id: str, category_name: str):
    budget = db.budgets.find_one({"user_id": user_id})
    categories = budget.get("categories")
    return categories