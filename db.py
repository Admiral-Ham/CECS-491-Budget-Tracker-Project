from pymongo import MongoClient
from flask import Flask
from mongokit import Connection, Document

MongoDB_Host = 'local host'
MongoDB_Port = # port number

app = Flask(__name__)
app.config.from_object(__name__)

connection = Connection(app.config['MongoDB_Host'], app.config['MongoDB_Port'])



#def get_db(): MongoDB connection setup
#client = MongoClient("mongodb+srv://technicsolutions:technicsolutions491a@technicsolutions.kpxzyep.mongodb.net/?retryWrites=true&w=majority&appName=TechnicSolutions")
    # reads the connection string of the mongo client
#db = client["budget_tracker"]
    # db object to identify the client and object db imported by other modules



