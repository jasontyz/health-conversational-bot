"""
response is the final return string,
_dict is the data field where the detailed info is included.
This file will return plaint text response for integration
"""
import sys
sys.path.append(".") # https://stackoverflow.com/questions/30669474/beyond-top-level-package-error-in-relative-import 

from covid import AUActiveCasesLocation, AUStats, Vaccine
from externalapi import googlemaps, newsapi, traveladvice
from recommendation import Food
from covidChecker.checker import CovidChecker
import numpy as np

def setup_handler(dialog_handler):
    """register dialogflow handler for different intents, details see DialogHandler file

    Args:
        dialog_handler (class): see Dialoghandler for details
    """
    features = {
        'cov19_hotspot': [AUActiveCasesLocation.get_covid_hotspots, cov19_hotspot],
        'cov19_stats': [AUStats.get_AUS_state_covid_stats,cov19_stats],
        'health_news': [newsapi.get_top_headlines,health_news],
        'travel_advice': [traveladvice.get_travel_advice,travel_advice],
        'food_recommendation': [Food.get_recipes,get_recipes],
        'vac_info': [Vaccine.get_vaccine,get_vaccine],
        'isolation': [Vaccine.get_isolation_info,get_isolation_info],
        'cov19_checker': [psesudo, cov19_checker]
    }
    dialog_handler.print_plain = {}
    for k, v in features.items():
        dialog_handler.register_handler(k, v[0])    
        dialog_handler.print_plain[k] = v[1]
    
    dialog_handler.print_plain['cov19_yes_no'] = yes_no_intent
    
    dialog_handler.nquestion = 0

def process_msg(dialog_handler, text, session_id=12341234):
    """pass in input from messenger endpoint to our dialogflow and get response

    Args:
        text (str): messenger endpoint input
        session_id (int, optional): dialogflow session id. Defaults to 12341234.

    Returns:
        str: response from backend
    """
    follow_up_intents = ["cov19_checker"]
    res = dialog_handler.detect(session_id, text)

    try:
        
        if dialog_handler.intent in follow_up_intents: # initialise health check
            return dialog_handler.print_plain[dialog_handler.intent](dialog_handler)

        if dialog_handler.nquestion > 0: # follow up
            resp = text[0].lower()
            if resp == "y":
                return dialog_handler.print_plain["cov19_yes_no"](dialog_handler, True)
            elif resp == "n":
                return dialog_handler.print_plain["cov19_yes_no"](dialog_handler, False)

        response = res["message"] + "\n"
        
        dialog_handler.nquestion = 0 # reinitialise since not follow up anymore

        if not "data" in res.keys(): # e.g travel advice requires country, if not specific then return 'Please specify a country and try again'
            return response

        response = dialog_handler.print_plain[dialog_handler.intent](response, res["data"])
        
    except Exception as e:
        print(e)
        return res['message']
    return response

def psesudo():
    pass
def cov19_checker(dialog_handler):
    """initialisation of covid checker

    Args:
        dialog_handler (class): see DialogHandler
    """
    dialog_handler.covid_checker = CovidChecker()
    dialog_handler.covid_checker.progress = []
    dialog_handler.nquestion = 1 # skip 0 as this is the 0th
    return dialog_handler.covid_checker.questions[0] + " yes for male, n for female"

def yes_no_intent(dialog_handler, is_yes):
    """follow up on the yes no intent for covid checker

    Args:
        dialog_handler (class): see DialogHandler

    Returns:
        str: questions on symptoms or predict result
    """

    covid_checker = dialog_handler.covid_checker
    if is_yes:
        covid_checker.progress.append(1)
    else:
        covid_checker.progress.append(0)
    if dialog_handler.nquestion == 8: # finish all symptom asing
        
        p = covid_checker.predict(np.array([covid_checker.progress]))
        response = "You are likely to get COVID-19, better to check with hospital"
        if p == 0:
            response = "You are not likely to get COVID-19"
        dialog_handler.nquestion = 0
        return response

    if dialog_handler.nquestion > 7: # in case follow up after prediction, give dont understand
        return "Sorry - the diagnosis is finished, you could try other features or start a new one:)"

    response = covid_checker.questions[dialog_handler.nquestion]
    
    dialog_handler.nquestion += 1 # prepare next q

    return response

def add_source(response, s) -> str:
    response += f'\n source: {s["name"]} {s["url"]} \n'
    return response

def cov19_stats(response, _dict) -> str:
    for d in _dict:
        response += f'{d}: {_dict[d]} \n'
    return response

def cov19_hotspot(response, _dict) -> str:
    for d in _dict["hotspots"]:
        response += f'  - {d["name"]} {d["address"] } {d["exposure_time"]} \n'
    s = _dict["source"]
    
    return add_source(response, _dict["source"])

def health_news(response, _dict) -> str:
    for d in _dict:
        response += f'{d["title"]} {d["date_published"]}\n {d["link"]} \n\n' # {d["source"]} 
    return response

def travel_advice(response, _dict) -> str:
    for d in _dict["diseases"]:
        d["advice"] = d["advice"].replace("\n", " and ") # replace multiple advices with and instead of new line
        response += f'  - {d["name"]}: {d["advice"] } \n'
    
    return add_source(response, _dict["source"])

def get_recipes(response, _dict) -> str:
    for d in _dict:
        response += f'  - {d["name"]}: {int(d["calories"])} calories, {d["cuisineType"]}, see: {d["link"] } \n'
    return response

def get_vaccine(response, _dict) -> str:
    for d in _dict["info"]:
        response += f'  - {d["vaccine_name"]}:  ages recommended: {d["ages_recommended"] },  #dozes: {d["primary_series"]}, booster: {d["booster_dose"]} \n'
    return add_source(response, _dict["source"])

def get_isolation_info(response, _dict) -> str:
    for d in _dict["results"]:
        response += f'  - {d["text"]}:  {d["link"]}\n'
    return add_source(response, _dict["source"])
