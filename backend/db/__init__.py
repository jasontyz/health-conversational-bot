import pymongo
from pymongo import mongo_client
import sys

mongo_db_addr = 'mongodb://localhost:27017'

if len(sys.argv) == 2 and sys.argv[-1] in ['--cloud', '-c']:
    print('Using cloud Mongo DB')
    # mongo_db_addr = 'mongodb+srv://covid:covid19@cluster0.hprff.mongodb.net/covidDB?retryWrites=true&w=majority'
    # username: Covid, pw: Covid19
    mongo_db_addr = 'mongodb+srv://Covid:Covid19@cluster0.dpxep.mongodb.net/covidDB?retryWrites=true&w=majority' 

conn = pymongo.MongoClient(mongo_db_addr)
chatbot_db = conn['chatbot']
