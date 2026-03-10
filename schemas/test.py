from pydantic import EmailStr
from datetime import datetime, UTC
from random import randint
import json

from user_document import User
from budget_document import Budget
from category_document import Category
#from transaction_document import Transaction

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

def gen_transaction_dict(u_id,g_id = None, b_id= None, name= "Unnamed Transaction"):
    doc = {
    "u_id": name,
    "g_id": name,
    "b_id": name,
    "c_id": name,
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
    client = AsyncMongoClient("mongodb+srv://alberts_db_user:....@testdatabase.1axf3iy.mongodb.net/")
    db = client["test"]

    await init_beanie(
        database=db,
        document_models=[User,Budget, Category]
    )

    
    print(f"\nConnected Sucessfully\n")

    print("Getting Users Documents")
    users = await User.find_all().to_list()


    """budget_data = {
        "user_id":        users[0].id,
        "name":           "June",
        "creation_time":  datetime.now(UTC)
    }
    print("inserting Budget data")
    budget = Budget(**budget_data)
    await budget.insert()
    print(f"User Name = {users[0].name}")
    """
    
    budgets = await Budget.find(Budget.user_id.id == users[0].id).project(Budget.
    BudgetProjection).to_list()
    budgets_list = [x.model_dump_json() for x in budgets]
    buds = 0

    print(f'Found Budget Sucessfully')
    for x in budgets_list:
        print(f"{x}\n")
    
    category_dict = gen_category_dict(budgets[0].id, category_names[randint(0, len(category_names) -1)], 1000, 200)
    print("Inserting Category data")
    cat = Category(**category_dict)
    await cat.insert()
    cats = await Category.find(Category.budget_id.id == budgets[0].id).project(Category.
    CatProjection).to_list()
    cats_list = [x.model_dump_json() for x in cats]
    
    print(f'Found Cat Sucessfully')
    for x in cats_list:
        print(f"{x}\n")

if __name__ == "__main__":
    asyncio.run(main()) 

