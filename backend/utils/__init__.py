from flask import request
from flask_restx.errors import abort


def parse_request_body():
    body = request.json
    if not body:
        abort(400, 'invalid request body, expect "application/json"')
    return body


def get_fields(obj: dict, *args, as_dict=False, should_validate=True):
    req_keys = list(obj.keys())
    if should_validate:
        for key in args:
            if key not in req_keys:
                abort(400, 'missing field in request: {}'.format(key))
    if as_dict:
        return dict([(key, obj.get(key, None)) for key in args])
    if len(args) == 1:
        return obj[args[0]]
    return [obj.get(key, None) for key in args]
