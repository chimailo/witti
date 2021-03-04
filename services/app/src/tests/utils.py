from src.blueprints.profiles.models import Profile
from src.blueprints.auth.models import User
from src.blueprints.posts.models import Comment, Post
from src.blueprints.admin.models import Group


def add_user(
        name,
        email,
        username='',
        avatar='',
        bio='',
        is_admin=False,
        is_active=True,
        permissions=[]):

    profile = Profile(name=name, bio=bio)
    profile.avatar = avatar or profile.set_avatar(email)

    user = User(password='password')
    user.email = email
    user.username = username
    user.is_admin = is_admin
    user.is_active = is_active
    user.add_permissions(permissions)
    user.profile = profile

    user.save()
    return user


def add_post(body, user_id, comments=[]):
    post = Post()
    post.body = body
    post.user_id = user_id

    if comments:
        post.comments.extend(comments)

    post.save()
    return post


def add_comment(body, user_id, post_id=None, comment_id=None):
    comment = Post()
    comment.body = body
    comment.user_id = user_id

    if post_id:
        comment.post_id = post_id

    if comment_id:
        comment.comment_id = comment_id

    comment.save()
    return comment


def add_group(name, description='', members=[], permissions=[]):
    group = Group(name=name, description=description)
    group.add_members(members)
    group.add_permissions(permissions)
    group.save()
    return group
