import requests
from urllib.parse import urlencode
from flask_restx import abort
from DialogHandler.DialogHandler import dialog_handler

API_KEY = "AIzaSyAiLAeQkCdmuH34usTiLcGyw1WBtAlqa0g"


def get_location_cord():
    """ 
    Gets the approximate coordinate using Google Geolocate API.

    * Return:

        {"location": 
            {"lat": , "lng": ,},
        "accuracy":
        }
    """
    url = "https://www.googleapis.com/geolocation/v1/geolocate?key=" + API_KEY

    params = dict(homeMobileCountryCode=0,
                  homeMobileNetworkCode=0,
                  radioType="gsm",
                  carrier="",
                  considerIp='true',
                  cellTowers=[],
                  wifiAccessPoints=[])

    resp = requests.post(url=url, params=params)

    return resp.json()


def get_location_name(lat, lng):
    """ Search a place using the coordinates and return its name in string
    """
    url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={API_KEY}"

    resp = requests.post(url)
    return resp.json()


def search_nearby(lat,
                  lng,
                  keyword="",
                  radius=10000,
                  rankby="distance",
                  type=""):
    """
    Use a keyword to search a place within the radius of user's location. 
        * Inputs:
            * keyword (string): the term used to search.
            * radius (int): the distance to search in metres.
            * rankby (string): the order in which result is listed, "prominence" or "distance".
            * Examples of type: "hospital", "doctor", "drugstore", "pharmacy", "health".
            See full list of type: https://developers.google.com/maps/documentation/places/web-service/supported_types?authuser=2

        * If return status show "ZERO_RESULTS", try increasing radius, or changing type.

        * Return:
            A list of search results (JSON)
    """

    # loc = get_location_cord()
    # lat = loc["location"]["lat"]
    # lng = loc["location"]["lng"]

    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat}%2C{lng}&rankby={rankby}"

    if not keyword == "":
        url = url + "&keyword=" + keyword
    if not type == "":
        url = url + "&type=" + type
    if not radius == 0:
        url = url + "&radius=" + str(radius)

    url = url + "&key=" + API_KEY
    print(f"=====\nURL: {url}\n=====")
    resp = requests.post(url)

    return resp.json()


def get_nearby_clinics(**kwargs):
    lat = kwargs.get("lat", None)
    lng = kwargs.get("lng", None)
    if (lat is None) or (lng is None):
        abort(400, "No location is provided")
    resp = search_nearby(lat, lng, keyword='clinic', radius=0)
    response = {}
    response['type'] = 'clinics'
    response['message'] = 'Here are the nearby clinics'
    response['data'] = []
    print(resp)
    ctr = 0
    for result in resp['results']:
        if ctr == 5:
            break

        data = {}
        data['name'] = result['name']
        data['suburb'] = result['plus_code']['compound_code'].replace(
            ',', ' ').split(' ')[1]
        data['address'] = result['vicinity']
        link_params = urlencode({
            'api': 1,
            'destination': result['name'],
            'destination_place_id': result['place_id']
        })
        data['link'] = f'https://www.google.com/maps/dir/?{link_params}'
        response['data'].append(data)
        ctr += 1

    return response


dialog_handler.register_handler('nearby_clinic', get_nearby_clinics)


def search_place(name):
    """ 
    Search for the coordinates of a place using its name
    """
    url = f"https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input={name}&inputtype=textquery&fields=formatted_address%2Cname%2Cplace_id&key={API_KEY}"

    resp = requests.post(url)

    return resp.json()
