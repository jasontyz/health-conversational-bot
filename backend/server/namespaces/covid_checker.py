from bson.objectid import ObjectId
from flask_restx import Namespace, Resource
from numpy import character

from utils import get_fields, parse_request_body
# from covid import AUActiveCasesLocation, CovidCases, AUStats
from flask_restx.errors import abort
from db import chatbot_db
from covidChecker.checker import covid_checker

covid_checker_ns = Namespace('covid_checker', 'covid self diagnosis')


@covid_checker_ns.route('/query')
class CovidCheckQuery(Resource):
    @covid_checker_ns.response(400, 'invalid request')
    def post(self):
        body = parse_request_body()
        index = body['index']
        symptoms = body.get("symptoms", "")

        resp = covid_checker.handle_request(questionIndex=index,
                                            symptoms=symptoms)
        chatbot_db.users.update_one({'_id': ObjectId(body['user_id'])}, {
            '$push': {
                'history': {
                    **resp,
                    'from': 'bot',
                    '_id': ObjectId(),
                }
            },
            '$inc': {
                'history_size': 1
            }
        })
        return resp
