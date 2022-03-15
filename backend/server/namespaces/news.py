from flask_restx.errors import abort
from flask_restx import Namespace, Resource, fields
from utils import parse_request_body, get_fields
from externalapi import newsapi
import json

news_ns = Namespace('news')


@news_ns.route('/')
class News(Resource):
    @news_ns.response(404, 'No news can be found')
    @news_ns.response(403, 'Permission denied')
    @news_ns.response(200, 'Success')
    def post(self):
        body = parse_request_body()
        print(body)

        response = json.loads(
            newsapi.get_top_headlines(keyword=body['keyword']))
        if response['totalResults'] == 0:
            abort(404, 'No news can be found')

        resp = {}
        resp['type'] = 'news'
        resp['message'] = 'Here is the latest news today'
        resp['data'] = response['articles']

        return resp
