from pydantic import EmailStr
from datetime import datetime, UTC
from random import randint
import json
from bson  import Decimal128
from decimal import Decimal

from user_document import User
from budget_document import Budget
from category_document import Category
from transaction_document import Transaction
from goal_document import Goal

from pymongo import AsyncMongoClient
import asyncio
from beanie import init_beanie

budget_names = ["Jan1", "Feb", "March", "April", "July"]

category_names = ["Rent", "Car", "Streaming", "Food", "Takeout", "Date"]

user_doc = {
    "name": str,
    "password_hash": str,
    "email": EmailStr,
    "creation_time": datetime
}

names = {
    "first": [
        "Liam",
        "Olivia",
        "Noah",
        "Emma",
        "Elijah",
        "Ava",
        "William",
        "Sophia",
        "James",
        "Isabella"
    ],
    "last": [
        "Anderson",
        "Martinez",
        "Thompson",
        "Rodriguez",
        "Kim",
        "Patel",
        "Garcia",
        "Nguyen",
        "Brown",
        "Davis"
    ]
}

password_hashes = [
    "d0,3@a.ac0,d,!,D,!,c",
    "cBcdAdD.0,!0CbaDccC,",
    "@A.01A.CC12d2bB..BB0",
    "bDaBddcA.,!C,D.adCDD",
    "2C,3.1D,b22ABB0C2a1C",
    "A1D20A1.aBdB2d!Bab3d",
    "a!2BCBb.bdaBC!1,bCCD",
    "1..!33@3Bab2!d@@23Da",
    "2A,@1dCBD0dCd2Bb3!3.",
    "BC,3ddc1bDC231B1DB.B"
]

email_ending = "@gmail.com"

def random_pwds(p_hash: list, name: str, email:str):
    ran_pwd = randint(0, len(p_hash) - 1)
    return hash(email + str(hash(p_hash[ran_pwd] + str(hash(name)))))
    
def randon_person(names:dict):
    name = ""
    first = randint(0, len(names["first"])- 1)
    last = randint(0, len(names["last"]) - 1)
    return f"{names["first"][first]} {names['last'][last]}"

def gen_email(person, email_ending):
    first_name, last_name = person.split()
    email = first_name + last_name + email_ending
    return email

def gen_user_dict(name, password_hash, email):
    doc = {
    "name": name,
    "password_hash": str(password_hash),
    "email": email,
    "creation_time": datetime.now(UTC)
    }
    return doc

def gen_budget_dict(name_id, name = "Unnamed Budget"):
    budget_doc = {
    "user_id": name_id,
    "name": name,
    "creation_time": datetime.now(UTC)
    }
    return budget_doc

def gen_category_dict(b_id, name = "Unnamed Category", limit=0, spent=0):
    doc = {
    "budget_id":    b_id,
    "name":         name,
    "limit":        limit,
    "spent":        spent,
    "creation_time": datetime.now(UTC)
    }
    return doc

def gen_transaction_dict(u_id,g_id = None, b_id = None, c_id = None, amount=0, name= "Unnamed Transaction"):
    doc = {
    "user_id": u_id,
    "goal_id": g_id,
    "budget_id": b_id,
    "category_id": c_id,
    "note": name,
    "amount": amount,
    "creation_time": datetime.now(UTC)
    }
    return doc

def gen_goal_dict(name, password_hash, email):
    doc = {
    "name": name,
    "password_hash": str(password_hash),
    "email": email,
    "creation_time": datetime.now(UTC)
    }
    return doc

def gen_list_user_dict(names,password_hashes, email_ending, number: int):
    user_list = []
    for i in range(number):
        name = randon_person(names)
        email = gen_email(name, email_ending)
        password = random_pwds(password_hashes, name, email)

        user_doc = gen_user_dict(name, password, email)
        user_list.append(user_doc)
    return user_list

def random_money(min_val=0, max_val=1):
    if isinstance(min_val, Decimal128):
        min_val = min_val.to_decimal()
    if isinstance(max_val, Decimal128):
        max_val = max_val.to_decimal()

    min_val = Decimal(str(min_val))
    max_val = Decimal(str(max_val))
    return Decimal(randint(int(min_val * 100), int(max_val * 100))) / Decimal(100)

def normalize_decimal(value):
    if isinstance(value, Decimal128):
        return value.to_decimal()
    return Decimal(value)

def subtract_amount(current, incoming):
    current = normalize_decimal(current)
    incoming = normalize_decimal(incoming)
    print(f"current: {current}, type: {type(current)}\n incoming: {incoming}, type: {type(incoming)}")
    return current - incoming

def write_dicts(filename, dict_list):
    with open(filename, "w") as f:
        for d in dict_list:
            f.write(json.dumps(d) + "\n")

def print_options():
    print(f'Options ')
    print(f'1. Generate User ')
    print(f'2. Exit ')
    return 

def menu(file_name, names, password_hashes, email_ending):
    running = True
    option = 0
    users = []
    while running:
        print_options()
        option = input("Select an Option: ")
        if option == "1":
            number = int(input("How many users do you want to generate: "))
            users = gen_list_user_dict(names, password_hashes, email_ending, number)
        elif option == '2':
            print("Program ended.\n")
            #write_dicts(file_name, users)
            running = False
    return 0

def print_list(list):
    if len(list) == 0:
        print("Empty List")
    for x in list:
        print(f"{x}\n")

async def create_upload_user_docs():
    number = 10
    users_lists = gen_list_user_dict(names, password_hashes, email_ending, number)
    print(f"Users:")
    for user in users_lists:
        print(f"User: {user}\n")

    users = [User(**data) for data in users_lists]
    await User.insert_many(users)
    
    print("\nInserted Users Successfully")

async def main():
    client = AsyncMongoClient("mongodb+srv://alberts_db_user....@testdatabase.1axf3iy.mongodb.net/")
    db = client["test"]

    await init_beanie(
        database=db,
        document_models=[User,Budget, Category, Transaction,Goal]
    )

    print(f"\nConnected Sucessfully\n")

    print("Getting Users Documents\n")
    users = await User.find_all().to_list()

    """budget_data = {
        "user_id":        users[0].id,
        "name":           "June",
        "creation_time":  datetime.now(UTC)
    }
    print("Inserting Budget data")
    budget = Budget(**budget_data)
    await budget.insert()"""
    print(f"User Name = {users[0].name}")
    
    print(f"Number of User documents found: {len(users)}")
    
    budgets = await Budget.find(Budget.user_id.id == users[0].id).project(Budget.
    BudgetProjection).to_list()
    
    budgets_docs = await Budget.find(Budget.user_id.id == users[0].id).to_list()

    print(f"Budget Docs:\n")
    print_list(budgets_docs)
    budgets_list = [x.model_dump_json() for x in budgets]
    buds = 0

    print(f'Found Budget Sucessfully\nNumber of Budgets found: {len(budgets_docs)}')
    print_list(budgets_list)
    spent = randint(0, 999)
    
    #Generating And Inserting Categories
    category_dict = gen_category_dict(budgets_docs[0].id, category_names[randint(0, len(category_names) - 1)], randint(spent, 1000), spent)
    print("Inserting Category data\n")
    cat = Category(**category_dict)
    #await cat.insert()
    print("Insert Successful\n")
    print(f"Cat Budget_id = {budgets_docs[0].id}\nCat Dict = {category_dict["budget_id"]}\n")
    
    print(f"Testing Category find\n")
    cats = await Category.find(Category.budget_id.id == budgets_docs[0].id).project(Category.CatProjection).to_list()
    cats_doc = await Category.find(Category.budget_id.id == budgets_docs[0].id).to_list()

    print(f'Found Cat Sucessfully\n')
    print(f"Number of Cats found: {len(cats)}")
    print(f"Cat docs found: {len(cats_doc)}\n")
    cats_list = [x.model_dump_json() for x in cats]
    print_list(cats_list)

    # spent = random_money(min_val= 10,max_val= cats_doc[0].spent)
    print(f"{cats_doc[0].spent}")
    spent = subtract_amount(cats_doc[0].spent, Decimal("40.63"))
    # Transactions Part
    print(f"Transactions begin")
    """t_dict = gen_transaction_dict(users[0].id, b_id = budgets_docs[0].id,c_id= cats_doc[0].id, name= "Gas" , amount= spent)
    tran = Transaction(**t_dict)
    print(f"Attempting Insertion of Transaction Doc")
    await tran.insert()
    print(f"Sucessful Transaction Doc Insertions")"""
    print(f"Get Transactions Based on Category")
    trans = await Transaction.find(Transaction.category_id.id == cats_doc[0].id).to_list()
    print_list(trans)

if __name__ == "__main__":
    asyncio.run(main()) 

