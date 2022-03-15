from functools import update_wrapper
from flask import request
from flask_restx.errors import abort
from jwt import encode, decode
from jwt.exceptions import InvalidTokenError
from datetime import timedelta, datetime, timezone
from passlib.hash import pbkdf2_sha256

TOKEN_SECRET = 'nf2eoufnoiesnfioenisog'
PASSWORD_SALT = b'aw3203!EI(@N@NRNFOIa'
TOKEN_ALGO = 'HS256'
from db import chatbot_db

token_blacklist = chatbot_db.token_blacklist
token_blacklist.create_index('token', expireAfterSeconds=3600)


def issue_token(user_id, role):
    payload = {
        'exp': gen_expiration_time(),
        'aud': role,
        'uid': user_id,
        'iat': datetime.now()
    }
    return encode(payload, TOKEN_SECRET, algorithm=TOKEN_ALGO)


def decode_token(token, aud=['doctor', 'patient']):
    try:
        payload = decode(
            token,
            key=TOKEN_SECRET,
            options={'reqiured': ['exp', 'aud', 'uid']},
            audience=aud,
            algorithms=TOKEN_ALGO,
        )
        return payload
    except InvalidTokenError as e:
        return e.__str__()


def gen_expiration_time():
    return datetime.now(tz=timezone.utc) + timedelta(hours=8)


def auth_required(allowed_roles=['doctor', 'patient']):
    def decorator(f):
        def wrapper(*args, **kwargs):
            if 'Authorization' not in request.headers.keys():
                abort(401, '"Authorization" header is not set')
            token = request.headers.get('Authorization')

            if not token.startswith('Bearer'):
                abort(401, 'Authorization header must starts with "Bearer"')
            token = token.replace('Bearer ', '')
            count = token_blacklist.count_documents(
                {'token': {
                    '$eq': token,
                }}, limit=1)
            if count > 0:
                abort(401, 'Invalid token')
            payload = decode_token(token, allowed_roles)
            if type(payload) is str:
                if payload == 'Invalid audience':
                    abort(403, 'Permission denided')
                abort(401, payload)

            return f(*args, **kwargs)

        return update_wrapper(wrapper, f)

    return decorator


def hash_password(p):
    return pbkdf2_sha256.using(salt=PASSWORD_SALT).hash(p)


def get_token():
    auth_header = request.headers.get('Authorization')
    return auth_header.replace('Bearer ', '')