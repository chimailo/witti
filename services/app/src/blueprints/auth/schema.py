import re
from marshmallow import Schema, fields, validate, validates, ValidationError


class AuthSchema(Schema):
    username = fields.Str(
        validate=validate.Length(min=3, max=32),
        required=True,
        error_messages={"required": "Name is required."}
    )
    email = fields.Email(
        required=True,
        error_messages={"required": "Email is required."}
    )
    password = fields.Str(
        required=True,
        load_only=True,
        validate=validate.Length(min=6),
        error_messages={"required": "Password is required."}
    )
    name = fields.Str(
        validate=validate.Length(min=2, max=128),
        load_only=True,
        required=True,
        error_messages={"required": "Name is required."}
    )
    is_active = fields.Boolean()
    is_admin = fields.Boolean()
    created_on = fields.DateTime(dump_only=True)
    updated_on = fields.DateTime(dump_only=True)


@validates('username')
def validate_username(self, username):
    if re.match('^[a-zA-Z0-9_]+$', username) is None:
        raise ValidationError(
            'Username can only contain valid characters.'
        )
