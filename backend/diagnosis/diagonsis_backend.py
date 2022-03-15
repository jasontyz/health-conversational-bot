from flask import Flask, request, jsonify

app = Flask(__name__)
from diagnosis import APIaccess as apiaccess, constants, conversation


class AmbiguousAnswerException(Exception):
    pass


auth_string = "cb0e6972:7dcf4aa0c050fd31f81ed8f81368889b"

example_mention = [{
    'id': 's_313',
    'name': 'Sensory loss in one limb',
    'common_name': 'Loss of feeling in only one arm or leg',
    'orth': "ca n't feel leg",
    'choice_id': 'present',
    'type': 'symptom',
    'positions': [0, 1, 2, 4],
    'head_position': 2
}, {
    'id': 's_21',
    'name': 'Headache',
    'common_name': 'Headache',
    'orth': 'headache',
    'choice_id': 'present',
    'type': 'symptom',
    'positions': [1],
    'head_position': 1
}, {
    'id': 's_50',
    'name': 'Chest pain',
    'common_name': 'Chest pain',
    'orth': 'chest pain',
    'choice_id': 'present',
    'type': 'symptom',
    'positions': [4, 5],
    'head_position': 5
}]

patient_profiles = {}
# user_id
#     - Status
#     - session_id
#         - chat1
#         - chat2


@app.route('/diagnosis/<string:user_id>', methods=['POST'])
def diagnosis(user_id):
    data = request.data
    query_data = eval(data)
    session_id = query_data['session_id']
    if user_id not in patient_profiles:
        patient_profiles[user_id] = {}
        patient_profiles[user_id][session_id] = {}
        patient_profiles[user_id][session_id]["sympton"] = []
        patient_profiles[user_id][session_id]["status"] = "sympton"
    else:
        if session_id not in patient_profiles[user_id]:
            patient_profiles[user_id][session_id]["sympton"] = []

    status = patient_profiles[user_id][session_id]["status"]
    context = patient_profiles[user_id][session_id]["sympton"]

    text = query_data['query']
    text = query_data['query']
    age = int(query_data['age'])
    age = {'value': age, 'unit': 'year'}
    sex = query_data['sex']
    ## according to the response to decide which stage patient is
    #TODO hardcode this part

    response = {}
    response['session_id'] = session_id
    response['text'] = "Sorry, I can't get what you mean."

    if text == "no more symptom":
        status = "evidence"
        patient_profiles[user_id][session_id]["status"] = "evidence"
        patient_profiles[user_id][session_id]["evidence"] = {}

    # naming = apiaccess.get_observation_names(age, auth_string, user_id)
    if status == 'sympton':
        mentions = conversation.parse_complaint(age, sex, auth_string, user_id,
                                                text, context)
        context.extend(mentions)
        feedback = str("Noting: {}".format(", ".join(
            conversation.mention_as_text(m) for m in mentions)))
        response['text'] = feedback

    elif (status == "evidence"):
        #if first time
        if len(patient_profiles[user_id][session_id]["evidence"]) == 0:
            evidence = apiaccess.mentions_to_evidence(context)
        else:
            #if no first time
            try:
                answer = conversation.extract_decision(text,
                                                       constants.ANSWER_NORM)
                question_item = patient_profiles[user_id][session_id][
                    "evidence"]["question_item"]
                new_evidence = apiaccess.question_answer_to_evidence(
                    question_item, answer)
                patient_profiles[user_id][session_id]["evidence"][
                    "evidences"].extend(new_evidence)
                evidence = patient_profiles[user_id][session_id]["evidence"][
                    "evidences"]
            except (AmbiguousAnswerException, ValueError) as e:
                response['text'] = "Please answer be more clear"
        print(evidence)
        resp = apiaccess.call_diagnosis(evidence, age, sex, user_id,
                                        auth_string)
        question_struct = resp['question']
        diagnoses = resp['conditions']
        should_stop_now = resp['should_stop']

        if should_stop_now:
            # Triage recommendation must be obtained from a separate endpoint,
            # call it now and return all the information together.
            triage_resp = apiaccess.call_triage(evidence, age, sex, user_id,
                                                auth_string)
            naming = apiaccess.get_observation_names(age, auth_string, user_id)
            apiaccess.name_evidence(evidence, naming)
            conversation.summarise_all_evidence(evidence)
            conversation.summarise_diagnoses(diagnoses)
            conversation.summarise_triage(triage_resp)
        else:
            patient_profiles[user_id][session_id]["evidence"][
                "evidences"] = evidence
            patient_profiles[user_id][session_id]["evidence"][
                "question_item"] = question_struct['items'][0]
            response['text'] = question_struct['text']

    print(response)
    return jsonify(response)


if __name__ == '__main__':
    app.run(debug=True)