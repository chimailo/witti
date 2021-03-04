from marshmallow import Schema, fields, validate


class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    sign_in_count = fields.Int(dump_only=True)
    current_sign_in_on = fields.DateTime(dump_only=True)
    last_sign_in_on = fields.DateTime(dump_only=True)
    current_sign_in_ip = fields.Str(
        dump_only=True,
        validate=validate.Length(max=32),
    )
    last_sign_in_ip = fields.Str(
        dump_only=True,
        validate=validate.Length(max=32),
    )
    followers = fields.Function(lambda user: user.followers.count())
    following = fields.Function(lambda user: user.followed.count())
    # relationships
    auth = fields.Nested('AuthSchema', dump_only=True)
    messages = fields.Nested('MessageSchema', many=True)
    posts = fields.Nested('PostSchema', many=True)
    profile = fields.Nested('ProfileSchema', dump_only=True)
    permissions = fields.Nested('PermissionSchema', many=True)
