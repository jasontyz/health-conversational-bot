from bson.objectid import ObjectId
from flask_restx.errors import abort
from DialogHandler.DialogHandler import dialog_handler, detect_intent_texts
from db import chatbot_db
from flask_restx import Namespace, Resource, fields
from utils import parse_request_body, get_fields
from diagnosis.checker import symptom_checker
from utils.auth import decode_token, get_token, auth_required

chat = Namespace('chat', 'Chatting with bot')

plain_text_response = chat.model('Plain text response', {
    'type': fields.String,
    'message': fields.String,
})
chat_request = chat.model('ChatRequestBody', {"message": fields.String})


@chat.route('/')
class ChatGuestMode(Resource):
    @chat.response(200, 'Success', plain_text_response)
    @chat.response(400, 'Invalid response')
    @chat.expect(chat_request)
    def post(self):
        body = parse_request_body()
        print(body)
        message, session = get_fields(body, "message", "session")
        extras = body.get("extras", {})
        response = dialog_handler.detect(session, message, extras)
        return response


# Chat endpoint when user is logged in
@chat.route('/<string:user_id>')
class ChatUserMode(Resource):
    @chat.response(200, 'Success', plain_text_response)
    @chat.response(400, 'Invalid response')
    @chat.response(403, 'Forbidden')
    @chat.expect(chat_request)
    @auth_required()
    def post(self, user_id):
        body = parse_request_body()
        print(body)
        message, session = get_fields(body, 'message', 'session')
        # check user_id matches with jwt
        token = get_token()
        token_payload = decode_token(token)
        if token_payload['uid'] != user_id:
            abort(403, 'User ID does not match with JWT')

        # append the history to the user's history
        updated_res = chatbot_db.users.update_one({'_id': ObjectId(user_id)}, {
            '$push': {
                'history': {
                    'from': 'user',
                    'type': 'plain',
                    'message': message,
                    "_id": ObjectId(),
                }
            },
            '$inc': {
                'history_size': 1
            }
        })
        print(updated_res)
        extras = body.get("extras", {})
        response = dialog_handler.detect(session, message, extras)
        # store resp into database for chat history
        chatbot_db.users.update_one({'_id': ObjectId(user_id)}, {
            '$push': {
                'history': {
                    'from': 'bot',
                    'archived': True,
                    "_id": ObjectId(),
                    **response
                },
            },
            '$inc': {
                'history_size': 1
            }
        })
        return response
