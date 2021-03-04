from marshmallow import Schema, fields


class PostSchema(Schema):
    body = fields.Str(required=True)
    parent = fields.Nested(
        'PostSchema', only=('id', 'body', 'author',), dump_only=True)
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
