"""
Based on Queendland gov web 
Example of QLD table
[<td>Tuesday 19 October 2021</td>, 
<td><span class="location">Freedom Fuels</span><br/><span class="address">281 Learoyd Road</span></td>, 
<td>Acacia Ridge</td>, 
<td>6.25pm - 6.40pm</td>, 
<td>Casual contact</td>]

Other states table:
<td>Friday 15 October 2021</td>, 
<td><span class="location">Subway Dickson</span><br/><span class="address">Shop 1/71-81 Woolley Street</span></td>, 
<td>Dickson, ACT</td>, 
<td>12pm</td>, 
<td>9pm</td>]

speed up beautiful soup: https://stackoverflow.com/questions/25539330/speeding-up-beautifulsoup
https://beautiful-soup-4.readthedocs.io/en/latest/#improving-performance

10.30 
- SA is removed from the table - because 0 location
- python have limit on how many stuff can be printed at the terminal, not all result will be printed out since too many

"""
from re import sub
from flask_restx import abort
from pymongo import message
import requests
from bs4 import BeautifulSoup, SoupStrainer
from DialogHandler.DialogHandler import dialog_handler

states = [
    "qld", "act", "nsw", "sa", "vic", 'na', 'tas', 'wa'
]  # no Northern Territory and tasminia, WA since no data from there, second table is irrelevant so ignore
URL = "https://www.qld.gov.au/health/conditions/health-alerts/coronavirus-covid-19/current-status/contact-tracing"


def response_format(address, date, time) -> dict:
    return {"address": address, "date": date, "time": time}


def get_hotspots(state="NSW") -> dict:
    """web scrape from qld gov website for active case location

    Returns:
       dict: sorted by date, with the latest comes at the end
    """
    if not state in states:
        print(
            "[ERROR] wrong state code: available options are: QLD, ACT, NSW, SA, VIC"
        )
        return
    #idx = states.index(state)
    session = requests.Session()

    page = session.get(URL).text
    strainer = SoupStrainer('table')

    soup = BeautifulSoup(page, "lxml", parse_only=strainer)

    tables = soup.find_all(
        "table")  #[idx] # 7 in total, not Tasmina but New zealand

    res = {}
    for t in tables:  # loop through all tables found until get the matched state one

        rows = t.find_all("tr")

        for r in rows:
            cells = r.find_all("td")  # get cell of each row

            if not cells or len(cells) != 5:
                continue

            date, _, suburb, start, end = [c.text for c in cells]
            given_state = "tmp"
            if not "," in suburb:  # scrape from Queenland gov and so the format is different for non-QLD state
                date, _, suburb, time, _ = [c.text for c in cells]
                given_state = "QLD"
            else:

                time = start + " - " + end
                suburb, given_state = suburb.split(",")

            given_state = given_state.replace(" ", "")

            if given_state.upper() != state:  # not the state wanted
                break

            if "Bus route" in suburb:
                continue  # ignore bus route for active case location

            address = cells[1].next_element.next_element

            address = address.rstrip()  # remove newline

            d = response_format(address, date, time)

            if not suburb in res:
                res[suburb] = []

            if not d in res[suburb]:
                res[suburb].append(d)

        if res:
            break

    return res


def get_covid_hotspots(**kwargs) -> dict:
    """web scrape from qld gov website for active case location

    Returns:
       dict: sorted by date, with the latest comes at the end
    """
    state = kwargs.get("state", "nsw")
    if state not in states:
        abort(400, 'Invalid States')
    session = requests.Session()
    page = session.get(URL).text
    soup = BeautifulSoup(page, "lxml")
    rows = soup.select(f'div[id^={state}] tbody>tr')
    hotspots = []
    MAX_COUNT = 5
    for i, row in enumerate(rows):
        if i == MAX_COUNT:
            break
        date = row.select_one('td:nth-child(1)').text
        name = row.select_one('td:nth-child(2)>span.location').text
        addr = row.select_one('td:nth-child(2)>span.address').text
        suburub = row.select_one('td:nth-child(3)').text
        start_exposure = row.select_one('td:nth-child(4)').text
        start_exposure = '0am' if start_exposure == '12am' else start_exposure
        end_exposure = row.select_one('td:nth-child(5)').text
        item = {
            'name': name,
            'address': f'{addr}, {suburub}',
            'exposure_time': f'{date} {start_exposure} - {end_exposure}'
        }
        hotspots.append(item)

    message = f'Here are some covid hotspots in {state.upper()}'
    if len(hotspots) == 0:
        message = f'No hotspots found in {state.upper()}'
    return {
        'type': 'covid/hotspots' if len(hotspots) > 0 else 'plain',
        'message': message,
        'data': {
            'hotspots': hotspots,
            'source': {
                "name": 'Queensland Government',
                'url': URL
            }
        }
    }


def is_surburb_with_cases(state, suburb) -> list:
    """check if given surburb and state, the surburb is a hotspot

    Args:
        state (str): Australian state
        suburb (str): 

    Returns:
        list: list of hotspots
    """
    s = get_hotspots(state)
    if not s:
        return 0
    try:
        return s[suburb]
    except:
        return []


dialog_handler.register_handler('cov19_hotspot', get_covid_hotspots)

if __name__ == "__main__":

    print(get_covid_hotspots("qld"))
