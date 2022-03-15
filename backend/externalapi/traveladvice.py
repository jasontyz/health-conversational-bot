import requests, json
from bs4 import BeautifulSoup
from DialogHandler.DialogHandler import dialog_handler

website = 'https://wwwnc.cdc.gov/'
url = website + 'travel/destinations/traveler/none/'


def get_travel_advice(**kwargs):
    country = kwargs.get('country', '').lower()
    if len(country) == 0:
        return {
            'type': 'plain',
            'message': 'Please specify a country and try again'
        }
    req = requests.get(url + country.replace(' ', '-'))
    soup = BeautifulSoup(req.content, 'lxml')

    try:
        div = soup.find("div", {"id": "non-vaccine-preventable-diseases"})
        diseases = div.find_all("td", {"class": "other-clinician-disease"})
        advices = div.find_all("td",
                               {"class": "other-clinician-patienteduction"})
    except:
        return json.dumps({'status': 404, 'payload': []})

    response = {
        "type":
        'travel_advice',
        "message":
        f'These are the common diseases in {country.capitalize()}. ' +
        f'Take care and enjoy your trip.'
    }
    payload = []
    for i in range(len(diseases)):
        item = {}
        item['name'] = diseases[i].text
        item['advice'] = advices[i].text.strip('\n')

        payload.append(item)

    #data.append({'link': url + country})
    response['data'] = {
        'diseases': payload,
        'source': {
            'name': 'CDC USA',
            'url': url + country.replace(' ', '-'),
        }
    }
    return response


dialog_handler.register_handler('travel_advice', get_travel_advice)