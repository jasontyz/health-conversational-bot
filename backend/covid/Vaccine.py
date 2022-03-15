import json

from bs4 import BeautifulSoup
import requests
import random

from DialogHandler.DialogHandler import dialog_handler


def get_vaccine(**kwargs) -> dict:
    """give vac info for pfizer, Moderna  and johnson  & johnson 

    Args:
        vac (str, optional): p, m or j Defaults to "p".

    Returns:
        [type]: [description]
    """
    vacs = get_vaccine_difference()
    result = None

    return {
        'type': 'vaccine/info',
        'message': 'Here is the vaccine info: ',
        'data': {
            'info': vacs,
            'source': {
                "name":
                'CDC',
                'url':
                'https://www.cdc.gov/coronavirus/2019-ncov/vaccines/different-vaccines.html'
            }
        }
    }


def get_vaccine_difference() -> list:
    """scrape and get vaccine info

    Returns:
        list: vaccine details e.g. age suitable
    """
    result = []

    resp = requests.get(
        'https://www.cdc.gov/coronavirus/2019-ncov/vaccines/different-vaccines.html'
    )
    soup = BeautifulSoup(resp.text, 'html.parser')
    row_groups = soup.find_all('div', role='rowgroup')

    vaccine_names = row_groups[0].find_all('div',
                                           class_='font-weight-bold m-0 open')
    for vaccine_name in vaccine_names:
        result.append(
            {'vaccine_name': vaccine_name.p.strong.text.replace('\xa0', '')})

    details = row_groups[1].find_all('div', role='row')
    for detail in details:
        cells = detail.find_all('div', role='cell')
        for i, cell in enumerate(cells):
            text = cell.p.text.split('\n')
            k = text[0].lower()
            k = k.replace(' ', '_')
            result[i][k] = text[1]

    return result


# def get_vaccine_faqs(limit: int = 5) -> str:
#     link = 'https://www.cdc.gov/coronavirus/2019-ncov/vaccines/faq.html'
#     result = {
#         'FAQs': [],
#     }
#     resp = requests.get('https://www.cdc.gov/coronavirus/2019-ncov/vaccines/faq.html')
#     soup = BeautifulSoup(resp.text, 'html.parser')
#     questions = soup.find_all('button', class_='card-title btn btn-link')
#     random.shuffle(questions) # random 5 faqs

#     for i, question in enumerate(questions):
#         if i >= limit:
#             break
#         result['FAQs'].append(question.span.text)
#     return {
#         'type':'vaccine/faqs',
#         'message': 'Here is five F&Qs about vaccine: ',
#         'data': {
#             'faqs': result,
#             'source': {
#                 "name": 'CDC',
#                 'url': 'https://www.cdc.gov/coronavirus/2019-ncov/vaccines/faq.html'
#             }
#         }
#     }


def get_isolation_info(**kwargs) -> dict:
    """get links to isolation tips

    Returns:
        dict: result field is list of urls to the isolation tips
    """
    result = []
    resp = requests.get(
        'https://www.nhs.uk/conditions/coronavirus-covid-19/self-isolation-and-treatment/'
    )
    soup = BeautifulSoup(resp.text, 'html.parser')
    items = soup.find_all(
        'li',
        class_='nhsuk-hub-key-links__list-item beta-hub-key-links__list-item')
    for item in items:
        result.append({
            'text':
            item.contents[1].text.strip(),
            'link':
            'https://www.nhs.uk' + item.contents[1].attrs['href'],
        })
    return {
        'type': 'vaccine/isolation',
        'message': 'Here are the links for isolation tips: ',
        'data': {
            'results': result,
            'source': {
                "name":
                'NHS',
                'url':
                'https://www.nhs.uk/conditions/coronavirus-covid-19/self-isolation-and-treatment/'
            }
        }
    }


dialog_handler.register_handler('vac_info', get_vaccine)
#dialog_handler.register_handler('vac_faqs', get_vaccine_faqs)
dialog_handler.register_handler('isolation', get_isolation_info)

if __name__ == '__main__':
    pass
    # get_vaccine_difference()
    # get_vaccine_faqs()
    #get_isolation_info()
    #print(get_vaccine_faqs())