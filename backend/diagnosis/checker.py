from bson.objectid import ObjectId
from requests import api
from requests.sessions import dispatch_hook

import os
import sys
import inspect

currentdir = os.path.dirname(
    os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
sys.path.insert(0, parentdir)

from DialogHandler.DialogHandler import dialog_handler

currentdir = os.path.dirname(
    os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
sys.path.insert(0, parentdir)

from diagnosis import APIaccess, constants, conversation
from diagnosis.diagonsis_backend import AmbiguousAnswerException
from uuid import uuid4

AT_SYMPTOM = 0
AT_EVIDENCE = 1
AT_RESULT = 2
# TOKEN = "cb0e6972:7dcf4aa0c050fd31f81ed8f81368889b"
TOKEN = "c51163d4:8a5967a92586ba06681e9a182e695366"
from db import chatbot_db


class symptomChecker(object):
    def __init__(self):
        self._sessions = dict()

    def diagnosis(self, query, **kwargs):

        print(kwargs)
        session_id = kwargs.pop('session_id')
        status = kwargs.pop('status')

        age = kwargs.pop('age')
        sex = kwargs.pop('sex')
        age = {'value': age, 'unit': 'year'}

        if "user_id" in kwargs:
            uid = kwargs.pop('user_id')

        if "evidence_idx" in kwargs:
            evidence_idx = kwargs.pop('evidence_idx')
        resp = {
            'type': 'plain',
            'session_id': session_id,
            'message': 'Sorry, I didn\'t get it'
        }

        #status who do the status change?

        if status == AT_SYMPTOM:
            #? DO we need to return noting as response
            evidences = self._collect_symptoms(session_id, query, age, sex)
        else:
            try:
                evidences = self._collect_evidence(session_id, query)
            except (AmbiguousAnswerException, ValueError):
                resp[
                    'message'] = 'I didn\'t get it, please rephrase your answer.'
                return
        print(f"Evidence: {evidences}")
        if len(evidences) == 0:
            return resp
        diagnosis_resp = APIaccess.call_diagnosis(evidences, age, sex,
                                                  session_id, TOKEN)
        print(f"diagnosis_resp:{diagnosis_resp}")
        if diagnosis_resp['should_stop'] or evidence_idx == 4:
            resp['type'] = 'diagnosis/result'
            resp['message'] = 'Here is your diagnosis result'
            # print(
            #     APIaccess.call_triage(
            #         self._sessions[session_id]['evidence']['evidences'],
            #         age,
            #         sex=sex,
            #         case_id=session_id,
            #         auth_string=TOKEN))
            naming = APIaccess.get_observation_names(age, TOKEN, session_id)
            APIaccess.name_evidence(
                self._sessions[session_id]['evidence']['evidences'], naming)
            text = conversation.summarise_all_evidence_text(
                self._sessions[session_id]['evidence']['evidences'])
            if uid is not None:
                chatbot_db.users.update_one({"_id": ObjectId(uid)},
                                            {"$push": {
                                                "symptoms": text
                                            }})

            resp['data'] = diagnosis_resp['conditions']
        else:
            next_question = diagnosis_resp['question']
            resp['message'] = next_question['text']
            resp['type'] = 'choice'
            self._sessions[session_id]['evidence'][
                'question_item'] = next_question['items'][0]
            resp['data'] = [{
                'text': "Yes",
                'value': "yes"
            }, {
                "text": "No",
                'value': "no"
            }]
        return resp

    def create_session(self, **kwargs):
        session_id = str(uuid4())
        self._sessions[session_id] = {
            'symptoms': [],
            'evidence': {
                'question_item': None,
                'evidences': []
            }
        }
        return {
            'type': 'diagnosis/createSession',
            'message': 'can you describe yout symptoms?',
            'data': {
                'session_id': session_id
            }
        }

    def _collect_symptoms(self, session_id, query, age, sex):
        symptoms = self._sessions[session_id]['symptoms']

        mentions = conversation.parse_complaint(
            age,
            sex,
            TOKEN,
            session_id,
            query,
            symptoms,
        )

        self._sessions[session_id]['symptoms'] = mentions
        # can't directly give a symptoms
        evidences = APIaccess.mentions_to_evidence(mentions)
        self._sessions[session_id]['evidence']['evidences'] = evidences
        return evidences

    def _collect_evidence(self, session_id, query):
        session_context = self._sessions[session_id]
        symptoms = self._sessions[session_id]['symptoms']
        # if len(session_context.items()) == 0:
        #     evidences = APIaccess.mentions_to_evidence(symptoms)
        #     self._sessions[session_id]['evidence']['evidences'] = evidences

        answer = conversation.extract_decision(query, constants.ANSWER_NORM)
        question_item = session_context['evidence']['question_item']
        new_evidence = APIaccess.question_answer_to_evidence(
            question_item, answer)
        self._sessions[session_id]['evidence']['evidences'].extend(
            new_evidence)
        evidences = self._sessions[session_id]['evidence']['evidences']
        return evidences


symptom_checker = symptomChecker()
dialog_handler.register_handler('symptom_check',
                                symptom_checker.create_session)
if __name__ == '__main__':

    session = symptom_checker.create_session()
    session_id = session['data']['session_id']

    kwarg = {"session_id": session_id, "status": 0, "age": 22, "sex": "male"}
    query = "I got a headache. feel cold"

    ans = symptom_checker.diagnosis(query, **kwarg)
    print(ans['message'])

    for i in range(15):
        kwarg = {
            "session_id": session_id,
            "status": 1,
            "age": 22,
            "sex": "male"
        }
        query = "no"
        ans = symptom_checker.diagnosis(query, **kwarg)
        print(ans['message'])