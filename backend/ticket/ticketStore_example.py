import pymongo
from bson.objectid import ObjectId
from pymongo import mongo_client

mongo_db_addr = 'mongodb+srv://covid:covid19@cluster0.hprff.mongodb.net/covidDB?retryWrites=true&w=majority'
conn = pymongo.MongoClient(mongo_db_addr)
chatbot_db = conn['chatbot']

def test():
    
    ticket = {
        "Id" : "123",
        "PatientID" : "456",
        "DoctorID" : "2332",
        "message" : "hello",
        "response" : "none"
    }


    r = chatbot_db.tickets.insert_one({
            "PatientID" : "456",
            "DoctorID" : "2332",
            "message" : "hello",
            "response" : "none",
            "_id" :ObjectId()
        }
    )
    r = chatbot_db.tickets.insert_one({
            "PatientID" : "426",
            "DoctorID" : "2332",
            "message" : "hello1",
            "response" : "none",
            "_id" :ObjectId()
        }
    )
    result = chatbot_db.tickets.find({},{
        "DoctorID": "2332"
    })
    for x in result:
        rnd_id = str(x['_id'])
        print(str(x['_id']))
    
    result = chatbot_db.users.find({},{
        "role": "doctor"
    })
    doctors = []
    for x in result:
        doctors.append(x)
    import random
    pick = random.randint(0,len(doctors)-1)
    print(str(doctors[pick]))

    result = chatbot_db.tickets.find({
        "_id": ObjectId(rnd_id)
    })
    print(list(result)[0])

    # collection_name = "first_collection"
    colls = chatbot_db.list_collection_names()
    print(colls)
    chatbot_db.drop_collection("tickets")
    colls = chatbot_db.list_collection_names()
    print(colls)
if __name__ == "__main__":
    test()