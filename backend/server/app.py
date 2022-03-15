from flask import Flask
from flask_cors import CORS
from .namespaces import api

app = Flask(__name__)
api.init_app(app)
CORS(app)
