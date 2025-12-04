from config.db import db
from bson.objectid import ObjectId

categories_col = db["categories"]

def insert_many(categories):
"""insert list of category documents (list of dictionaries)"""
  db.posts.insert_Many()

def insert_one(cat_doc):
"""insert a single category document"""

def find_by_budget_and_name(budget_id, name):
"""return category doc matching name within a budget"""

def find_by_id(cat_id):
"""return a category by its _id"""

def find_by_budget(budget_id):
"""return list of categories for a budget"""

def update_name(cat_id, new_name):
"""update only the name field of a category"""

def delete(cat_id):
"""delete a category document"""  
