"""This is covid case module
"""
import requests
import json

def get_country() -> dict:
    """get countries and the its code

    Returns:
        dict: {'Country': 'Afghanistan', 'ThreeLetterSymbol': 'afg'}
    """
    url = "https://vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com/api/npm-covid-data/countries-name-ordered"

    headers = {
        'x-rapidapi-host': "vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com",
        'x-rapidapi-key': "4df4ad4350msh411a027caaff956p1d965djsn353481acd46c"
        }

    response = requests.request("GET", url, headers=headers)

    j = json.loads(response.text)
    return j

    # for c in j:
    #     if c["Country"] == "USA":
    #         print(c)

def __is_in_database(country) -> dict:
    """return the corresponding country name in the database, case snesitive

    Args:
        country (str): 

    Returns:
        dict: if not found, return empty dict
    """
    all_countries = get_country()
    expected = []

    for c in all_countries:
        expected.append(c["Country"].lower())
    for idx, c in enumerate(expected):
        if country == c:
            return all_countries[idx] # return the corresponding country name in the database, case snesitive

    return {}

def get_cases_country(country_name="Australia") -> dict:
    """get covid cases based on country

    Args:
        country_name (str): country name
    """
    country_name = country_name.lower()
    
    c = __is_in_database(country_name)

    if not c:
        print("Given country not found in the database, pls try another one")
        return
    
    url = f'https://vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com/api/npm-covid-data/country-report-iso-based/{c["Country"]}/{c["ThreeLetterSymbol"]}'

    headers = {
        'x-rapidapi-host': "vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com",
        'x-rapidapi-key': "4df4ad4350msh411a027caaff956p1d965djsn353481acd46c"
        }

    r = json.loads(requests.request("GET", url, headers=headers).text)[0] # the return is list with one element

    res = {
        "country": r["Country"],
        "TotalCases": r["TotalCases"],
        "NewCases": r["NewCases"],
        "NewDeaths": r["NewDeaths"],
        "ActiveCases": r["ActiveCases"],
        "TotalDeaths": r["TotalDeaths"],
        "Case_Fatality_Rate": r["Case_Fatality_Rate"],
        "Deaths per 1M": r["Deaths_1M_pop"]

    }
    return res
    """
    everything available are:
        rank 223, Country China, Continent Asia, TwoLetterSymbol cn, ThreeLetterSymbol chn, Infection_Risk 0.01, 
        Case_Fatality_Rate 4.79, Test_Percentage 11.12, Recovery_Proporation 94.64, TotalCases 96715, NewCases 50, 
        TotalDeaths 4636, NewDeaths 0, TotalRecovered 91530, NewRecovered 19, ActiveCases 549, TotalTests 160000000, 
        Population 1439323776, one_Caseevery_X_ppl 14882, one_Deathevery_X_ppl 310467, one_Testevery_X_ppl 9, Deaths_1M_pop 3, 
        Serious_Critical 7, Tests_1M_Pop 111163
        TotCases_1M_Pop 67
    """

def get_past_six_months(country = "Australia") -> dict:
    """get past six monthens covid cases, below is data from one particular date
    {"id":"7b63da1f-649c-4245-a11f-50b6c0305402","symbol":"USA","Country":"United States","Continent":"North America",
    "date":"2021-08-23","total_cases":37939641, "new_cases":229831,"total_deaths":629411,"new_deaths":908,"total_tests":0,"new_tests":0}
    """
    country = country.lower()
    
    country = __is_in_database(country)

    if not country:
        print("Given country not found in the database, pls try another one")
        return
    country = country["ThreeLetterSymbol"]
    url = f"https://vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com/api/covid-ovid-data/sixmonth/{country}"
    
    
    headers = {
        'x-rapidapi-host': "vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com",
        'x-rapidapi-key': "4df4ad4350msh411a027caaff956p1d965djsn353481acd46c"
        }

    r = json.loads(requests.request("GET", url, headers=headers).text)
    
    res2_x = []
    res2_y = []
 
    for e in r:
        
        res2_x.append(e["date"])
        res2_y.append(e["new_cases"])
        
    return {
        "dates":res2_x,
        "new_cases":res2_y
    }


def show_diagram_past_six_month(country="China"):
    """times series plo using seaborn where x-axis is the dates and y is he new cases / death / ec
    """
    res = get_past_six_months(country)
    if not res:
        return
    x, y = res
    import pandas as pd
    import matplotlib.pyplot as plt

    import seaborn as sns

    df = pd.DataFrame({"Date": x,
                    "Cases": y})

    sns.lineplot(x="Date", y="Cases", data=df)
    plt.xticks(rotation=15)
    plt.title('seaborn-matplotlib example')
    plt.show()



    
if __name__== "__main__":

    def test_number_cases(name="Australia"):
    
        r = get_cases_country(name)
        print(r)
        print()
    
    def test_time_series(name="Australia"):
        show_diagram_past_six_month()

    name = "Aus"


    test_number_cases("a")
    
    
    #test_time_series()

    # import pandas as pd
    # country = "Australia"
    # url = f"https://github.com/owid/covid-19-data/raw/master/public/data/vaccinations/country_data/{country}.csv" # remove blob and replace it with blob
    # df = pd.read_csv(url, index_col=0)
    # print(df.tail(10))
    

    
