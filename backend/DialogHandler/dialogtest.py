import sys, os
from google.cloud import dialogflow
from DialogHandler import detect_intent_texts
from credentials import PROJECT_ID, LANGUAGE_CODE

if __name__ == "__main__":

    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/Users/yuanzhang/Desktop/comp3900/capstone-project-3900-w18a-starplatinum/backend/DialogHandler/service-account-file.json"

    while True:
        texts = []
        user_input = input("Me: ")

        if user_input == 'quit':
            break
        
        elif user_input:
            response = detect_intent_texts(123456789, user_input)

            print(f"\nFulfillment text: {response.query_result.fulfillment_text}\n")
            print(f"Intent: {response.query_result.intent.display_name} Confidence: ({response.query_result.intent_detection_confidence})\n")


        