from flask_restx import Namespace, fields, Resource
from flask_restx.errors import abort
from utils import get_fields, parse_request_body
from utils.auth import auth_required, gen_expiration_time, get_token, hash_password, issue_token, token_blacklist
from flask import request
from db import chatbot_db

users_coll = chatbot_db.users
auth = Namespace('auth', 'User authorization')

# define models
login_credentials = auth.model('Login Credentials', {
    "username": fields.String,
    "password": fields.String,
})

login_response = auth.model(
    "Token", {
        "id": fields.String,
        'token': fields.String,
        'token_expiration': fields.Integer,
        'first_name': fields.String,
        'last_name': fields.String,
    })


# define routes
@auth.route('/login')
class Authorisation(Resource):
    @auth.response(200, "Success", login_response)
    @auth.response(401, "Invalid credentials")
    @auth.expect(login_credentials)
    def post(self):
        body = parse_request_body()
        username, password = get_fields(body, 'username', 'password')
        password_hash = hash_password(password)
        user = users_coll.find_one({
            'username': {
                '$eq': username
            },
            'password': {
                '$eq': password_hash
            },
        })
        if not user:
            abort(401, "Invalid username or password")
        token = issue_token(str(user['_id']), user['role'])

        return {
            "id": str(user['_id']),
            'token': token,
            'token_expiration': int(gen_expiration_time().timestamp()),
            'first_name': user['first_name'],
            'last_name': user['last_name'],
            'date_of_birth': user['date_of_birth'],
            'gender': user['gender'],
            'profile': user.get('profile', None),
            'role': user['role'],
        }


@auth.route('/logout')
class Logout(Resource):
    @auth_required(allowed_roles=['doctor', 'patient'])
    def post(self):
        token_blacklist.insert_one({"token": get_token()})
        return {'msg': 'loged out'}
