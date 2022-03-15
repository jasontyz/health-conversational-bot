##
from flask_restx.api import Api

from .auth import auth as auth_ns
from .user import user_ns
from .chat import chat as chat_ns
from .diagnosis import diagnosis_ns
from .geolocate import nearby_ns
from .news import news_ns
from .covid_stats import covid_stats_ns 
from .recommendation import recommendation_ns
from .ticket import ticket_ns
from .covid_checker import covid_checker_ns
from .vaccine import vaccine_ns

api = Api(title='Chatbot', version='1.0')
api.add_namespace(auth_ns)
api.add_namespace(user_ns)
api.add_namespace(chat_ns)
api.add_namespace(diagnosis_ns)
api.add_namespace(nearby_ns)
api.add_namespace(news_ns)
api.add_namespace(covid_stats_ns)
api.add_namespace(recommendation_ns)
api.add_namespace(covid_checker_ns)
api.add_namespace(vaccine_ns)

api.add_namespace(ticket_ns)
