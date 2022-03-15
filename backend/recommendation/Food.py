"""
pricing - https://developer.edamam.com/edamam-recipe-api
API response structure as below:

    q	yes *	string	Query text. For example q=chicken. *This or the r parameter are required
    r	yes *	string	Returns information about a specific recipe based on its ID ie. r=http%3A%2F%2Fwww.edamam.com%2Fontologies%2Fedamam.owl%23recipe_9b5945e03f05acbf9d69625138385408 *This or the q parameter are required
    app_id	yes	string	Your 3scale application ID
    app_key	yes	string	Your 3scale application key (please note app_id/app_key are an ordered pair)
    from	no	integer	First result index (default 0). Example: from=20. The maximum value of the “from” parameter is limitted by the number of results a plan is entitled to.
    to	no	integer	Last result index (exclusive, default from + 10). Example: to=30
    ingr	no	integer	Maximum number of ingredients. Example: ingr=5
    diet	no	enum	Diet label: one of “balanced”, “high-protein”, “high-fiber”, “low-fat”, “low-carb”, “low-sodium”
    health	no	enum	Health label: One of the Health api parameters listed in Diet and Health Labels table at the end of this documentation. Miltiple labels cab be submitted simultatniousely this way “health=peanut-free&health=tree-nut-free”
    cuisineType	no	enum	The type of cuisine of the recipe. You can simultatniousely use saveral cuisines this way “cuisineType=chinese&cuisineType=indian”
    mealType	no	enum	The type of meal a recipe belongs to – lunch, dinner, breakfast, snack
    dishType	no	enum	The dish type a recipe belongs to – soup, salad, sandwich etc. You can simultatniousely use saveral dish types this way “dishType=soup&dishType=dessert”
    calories	no	range	The format is calories=RANGE where RANGE is replaced by the value in kcal. RANGE is in one of MIN+, MIN-MAX or MAX, where MIN and MAX are non-negative integer numbers. The + symbol needs to be properly encoded. Examples: “calories=100-300” will return all recipes with which have between 100 and 300 kcal per serving.
    time	no	range	Time range for the total cooking and prep time for a recipe . The format is time=RANGE where RANGE is replaced by the value in minutes. RANGE is in one of MIN+, MIN-MAX or MAX, where MIN and MAX are non-negative integer numbers. The + symbol needs to be properly encoded. Examples: “time=1%2B” will return all recipes with available total time greater then 1 minute
    excluded	no	string	Excluding recipes with certain ingredients. The format is excluded=FOOD where FOOD is replaced by the name of the specific food you don’t want to be present in the recipe results. More than one food can be excluded at the same time. Example: excluded=vinegar&excluded=pretzel will exclude any recipes which contain vinegar or pretzels in their ingredient list
    callback	no	string	Callback parameter for JSONP. This will “envelop” the result in a JavaScript function call to the specified callback. Optional
    imageSize	no	string	This parameter narrows down the search of the recipes based on whether the image size defined is available for the recipe. The possible values are THUMBNAIL, SMALL, REGULAR, and LARGE. See Image Sizes below for dimension specifics and how to get the different sizes with the image URL. Having “imageSize=THUMBNAIL” will return recipes that have an image with THUMBNAIL dimensions available.
}

"""
import json
import requests
from requests.api import request
from urllib.parse import urlencode
from DialogHandler.DialogHandler import dialog_handler

APP_ID = "948b25e1"
APP_KEYS = "113732ec8cbb960488d66425a6e7fb87"
FIELDS = [
    "uri", "label", "image", "source", "url", "shareAs", "yield", "dietLabels",
    "healthLabels", "cautions", "ingredientLines", "ingredients", "calories",
    "totalWeight", "totalTime", "cuisineType", "mealType", "dishType",
    "totalNutrients", "totalDaily", "digest"
]
UNWANTED = [
    "totalTime", "uri", "source", "shareAs", "yield", "ingredients",
    "totalWeight", "totalDaily", "totalNutrients", "digest"
]  # source is img source, ingredients is the detailed version of ingredientslines, totalNutrients is too details to the e.g. how many grams of sugar, totalDaily includes stuff like FAT, ENERC_KCAL, digest is also too details
FIELDS = [f for f in FIELDS if f not in UNWANTED]

URL = "https://api.edamam.com/api/recipes/v2?type=public" + f"&app_id={APP_ID}" + f"&app_key={APP_KEYS}"


def add_fields_qstring(url: str, field: str, values: list):
    """check instance, add prefix to url

    Args:
        url (str): api url
        field (str): different fields in the api
        values (list): values of the field

    Returns:
        str: field added url
    """
    if not isinstance(values,
                      list):  # if str convert to list for code convenience
        values = [values]
    for v in values:
        url = url + "&" + field + "=" + v
    return url


def get_request(url):
    """add fast decode using gzip

    Args:
        url (str): api url

    Returns:
        str: in json format
    """
    session = requests.Session()
    return session.get(
        url, headers={
            "Accept-Encoding": "gzip"
        }
    ).text  # Edamam servers support standard HTTP compression using gzip. Using compression can reduce the size of the response and thus, increase the transfer speed.


def get_food_recommendation(tags: dict):
    url = URL
    if not "q" in tags:  # if no query is given, choose meal , other examples are: chicken, fish, etc
        tags["q"] = "meal"
    if not "random" in tags:
        tags["random"] = "true"
    url = add_fields_qstring(url, "field", FIELDS)

    for tag, value in tags.items():
        url = add_fields_qstring(url, tag, value)

    recipe = json.loads(
        get_request(url))["hits"][0]["recipe"]  # get thet first in the result
    for r in recipe:
        if r == "healthLabels":
            recipe[r] = recipe[r][:5]
    return recipe


def pretty_print(parsed):
    print(json.dumps(parsed, indent=4, sort_keys=True))


def get_recipes(**kwrags) -> dict:
    """recipes recommendation based on health profile

    Returns:
        dict: name, link, calories of food
    """
    query = kwrags.get("query", "meal")
    health_tags = kwrags.get("health", [])
    diet_tags = kwrags.get("diet", [])
    request_params = f"&q={query}&random=true&from=0&to=5"
    for tag in health_tags:
        request_params += f"&health={tag}"
    for tag in diet_tags:
        request_params += f"&diet={tag}"
    resp = requests.get(URL + request_params)
    recipes = []
    for i, recipe in enumerate(resp.json()["hits"]):
        if i == 5:
            break
        item = {
            "name": recipe["recipe"]["label"],
            "link": recipe["recipe"]["shareAs"],
            "calories":
            recipe["recipe"]["calories"] / recipe["recipe"]["yield"],
            "cuisineType": recipe["recipe"]["cuisineType"][0],
        }
        recipes.append(item)

    return {
        "type": 'recipes',
        "data": recipes,
        'message': 'Here are some recipes for you'
    }


dialog_handler.register_handler('food_recommendation', get_recipes)

if __name__ == "__main__":
    tags = {"q": "meal", "health": []}
    pretty_print(get_food_recommendation(tags))
    """
    
    #  list of integers ones will only have one option to choose, other could be multiple
    # dict_keys(["recipe", "_links"]) - json.loads(get_request(url))["hits"][0].keys()
    tags = {
        "n_ingredients": ["5+", "5-8", "8"], #format [MIN+, MIN-MAX, MAX],  querystring as: ingr=5%2B, ingr=5-8, ingr=5, 
        "diet": ["balanced", "high-protein", "high-fiber", "low-fat", "low-carb", "low-sodium"],
        "health": [ "vegan", "vegetarian", "paleo", "dairy-free", "gluten-free", "wheat-free", "fat-free", "low-sugar", "egg-free", "peanut-free", "tree-nut-free", "soy-free", "fish-free", "shellfish-free"],
        "cuisineType": ["American", "Asian", "British", "Caribbean", "Central Europe", "Chinese", "Eastern Europe", "French", "Indian", "Italian", "Japanese", "Kosher", "Mediterranean", "Mexican", "Middle Eastern", "Nordic", "South American", "South East Asian"],
        "mealType": ["Breakfast","Lunch","Dinner","Snack","Teatime"],
        "dishType": ["Alcohol-cocktail", "Biscuits and cookies", "Bread", "Cereals", "Condiments and sauces", "Drinks", "Desserts", "Egg", "Main course", "Omelet", "Pancake", "Preps", "Preserve", "Salad", "Sandwiches", "Soup", "Starter"],
        "calories": ["0", "0-2000", "2000"],
        "time": ["0+", "5-8", "8"], # time taken to cook
        "imageSize": ["THUMBNAIL", "SMALL", "REGULAR", "LARGE"], # return img size
        "excluded": ["vinegar", "and more"], # Excluding recipes with certain ingredients. The format is excluded=FOOD where FOOD is replaced by the name of the specific food you don’t want to be present in the recipe results. More than one food can be excluded at the same time. Example: excluded=vinegar&excluded=pretzel will exclude any recipes which contain vinegar or pretzels in their ingredient list
        "random": "true", # random selection
        # "nutrients": {
        #     "Calcium"
        # }
    """