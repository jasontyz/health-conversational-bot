
import pymongo
from pymongo import mongo_client

'''
Mongodb Altas - 500MB - free 
tutorial from: https://www.w3schools.com/python/python_mongodb_insert.asp

ALl api: https://docs.mongodb.com/manual/reference/method/db.collection.drop/
'''

# below for testing, if used, then import below in __init__.py
mongo_db_addr = 'mongodb+srv://Covid:Covid19@cluster0.dpxep.mongodb.net/covidDB?retryWrites=true&w=majority' 
conn = pymongo.MongoClient(mongo_db_addr)

class Database:
    """
    Below is quick example for mongodb practice
    """
    def __init__(self):
        
        self.db = conn['testdb'] # testdb for testing only
        print("connected to testdb")

    def insert_one(self, collection, data):
        self.db[collection].insert_one(data)
        print("insert one")

    def find_one(self, collection, query):
        return self.db[collection].find_one(query)

    def find_all(self, collection, query, attributes):

        return self.db[collection].find(query, attributes)

    def reset_collection(self, collection):
        self.db[collection].drop() # reset collection, or mycol.delete_many({})
    
    def reset_database(self):
        print(self.db.list_collection_names())
        for c in self.db.list_collection_names():
            self.reset_collection(c)
    def delete_one(self, collection, query):
        self.db[collection].delete_one(query)


def test():
    
     # Below is quick example for mongodb practice
    db_test = Database()
    data_1 = {
        "first_name": "a",
        "last_name": "a",
        "number": "1"
    }
    data_2 = {
        "first_name": "b",
        "last_name": "b",
        "number": "2"
    }
    data_3 = {
        "first_name": "c",
        "last_name": "c",
        "number": "3"
    }
    data_4 = {
        "first_name": "a",
        "last_name": "d",
        "number": "4"
    }
    collection_name = "first_collection"
    
    #db_test.reset_collection(collection_name)

    try:
        db_test.insert_one(collection_name, data_1)
        db_test.insert_one(collection_name, data_2)
        db_test.insert_one(collection_name, data_3)
        db_test.insert_one(collection_name, data_4)

    except pymongo.errors.DuplicateKeyError:
        # skip document because it already exists in new collection
        print("catch duplicates")
    print("Done insert data...")

    # You get an error if you specify both 0 and 1 values in the same object (except if one of the fields is the _id field):
    res = db_test.find_all(collection_name, {"first_name":"a"}, {"_id":0, "number": 1, "first_name":1}) # get all data with first_name==a and get only the number &first_name attribute
    
    print(list(res))

    # delete
    print("before delete", db_test.db[collection_name].estimated_document_count())
    
    db_test.delete_one(collection_name, data_1)
    print("after delete", db_test.db[collection_name].estimated_document_count())

    # db_test.reset_database()
#test()

def test2():
    db_test = Database()
    data_1 = {
            "first_name": "a",
            "last_name": "a",
            "number": "1"
        }
    collection_name = "test_collection"
    #db_test.insert_one(collection_name, data_1)
    db_test.delete_one(collection_name, data_1)
test2()