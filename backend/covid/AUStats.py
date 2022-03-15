"""
Cases where cannot not use beautilful soup to directly web scrape the table:
    * table involve js
    * table hidden in comment
    
    https://stackoverflow.com/questions/57032340/python-beautiful-soup-cant-find-specific-table
    https://stackoverflow.com/questions/51419743/web-scraping-with-beautifulsoup-table-not-in-page-source

commands to install:
    pip3 install webdriver-manager
    sudo apt-get install firefox-geckodriver
    sudo apt install firefox
    pip3 install beautifulSoup4
    # .string get content in tag e.g. <td class="COL2 TOTAL">381</td> gives 381
"""
import requests
from bs4 import BeautifulSoup, SoupStrainer
from DialogHandler.DialogHandler import dialog_handler

URL = "https://covidlive.com.au/report/daily-summary/"
headings = {
    "TOC": 0,
    "CASES": 1,
    "VACCINATIONS": 2,
    "TESTS": 3,
    "HOSPITALISED": 4,
    "VACCINATIONS-FIRST-DOSES": 5,
    "VACCINATIONS-PEOPLE": 6,
    "ACTIVE-CASES": 12,
    "DEATHS": 13
}

STATES = ["nsw", "vic", "qld", "wa", "sa", "tas", "act", "nt"]
NATION = "aus"

def get_AUS_state_covid_stats(**kwargs) -> dict:
    state = kwargs.get('state', 'nsw')
    if not state: # national stats - sum of states
        return get_state_stats(NATION)
    
    state = state.lower()
    if not state in STATES:
        print(
            "[ERROR] wrong state code: available options are: QLD, ACT, NSW, SA, VIC, WA, NT, TAS"
        )
        return
    return get_state_stats(state)

def get_state_stats(state) -> dict:
    """covid info based on aus states
    
    Args:
        state (str): australian state code

    Returns:
        dict: {'New Cases': ('293', '11'), 'Cases': ('74,634', '282'), 
        'Overseas': ('3,674', '0'), 'Doses': ('12,256,807', '48,231'), 
        'Tests': ('19,487,363', '89,678'), 'Active': ('4,068', '-113'), 
        'Recoveries': ('3,445', '0'), 'Deaths': ('562', '2'), 'Hospitalised': ('381', '-37'), 
        'ICU': ('82', '-15'), 'Last Updated': '11:15 AM'}  
    """
    
    session = requests.Session()
    page = session.get(URL + state).text
    strainer = SoupStrainer('table', {"class": ["DAILY-SUMMARY"]})
    soup = BeautifulSoup(page, "lxml", parse_only=strainer)

    tables = soup.find("table")  # return a list
    rows = tables.find_all("tr")

    res = {}
    for r in rows:
        cells = r.find_all("td")  # get cell of each row

        if not cells:
            continue
        name, number, _, changes = cells  # changes compared with previous day
        res[name.string] = (number.string, changes.text)
        if name.string == "Last Updated":
            res[name.string] = (number.string)
    res_clean = {}
    for k, v in res.items():
        key = k.lower()
        key = key.replace(" ", "_")
        res_clean[key] = v

    res_needed = {}
    res_needed["state"] = state

    __none_to_zero(res_needed, res_clean, "new_cases")
    __none_to_zero(res_needed, res_clean, "active")
    res_needed["active_cases"] = res_needed.pop("active")

    return {
        'type': 'covid',
        'data': res_needed,
        'message': "Here are the latest covid stats."
    }


def __none_to_zero(var1, var2, key):
    """handle scrape non-existing object

    Args:
        var1 (dict): new
        var2 (dict): original
        key (str): key of dict

    """
    try:
        var1[key] = var2[key][0]
    except:
        var1[key] = 0


dialog_handler.register_handler('cov19_stats', get_AUS_state_covid_stats)

if __name__ == "__main__":
    res = get_AUS_state_covid_stats(state="sdas")
    print(res)
