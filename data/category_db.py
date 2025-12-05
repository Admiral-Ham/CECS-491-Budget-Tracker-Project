#from Category.Model import Category
from data.db import db

#Enforces rule number 5, 6, and 7
# Rule #5: category names can be edited
# Rule #6: Category names must be unique
# Rule #7: if a category is deleted, reassign expenses

def add_category_(user_id, category_name):
    budget = db.budgets.find_one({"user_id": user_id})
    if not budget:
        raise ValueError("Budget not found")

    # Rule 6
    if category_name in budget["categories"]:
        raise ValueError("Category already exists")

    db.budgets.update_one({"user_id": user_id},
                          {"$push": {"categories": category_name}}
    )
    return {"message": f"Category '{category_name}' added successfully"}

def rename_category(user_id, old_category_name, new_category_name):
    # Rule 5
    budget = db.budgets.find_one({"user_id": user_id})
    if not budget or old_category_name not in budget["categories"]:
        raise ValueError("Category not found")

    if new_category_name in budget["categories"]:
        raise ValueError("New Category already exists")

    db.budgets.update_one(
        {"user_id": user_id, "categories": old_category_name},
        {"$set: {categories.$": new_category_name}
    )
    return {"message": f"Category '{new_category_name}' renamed successfully"}

def delete_category(user_id, category_name, reassign_to):
    # Rule 7
    db.budgets.update_one(
        {"user_id": user_id},
         {"$pull": {"categories": category_name}}
    )

    # reassign expenses
    db.transactions.update_many(
        {"user_id": user_id, "category": category_name},
        {"$set": {"category": reassign_to}}
    )
    return {"message": f"Category '{category_name}' deleted successfully and reassigned to '{reassign_to}'"}
