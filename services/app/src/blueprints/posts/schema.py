import re
from marshmallow import Schema, fields, validate, validates, ValidationError


class PostSchema(Schema):
    body = fields.Str(required=True)
    parent = fields.Nested(
        'PostSchema', only=('id', 'body', 'author',), dump_only=True)
    tags = fields.Nested('TagSchema', many=True, dump_only=True)
    likes = fields.Function(lambda post: post.likes.count())
    comments = fields.Function(lambda post: post.comments.count())
    author = fields.Function(lambda post: {
        'id': post.author.id,
        'username': post.author.auth.username,
        'name': post.author.profile.name,
        'avatar': post.author.profile.avatar,
    })

    class Meta:
        additional = ("id", "created_on", 'updated_on')


class TagSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(validate=validate.Length(min=2, max=16), required=True)
    created_on = fields.DateTime(dump_only=True)
    updated_on = fields.DateTime(dump_only=True)


@validates('name')
def validate_tag_name(self, name):
    print('tag name:', name)
    if re.match('^[a-zA-Z0-9]+$', name) is None:
        print('tag name:', name)
        raise ValidationError('Tag name can only contain valid characters.')
