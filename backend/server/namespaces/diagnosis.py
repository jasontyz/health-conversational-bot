from bson.objectid import ObjectId
from flask_restx import Namespace, Resource

from utils import get_fields, parse_request_body
from diagnosis.checker import symptom_checker
from db import chatbot_db

diagnosis_ns = Namespace('diagnosis', 'Sympton Checker inteface')


@diagnosis_ns.route('/')
class DiagnosisRoot(Resource):
    def post(self):
        body = parse_request_body()
        session_id, query, age, sex, status, evidence_idx, user_id = get_fields(
            body,
            'session_id',
            'query',
            'age',
            'sex',
            'status',
            'evidence_index',
            'user_id',
        )
        if user_id is not None:
            chatbot_db.users.update_one({'_id': {
                '$eq': ObjectId(user_id)
            }}, {
                '$push': {
                    'history': {
                        'from': 'user',
                        'type': 'plain',
                        'message': query,
                        '_id': ObjectId()
                    }
                },
                '$inc': {
                    'history_size': 1
                }
            })
        resp = symptom_checker.diagnosis(query,
                                         age=age,
                                         sex=sex,
                                         user_id=user_id,
                                         session_id=session_id,
                                         status=status,
                                         evidence_idx=evidence_idx)
        if user_id is not None:
            chatbot_db.users.update_one({'_id': {
                '$eq': ObjectId(user_id)
            }}, {
                '$push': {
                    'history': {
                        'from': 'bot',
                        '_id': ObjectId(),
                        **resp,
                    }
                },
                '$inc': {
                    'history_size': 1
                }
            })
        return resp

    def get(self):
        return symptom_checker.create_session()
