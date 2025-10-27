from pymongo import MongoClient

cluster = "mongodb+srv://technicsolutions:technicsolutions491a@technicsolutions.kpxzyep.mongodb.net/?retryWrites=true&w=majority&appName=TechnicSolutions"
client = MongoClient(cluster)
db = client.budgettracker

# Assigns the "userinfo" collection to collection
collection = db.userinfo


# DO THIS FIRST DO THIS FIRST DO THIS FIRST
# Use this to see if you successfully connected
try:
    client.admin.command('ping')
    print("Connected to MongoDB")
except Exception as e:
    print(f"Failed to connect with exception {e}")





# Test dataset
datatest = {
  "_id": "userid",
  "name": "nametest",
  "email": "eemail",
  "password_hash": "pass",
  "creation_time": "2025-09-24",
  "transactions": [
    {
      "transaction_id": "trans_id_1",
      "amount": "200.00",
      "type": "expense",
      "category": {
        "category_id": "cat_id_1",
        "name": "Groceries",
        "type": "expense"
      },
      "date": "2025-09-23T10:00:00Z",
      "note": "Weekly grocery shopping"
    }
  ],
  "goals": [
    {
      "goal_id": "goal_id_1",
      "target_amount": 1000.00,
      "current_progress": 250.00,
      "start_date": "2025-09-01T00:00:00Z",
      "end_date": "2025-12-31T23:59:59Z",
      "name": "New Car Fund"
    }
  ],
  "analytics": {
    "total_income": 2000.00,
    "total_expense": 1500.00,
    "savings": 500.00,
    "breakdown_by_category": [
      {
        "category_name": "Groceries",
        "total_amount": 300.00
      },
      {
        "category_name": "Rent",
        "total_amount": 1000.00
      }
    ],
    "daily_monthly_yearly": {
      "daily": {
        "2025-09-24": {
          "income": 100.00,
          "expense": 50.00
        }
      },
      "monthly": {
        "2025-09": {
          "income": 2000.00,
          "expense": 1500.00
        }
      },
      "yearly": {
        "2025": {
          "income": 2000.00,
          "expense": 1500.00
        }
      }
    }
  }
}

# Create a document with everything in "datatest"
def insert_doc(dataset):
    print(f"Inserted document with ID: {collection.insert_one(dataset).inserted_id}")

# Delete a document with a specific ID
def delete_doc(del_id):
    collection.delete_one({"_id": del_id})
    print(f"Deleted document with ID: {del_id}")

# # I use this to restart my test dataset by deleting the second option and just inserting
#
# # The plan is to change up the functions so they will work universally and not just the test dataset
# choice = int(input("Please select an option:\n1. Insert a document with a specific ID\n"
#                    "2. Delete a document with a specific ID\n\n"))
# if choice == 1:
#     insert_doc(datatest)
# elif choice == 2:
#     temp = []
#     for index, each in (enumerate(collection.find({"_id": {"$exists": True}}))):
#         temp.append(each["_id"])
#         print(f"{index + 1}. ID: {each["_id"]}\n   Username: {each['name']}\n")
#     to_delete = int(input("Please select which document to delete."))
#     delete_doc(temp[to_delete - 1])





# # WIP trying to update a specific item in a collection
#
# cursor = collection.find({"_id": "userid"})
# every = list(cursor)
# data = every[0]
# test = list(data)
# upd_filter = []
#
# for index, x in enumerate(data):
#     print(f"{index + 1}: {x}")
# choice = int(input("\nchoice: ")) - 1
# next_temp = list(data.values())[choice]
# while type(next_temp) is list or type(next_temp) is dict:
#     print(f"next: {upd_filter}")
#     if type(next_temp) is dict:
#         print("dict") # just used to know where im at
#         for index, x in enumerate(next_temp):
#             print(f"{index + 1}: {x}")
#         choice = int(input("\nchoice: ")) - 1
#         print(next_temp)
#         next_temp = list(next_temp.items())[choice]
#     else:
#         print("list") # just used to know where im at
#         for index, x in enumerate(next_temp[0]):
#             print(f"{index + 1}: {x}")
#         choice = int(input("\nchoice: ")) - 1
#         print(next_temp)
#         next_temp = list(next_temp[0].items())[choice]
# change = input(f"\"{next_temp[0]}\" is currently \"{next_temp[1]}\"\n What would you like to change it to: ")
# print(upd_filter) # Just used to see what it is
#
# # *** {"_id": "userid"} is temporary and is used to find the test dataset I added
# # *** next_temp[0] is where I would add the transactions.category.name part to
# #     specify what I want changed
# # *** change is just what im changing it to
# collection.update_one({"_id": "userid"}, {"$set": {next_temp[0]: change}})
