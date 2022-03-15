from bson.objectid import ObjectId
import random

from db import chatbot_db
from datetime import datetime


def pick_doctor():
    result = chatbot_db.users.find({"role": "doctor"})
    doctors = []
    for x in result:
        doctors.append(x)

    pick = random.randint(0, len(doctors) - 1)
    return str(doctors[pick]["_id"])


#add to the mongodb
def add_ticket(patient, message):
    doctor = pick_doctor()
    print(f"doctor id :{doctor}")
    t = {
        "patient_id": patient,
        "doctor_id": doctor,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "message": message,
    }
    print(t)
    res = chatbot_db.tickets.insert_one(t)
    return res


def find_by_doctor(doctor):
    doctor = str(doctor)
    returnID = []
    for x in chatbot_db.tickets.find({}, {"doctor_id": doctor}):
        returnID.append(str(x['_id']))
    return returnID


def find_by_id(id):
    result = chatbot_db.tickets.find({"_id": ObjectId(id)})
    return list(result)[0]


def find_by_patient(patient):
    patient = str(patient)
    returnID = []
    for x in chatbot_db.tickets.find({}, {"patient_id": patient}):
        returnID.append(str(x['_id']))
    return returnID[0]


def reply_ticket(id, message):
    # print(id)
    chatbot_db.tickets.update_one({"_id": ObjectId(id)},
                                  {"$set": {
                                      "response": message
                                  }})
