from bson.objectid import ObjectId
from flask_restx import Namespace, fields, Resource, reqparse
from flask_restx.errors import abort
from flask import request
from server.namespaces import auth
from utils import parse_request_body, get_fields
from db import chatbot_db
from utils.auth import auth_required, decode_token, gen_expiration_time, get_token, hash_password, issue_token

user_ns = Namespace('users', 'User management')

users_coll = chatbot_db.users

history_item = user_ns.model(
    "History Item", {
        "id": fields.String,
        "message": fields.String,
        "data": fields.Raw(),
        "type": fields.String,
        "from": fields.String,
        "archived": fields.Boolean,
    })

signup_payload = user_ns.model(
    'Sign Up Request', {
        "username": fields.String,
        "password": fields.String,
        'role': fields.String,
        "gender": fields.String,
        "date_of_birth": fields.String,
        "first_name": fields.String,
        "last_name": fields.String,
    })

signup_response = user_ns.model(
    'Sign Up Response', {
        'id': fields.String,
        'token': fields.String,
        'first_name': fields.String,
        'last_name': fields.String,
    })

profile_update_payload = user_ns.model(
    'Profile creation request', {
        'diabetes': fields.Boolean,
        'hypertension': fields.Boolean,
        'overweight': fields.Boolean,
        'smoking': fields.Boolean,
        'high_cholesterol': fields.Boolean,
    })
profile_update_response = user_ns.model(
    'Profile creation response',
    {"message": fields.String},
)


def map_history_items(history_items):
    result = []
    for item in history_items:
        it = {
            'msg_id': str(item['_id']),
            'message': item['message'],
            'type': item['type'],
            'from': item['from'],
            'archived': True
        }
        if 'data' in item.keys():
            it['data'] = item['data']
        result.append(it)
    return result


@user_ns.route('/')
class Users(Resource):
    @user_ns.response(200, 'Success', signup_response)
    @user_ns.response(400, 'invalid request')
    @user_ns.expect(signup_payload)
    def post(self):
        req = parse_request_body()
        body = get_fields(req, *signup_payload.keys(), as_dict=True)
        count = users_coll.count({'username': {'$eq': body['username']}})
        if count > 0:
            abort(400, 'Username already exists')
        body['password'] = hash_password(body['password'])
        res = users_coll.insert_one(body)
        if not res:
            abort(500, 'MongoDB failed')
        token = issue_token(str(res.inserted_id), body['role'])
        return {
            'token': token,
            'token_expiration': int(gen_expiration_time().timestamp()),
            'first_name': body['first_name'],
            'last_name': body['last_name'],
            'profile': None,
            "role": body['role'],
            'id': str(res.inserted_id)
        }


@user_ns.route('/<string:user_id>')
class User(Resource):
    @user_ns.response(404, 'User does not exist')
    @user_ns.response(403, 'Permission denied')
    @user_ns.response(200, 'Success', profile_update_response)
    @user_ns.expect(profile_update_payload)
    @auth_required(allowed_roles=['doctor', 'patient'])
    def post(self, user_id):
        req = parse_request_body()
        print(req)
        token = get_token()
        payload = decode_token(token)
        if payload['uid'] != user_id:
            abort(403, 'Permission denided')
        res = users_coll.update_one({"_id": {
            "$eq": ObjectId(user_id)
        }}, {"$set": {
            "profile": req,
        }})
        if res.matched_count == 0:
            abort(404, 'User does not exist')

        if res.modified_count == 0:
            abort(400, 'No update is done, beacause there is no change')

        return {"message": "success"}


@user_ns.route("/<string:user_id>/history")
class History(Resource):
    @user_ns.response(404, 'User does not exist')
    @user_ns.response(403, 'Permission denied')
    @user_ns.response(200, 'Success')
    @auth_required(allowed_roles=['doctor', 'patient'])
    def get(self, user_id):
        """
        Get the history of the user
        by default, it retrieves the last 10 items

        By contract frontend will provide correct query params
        """
        token = get_token()
        payload = decode_token(token)
        if payload['uid'] != user_id:
            abort(403, 'Permission denided')

        page_size = int(request.args.get('page_size', 10))
        page_index = int(request.args.get('page_index', 0))

        res = users_coll.find_one({'_id': {
            '$eq': ObjectId(user_id)
        }}, {'history': {
            '$slice': [page_index * page_size, page_size]
        }})

        history = map_history_items(res.get('history', []))

        return {'history': history, 'total': res.get('history_size', 0)}

    @auth_required(allowed_roles=['doctor', 'patient'])
    def put(self, user_id):
        """
        push history to server
        """
        req = parse_request_body()
        token = get_token()
        payload = decode_token(token)
        if payload['uid'] != user_id:
            abort(403, 'Permission denided')
        res = users_coll.update_one({"_id": {
            "$eq": ObjectId(user_id)
        }}, {
            "$push": {
                "history": {
                    '_id': ObjectId(),
                    'from': 'user',
                    'type': 'plain',
                    'message': req['message'],
                }
            }
        })

        return {"message": "success"}


@user_ns.route("/<string:user_id>/ticket")
class ActiveTicket(Resource):
    @auth_required()
    def get(self, user_id):
        """
        Get the history of the user
        by default, it retrieves the last 10 items

        By contract frontend will provide correct query params
        """
        dismiss = request.args.get('dismiss', '0')
        token = get_token()
        payload = decode_token(token)
        if payload['uid'] != user_id:
            abort(403, 'Permission denided')

        user = users_coll.find_one({'_id': {
            '$eq': ObjectId(user_id)
        }}, {
            'active_ticket': 1,
            '_id': 0
        })
        print(user.get('active_ticket', None))
        if user.get('active_ticket', None) is None:
            return {"ticket_id": "", "message": "", "responded": False}
        ticket_message = chatbot_db.tickets.find_one({
            '_id': {
                '$eq': ObjectId(user['active_ticket'])
            },
        })
        print(ticket_message)
        if dismiss == '1' and ticket_message.get('response', None) is not None:
            chatbot_db.users.update_one({'_id': {
                '$eq': ObjectId(user_id)
            }}, {'$unset': {
                'active_ticket': 1
            }})
        return {
            "responded": ticket_message.get('response', None) is not None,
            "message": ticket_message.get('response', None),
            "ticket_id": str(ticket_message['_id'])
        }
