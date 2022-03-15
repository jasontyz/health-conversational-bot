from os import abort
import requests
from urllib.parse import urlencode
import json
from DialogHandler.DialogHandler import dialog_handler

API_KEY = 'fea5a7cf522442b0b15b9dc76ea9c9a4'


def get_top_headlines(**kwargs):
    country = kwargs.get('country', 'au')
    category = kwargs.get('category', 'health')
    keyword = kwargs.get('keyword', '')
    request_params = {
        "country": country,
        "category": category,
        "pageSize": 5,
        "page": 1
    }
    url = f'https://newsapi.org/v2/top-headlines?{urlencode(request_params)}'

    if not keyword == '':
        url = url + '&q={}'.format(keyword)

    header = {'X-Api-Key': API_KEY}

    resp = requests.get(url, headers=header).json()
    results = []
    if resp['status'] != 'ok':
        abort(500, resp['messasge'])
    for article in resp.get('articles'):
        item = {
            'title': article.get('title'),
            'source': article.get('source').get('name'),
            'link': article.get('url'),
            'date_published': article.get('publishedAt'),
        }
        results.append(item)
    return {
        'type': 'news',
        'message': "Here is the latest health news",
        "data": results
    }


dialog_handler.register_handler('health_news', get_top_headlines)
