import re
from marshmallow import Schema, fields, validate, validates, ValidationError


class GroupSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(
        validate=validate.Length(min=2, max=32),
        required=True,
        error_messages={"required": "Group name is required."}
    )
    description = fields.Str(
        validate=validate.Length(min=2, max=250),
    )
    # relationships
    members = fields.Nested('UserSchema', only=(
        'id', 'username', 'email',), many=True)
    permissions = fields.Nested('PermissionSchema', many=True)

    @validates('name')
    def validate_name(self, name):
        if re.match('^[a-zA-Z0-9_. ]+$', name) is None:
            raise ValidationError(
                'Group name can only contain valid'
                'characters: A-Z, a-z, 0-9, and _.'
            )


class PermissionSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(dump_only=True)
    code_name = fields.Str(dump_only=True)
