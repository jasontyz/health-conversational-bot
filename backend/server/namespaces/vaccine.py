from flask_restx import Namespace, Resource

from utils import get_fields, parse_request_body
# from covid import AUActiveCasesLocation, CovidCases, AUStats
from flask_restx.errors import abort
import numpy as np
from covid import Vaccine
from flask import request

vaccine_ns = Namespace('vaccine', 'vacchine info')


@vaccine_ns.route('/info')
class VacTypes(Resource):
    @vaccine_ns.response(400, 'invalid request')
    def get(self):
        res = Vaccine.get_vaccine()
        if not res:
            abort(400, f'invalid vaccine name or service not available')
        return res


# @vaccine_ns.route('/faqs')
# class VacFaqs(Resource):
#     @vaccine_ns.response(400, 'invalid request')
#     def get(self):
#         #body = parse_request_body()
#         return Vaccine.get_vaccine_faqs()


@vaccine_ns.route('/isolation')
class Isolation(Resource):
    @vaccine_ns.response(400, 'invalid request')
    def get(self):
        #body = parse_request_body()
        res = Vaccine.get_isolation_info()
        if not res:
            abort(400, f'service not available')
        return res
