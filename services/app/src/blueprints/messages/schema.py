from marshmallow import Schema, fields


class MessageSchema(Schema):
    id = fields.Int(dump_only=True)
    body = fields.Str(required=True)
    created_on = fields.DateTime(dump_only=True)
    author_id = fields.Int(dump_only=True)
    