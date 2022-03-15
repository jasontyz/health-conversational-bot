import sys
from flask import Flask, jsonify, make_response
from flask_cors import CORS


def terminate(t):
    print('Stopping')
    t.terminate()
    exit(0)


def make_app(c, m):
    app = Flask(__name__)

    @app.route('/',
               defaults={'path': ''},
               methods=['GET', 'PUT', 'POST', 'DELETE'])
    @app.route('/<path:path>', methods=['GET', 'PUT', 'POST', 'DELETE'])
    def f(path):
        resp = jsonify(message=m)
        resp = make_response(resp, c)
        resp.headers['Content-Type'] = 'application/json'
        return resp

    return app


def run_app(c, m):
    app = make_app(c, m)
    CORS(app)
    print('Started to run')
    app.run(port=5000)


def main():
    cm = sys.argv[1]
    print(cm)
    args = [arg.strip() for arg in cm.split(',')]
    print({"code": args[0], "message": args[1]})
    run_app(c=int(args[0]), m=args[1])


if __name__ == '__main__':
    main()
