from functools import wraps

from flask import request

from src.blueprints.errors import error_response
from src.blueprints.auth.models import Auth


def authenticate(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return error_response(403, message='No authorization.')

        token = auth_header.split(" ")[1]
        payload = Auth.decode_auth_token(token)

        if not isinstance(payload, dict):
            return error_response(401, message=payload)

        auth = Auth.find_by_id(payload.get('id'))

        if auth is None or auth.is_active is not True:
            return error_response(401, message='Invalid token.')

        return func(auth.user, *args, **kwargs)
    return wrapper
