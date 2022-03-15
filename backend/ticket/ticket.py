import pymongo
from bson.objectid import ObjectId
class Ticket():
    def __init__(self,patient,doctor,message) -> None:
        self.mongoID = ObjectId()
        self.patientID = str(patient)
        self.doctorID = str(doctor)
        self.message = str(message)
        self.reponse = ""

    def convert(self):
        result = {
            "_id" : self.mongoID,
            "PatientID" : self.patientID,
            "DoctorID" : self.doctorID,
            "message" : self.message,
            "response" : self.reponse
        }
        return result

    