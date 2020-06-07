from flask import Flask
from flask_cors import CORS
import os
import pymongo


app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.urandom(32)



# mongo = PyMongo(app)
mongo_client = pymongo.MongoClient("redacted")
db = mongo_client.notunihacks

app.config.from_object(__name__)

from app import views
