from pymongo import MongoClient

#def get_db(): MongoDB connection setup
client = MongoClient("mongodb+srv://technicsolutions:technicsolutions491a@technicsolutions.kpxzyep.mongodb.net/?retryWrites=true&w=majority&appName=TechnicSolutions")
    # reads the connection string of the mongo client
db = client["budget_tracker"]
    # db object to identify the client and object db imported by other modules



