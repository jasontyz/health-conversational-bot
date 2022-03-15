from flask_restx import Namespace, Resource
from requests.api import get

from utils import get_fields, parse_request_body
from recommendation.Food import get_recipes
from flask_restx.errors import abort
from flask import request
# TODO: get_past_six_months

recommendation_ns = Namespace('recommendation', 'recommendation for e.g. food')


@recommendation_ns.route('/food')
class Food(Resource):
    @recommendation_ns.response(400, 'invalid request')
    def get(self):
        res = get_recipes()
        if not res:
            abort(400, 'No recommendation is made for the given tags')
        return res
