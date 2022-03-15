from flask_restx import Namespace, Resource

from utils import get_fields, parse_request_body
from covid import AUActiveCasesLocation, CovidCases_not_used, AUStats
from flask_restx.errors import abort
from flask import request
# TODO: get_past_six_months

covid_stats_ns = Namespace('covid', 'covid stats')


@covid_stats_ns.route('/hotspots')
class ActiveCaseRegion(Resource):
    @covid_stats_ns.response(400, 'invalid request')
    def get(self):
        state = request.args.get('state', 'wa')
        suburb = request.args.get('suburb', 'syndey')
        res = AUActiveCasesLocation.get_covid_hotspots(state)
        if res == 0:
            abort(
                400,
                f'invalid state name or {state.upper()} has no reported active scases'
            )
        return res
        # suburb = request.args.get('suburb', 'syndey')
        # res = AUActiveCasesLocation.get_AUS_state_covid_stats(state, suburb)
        # if res == 0:
        #     abort(
        #         400,
        #         f'invalid state name or {suburb} has no reported active scases'
        #     )
        # if not res:
        #     abort(400, f'invalid suburb name or no active case in {suburb}')

@covid_stats_ns.route('/stats')
class CovidCasesNum(Resource):
    @covid_stats_ns.response(400, 'invalid request')
    def get(self):
        body = parse_request_body()
        country = get_fields(body, 'country')
        res = CovidCases_not_used.get_cases_country(country)
        if not res:
            abort(400, f'invalid country name or not active case in {country}')
        return res


@covid_stats_ns.route('/stats/past')
class AUStateCovid(Resource):
    @covid_stats_ns.response(400, 'invalid request')
    def get(self):
        state = request.args.get('state', 'nsw')
        res = AUStats.get_AUS_state_covid_stats(state=state)
        if not res:
            abort(400, f'invalid state name or not active case in {state}')
        return res
