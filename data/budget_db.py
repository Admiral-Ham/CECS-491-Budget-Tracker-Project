from db.data import get_database

transactions = db["transactions"]

def insert_transaction(data: dict):
  return transactions.insert_one(data)

def get_all_transactions():
  return list(transactions.find())

def delete_transaction(transaction_id):
  return transactions.delete_one({"_id": transaction_id})

