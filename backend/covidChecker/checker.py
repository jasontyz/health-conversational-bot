import pickle
from sklearn import tree
from DialogHandler.DialogHandler import dialog_handler
from pathlib import Path
import numpy as np
import pandas as pd

pth = "backend/covidChecker/model/DecesionTree.pth"
pth = Path("./covidChecker/model/DecesionTree.pth")


class CovidChecker():
    def __init__(self):
        f = open(pth, "rb")
        self.model = pickle.load(f)
        f.close()
        self.names = [
            "cough", "fever", "sore_throat", "shortness_of_breath",
            "head_ache", "age_60_and_above", "gender", "test_indication"
        ]
        self.questions = [
            "What's your gender?", "Are you over 60? ", "Do you have a cough?",
            "Do you have a fever", "Do you feel soar throat?",
            "Do you feel the shortness of breath?", "Do you have a headache?",
            "have you contacted with confirmed case?"
        ]

    def predict(self, input):
        input = self.process(input)
        return self.model.predict(input)

    def process(self, input):
        df = pd.DataFrame(data=input, columns=self.names)
        return df

    def ask(self, i):
        return self.questions[i]

    def handle_request(self, **kwargs):
        index = kwargs.get("questionIndex", 0)

        if index < len(self.questions):
            msg = self.ask(index)
            resp = {'type': 'covid_checker/choice', "message": msg}
            if index == 0:
                resp['data'] = [{
                    'text': "Male",
                    'value': "1"
                }, {
                    "text": "Female",
                    'value': "0"
                }]
            else:
                resp['data'] = [{
                    'text': "Yes",
                    'value': "1"
                }, {
                    "text": "No",
                    'value': "0"
                }]
            return resp

        symptoms = kwargs.get("symptoms")
        print(len(symptoms))
        symptoms_query = np.array([[int(i) for i in symptoms]])
        result = covid_checker.predict(symptoms_query)
        if result[0] == 0:
            msg = "You are not likely to get COVID-19"
        else:
            msg = "You are likely to get COVID-19, better to check with hospital"
        resp = {'type': 'covid_checker/result', 'message': msg}

        return resp


covid_checker = CovidChecker()
dialog_handler.register_handler('cov19_checker', covid_checker.handle_request)
if __name__ == "__main__":
    print("covid symtpm checker")
    a = CovidChecker()
    inp = np.array([[1, 1, 0, 0, 0, 0, 1]])
    # print(inp.shape)
    result = a.predict(inp)
    print(result)