API_SERVER_PORT = 5000
from server.app import app

if __name__ == "__main__":
    app.run(port=API_SERVER_PORT, debug=True)
