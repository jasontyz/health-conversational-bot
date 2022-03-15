from flask import Flask, request
import requests
from pymessenger import Bot
from DialogHandler.DialogHandler import dialog_handler
from integration import PlainText

app = Flask(__name__)

VERIFY_TOKEN  = "covid19" # has to be this name: https://github.com/jgorset/facebook-messenger/issues/168
ACCESS_TOKEN = "EAAVH45zchHEBABZBnpA5zFZCs3I8iVzjTD9BFrHZAyj5FSeeEZCED8HhcGlxQSJBmFWDAt1puVhd8kJu60toT9J5i7ZC3znOqq4OK4DbtlQ2SvyH2iet7TdOUls9lQRqa0UEv60QdLzMjZAcUqlN9Xm9IPyoZA9JuGDD1fjtZAUt09qociMCyUBvEQ7PfV5tBnIZD"

bot = Bot(ACCESS_TOKEN)


PlainText.setup_handler(dialog_handler)

@app.route('/', methods=['GET'])
def verify():
    """verify facebook developer login token

    Returns:
        string: msg on if valid token
    """
    if request.args.get('hub.verify_token', '') == VERIFY_TOKEN:
        print("Verified")
        return request.args.get('hub.challenge', ''), 200
    else:
        print("Wrong token")
        return "Error - failed to connect to messenger, wrong validation token", 403

@app.route('/', methods=['POST'])
def webhook():
    """standard webhook format for messenger api

    Returns:
        str: msg of successful senting 
    """
    data = request.get_json()
    print(data)
    sender_id = data['entry'][0]['messaging'][0]['sender']['id']
    msg = data['entry'][0]['messaging'][0]['message']['text']
    response = PlainText.process_msg(dialog_handler, msg)
    bot.send_text_message(sender_id, response)
    return "Message received"

if __name__ == '__main__':
    app.run(host="localhost", port=8000, debug=True)

# def test():
#     while True:
#         t = input("Enter: ")
#         response = PlainText.process_msg(dialog_handler, t)
#         print(response)

#test()