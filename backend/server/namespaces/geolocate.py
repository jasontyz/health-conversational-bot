from flask_restx import Namespace, Resource, fields
from flask_restx.errors import abort
from utils import parse_request_body, get_fields
from externalapi.googlemaps import get_location_name, search_nearby, search_place
from flask import request
from externalapi import traveladvice
import json
from flask import request

nearby_ns = Namespace("nearby", "Geolocation's API")


@nearby_ns.route('/clinics')
class NearbyClinic(Resource):
    @nearby_ns.response(200, 'Success')
    @nearby_ns.response(400, 'Invalid response')
    def get(self):
        lati = request.args.get('lati', None)
        longi = request.args.get('longi', None)

        resp = search_nearby(lati, longi, keyword='clinic', radius=0)

        response = {}
        response['type'] = 'clinics'
        response[
            'message'] = 'Ok, here is the clinics / hospitals I have found.'
        response['data'] = []

        ctr = 0
        for result in resp['results']:
            if ctr == 5:
                break

            data = {}
            data['name'] = result['name']
            data['suburb'] = result['plus_code']['compound_code'].replace(
                ',', ' ').split(' ')[1]
            data['address'] = result['vicinity']
            data['link'] = ''

            response['data'].append(data)
            ctr += 1

        return response


@nearby_ns.route('/travel_advice')
class TravelAdvice(Resource):
    @nearby_ns.response(200, 'Success')
    @nearby_ns.response(400, 'Invalid response')
    def get(self):
        country = request.args.get('country', '')
        return traveladvice.get_travel_advice(country=country)
