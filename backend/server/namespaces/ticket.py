from flask_restx import Namespace, Resource, fields
from flask_restx.errors import abort
from server.namespaces import chat
from utils import parse_request_body, get_fields
from flask import request
from externalapi import traveladvice
import json
from flask import request
from ticket.ticketDB import *
from db import chatbot_db
from utils.auth import auth_required

ticket_ns = Namespace("tickets", "Patient request ticket")


def map_ticket(ticket):
    ticket['id'] = str(ticket['_id'])
    del ticket['_id']
    return ticket


#user hit the button to send a request
@ticket_ns.route("/")
class Tickets(Resource):
    @ticket_ns.response(400, "invalid request")
    @auth_required()
    def post(self):
        body = parse_request_body()
        pid = body['patient_id']

        msg = body['message']
        inserted = add_ticket(pid, msg)
        chatbot_db.users.update_one(
            {"_id": ObjectId(pid)},
            {"$set": {
                "active_ticket": inserted.inserted_id
            }})

        return {"id": str(inserted.inserted_id)}

    @auth_required(allowed_roles=["doctor"])
    def get(self):
        resp = {}
        db_query = {"response": {"$exists": False}}
        doctor_id = request.args.get('doctor_id', None)
        patient_id = request.args.get('patient_id', None)
        if doctor_id is not None:
            db_query['doctor_id'] = {'$eq': doctor_id}
        if patient_id is not None:
            db_query['patient_id'] = {'$eq': patient_id}
        print(db_query)
        tickets = chatbot_db.tickets.find(db_query)
        tickets = list(map(map_ticket, tickets))
        resp['tickets'] = tickets
        return resp


#doctor replies message to certain ticket
@ticket_ns.route("/<string:ticket_id>/reply")
class Reply(Resource):
    @ticket_ns.response(400, "invalid request")
    @auth_required(allowed_roles=["doctor"])
    def post(self, ticket_id):
        body = parse_request_body()
        msg = body['message']
        reply_ticket(ticket_id, msg)
        resp = {}
        resp['message'] = "Replied successfully"
        return resp


#retrieve diagnosis summary to show when doctor browse the ticket
@ticket_ns.route("/<string:ticket_id>")
class ShowSummary(Resource):
    @ticket_ns.response(400, "invalid request")
    @auth_required(allowed_roles=["doctor"])
    def get(self, ticket_id):
        ticket = chatbot_db.tickets.find_one({'_id': ObjectId(ticket_id)})
        if ticket is None:
            abort(400, "invalid ticket id")
        patient = chatbot_db.users.find_one(
            {'_id': ObjectId(ticket['patient_id'])},
            {
                "history": 0,
            },
        )

        return {
            'profile': patient['profile'],
            'symptoms': patient.get('symptoms', [])[-1],
            'gender': patient['gender'],
            'date_of_birth': patient['date_of_birth'],
            'name': f"{patient['first_name']} {patient['last_name']}",
            'email': patient['username'],
            "message": ticket['message'],
        }
