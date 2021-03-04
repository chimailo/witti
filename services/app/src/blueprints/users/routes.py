from sqlalchemy import exc
from flask import Blueprint, current_app, jsonify, request

from src import db
from src.utils import urlsafe_base64
from src.utils.decorators import authenticate
from src.blueprints.errors import server_error, not_found
from src.blueprints.users.models import User
from src.blueprints.auth.models import Auth
from src.blueprints.posts.models import Post
from src.blueprints.users.schema import UserSchema
from src.blueprints.posts.schema import PostSchema
from src.blueprints.messages.schema import MessageSchema


users = Blueprint('users', __name__, url_prefix='/api/users')


@users.route('/ping', methods=['GET'])
def ping():
    return {'message': 'Users Route!'}


@users.route('/<int:id>/follow', methods=['POST'])
@authenticate
def follow(user, id):
    to_follow = User.find_by_id(id)

    if not to_follow:
        return not_found('User not found')

    user.follow(to_follow)

    try:
        user.save()
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
    else:
        following = UserSchema(
            only=('id', 'auth.username', 'profile')).dump(to_follow)
        following['isFollowing'] = user.is_following(to_follow)
        return jsonify(following)


@users.route('/<int:id>/unfollow', methods=['POST'])
@authenticate
def unfollow(user, id):
    followed = User.find_by_id(id)

    if not followed:
        return not_found('User not found')

    user.unfollow(followed)

    try:
        user.save()
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
    else:
        follow = UserSchema(
            only=('id', 'auth.username', 'profile')).dump(followed)
        follow['isFollowing'] = user.is_following(followed)
        return jsonify(follow)


@users.route('/<username>/followers', methods=['GET'])
@authenticate
def get_followers(user, username):
    """Get list of users following a user"""
    a_user = Auth.find_by_identity(username).user

    if not a_user:
        return not_found('User not found.')

    cursor = request.args.get('cursor')
    items_per_page = current_app.config['ITEMS_PER_PAGE']
    nextCursor = None
    followers = None

    try:
        query = a_user.followers.order_by(User.id.desc())

        if cursor == '0':
            followers = query.limit(items_per_page + 1).all()
        else:
            cursor = int(urlsafe_base64(cursor, from_base64=True))
            followers = query.filter(
                User.id < cursor).limit(items_per_page + 1).all()

    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
    else:
        if len(followers) > items_per_page:
            nextCursor = urlsafe_base64(str(followers[items_per_page - 1].id))

        user_followers = []
        for a_user in followers[:items_per_page]:
            follower = UserSchema(
                only=('id', 'auth.username', 'profile')).dump(a_user)
            follower['isFollowing'] = user.is_following(a_user)
            user_followers.append(follower)

        return {
            'data': user_followers,
            'total': query.count(),
            'nextCursor': nextCursor,
        }


@users.route('/<username>/following', methods=['GET'])
@authenticate
def get_following(user, username):
    """Get list of users following a user"""
    a_user = Auth.find_by_identity(username).user

    if not a_user:
        return not_found('User not found.')

    cursor = request.args.get('cursor')
    items_per_page = current_app.config['ITEMS_PER_PAGE']
    nextCursor = None
    following = None

    try:
        query = a_user.followed.order_by(User.id.desc())

        if cursor == '0':
            following = query.limit(items_per_page + 1).all()
        else:
            cursor = int(urlsafe_base64(cursor, from_base64=True))
            following = query.filter(
                User.id < cursor).limit(items_per_page + 1).all()

    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
    else:
        if len(following) > items_per_page:
            nextCursor = urlsafe_base64(str(following[items_per_page - 1].id))

        users_following = []
        for a_user in following[:items_per_page]:
            following = UserSchema(
                only=('id', 'auth.username', 'profile')).dump(a_user)
            following['isFollowing'] = user.is_following(a_user)
            users_following.append(following)

        return {
            'data': users_following,
            'total': query.count(),
            'nextCursor': nextCursor,
        }


@users.route('/<username>/posts', methods=['GET'])
@authenticate
def get_user_posts(user, username):
    """Get a users list of posts"""
    a_user = Auth.find_by_identity(username).user

    if not a_user:
        return not_found('User not found.')

    cursor = request.args.get('cursor')
    items_per_page = current_app.config['ITEMS_PER_PAGE']
    query = Post.query.with_parent(a_user).filter(
        Post.comment_id.is_(None)).order_by(Post.created_on.desc())
    nextCursor = None
    posts = None

    if cursor == '0':
        posts = query.limit(items_per_page + 1).all()
    else:
        cursor = urlsafe_base64(cursor, from_base64=True)
        posts = query.filter(
            Post.created_on < cursor).limit(items_per_page + 1).all()

    if len(posts) > items_per_page:
        nextCursor = urlsafe_base64(
            posts[items_per_page - 1].created_on.isoformat())

    return {
        'data': [post.to_dict(user) for post in posts[:items_per_page]],
        'nextCursor': nextCursor,
        'total': query.count(),
    }


@users.route('/<username>/comments', methods=['GET'])
@authenticate
def get_user_comments(user, username):
    """Get a users list of comments"""
    a_user = Auth.find_by_identity(username).user

    if not a_user:
        return not_found('User not found.')

    cursor = request.args.get('cursor')
    items_per_page = current_app.config['ITEMS_PER_PAGE']
    query = Post.query.with_parent(a_user).filter(
        Post.comment_id.isnot(None)).order_by(Post.created_on.desc())
    nextCursor = None
    comments = None

    if cursor == '0':
        comments = query.limit(items_per_page + 1).all()
    else:
        cursor = urlsafe_base64(cursor, from_base64=True)
        comments = query.filter(
            Post.created_on < cursor).limit(items_per_page + 1).all()

    if len(comments) > items_per_page:
        nextCursor = urlsafe_base64(
            comments[items_per_page - 1].created_on.isoformat())

    comment_list = []
    for c in comments[:items_per_page]:
        comment = c.to_dict(user)
        comment['parent'] = PostSchema(
            only=('id', 'body', 'author',)).dump(c.parent)
        comment_list.append(comment)

    return {
        'data': comment_list,
        'nextCursor': nextCursor,
        'total': query.count(),
    }


@users.route('/<username>/likes', methods=['GET'])
@authenticate
def get_liked_posts(user, username):
    """Get a users list of liked posts"""
    a_user = Auth.find_by_identity(username).user

    if not a_user:
        return not_found('User not found.')

    cursor = request.args.get('cursor')
    items_per_page = current_app.config['ITEMS_PER_PAGE']
    query = a_user.likes.order_by(Post.created_on.desc())
    nextCursor = None
    posts = None

    if cursor == '0':
        posts = query.limit(items_per_page + 1).all()
    else:
        cursor = urlsafe_base64(cursor, from_base64=True)
        posts = query.filter(
            Post.created_on < cursor).limit(items_per_page + 1).all()

    if len(posts) > items_per_page:
        nextCursor = urlsafe_base64(
            posts[items_per_page - 1].created_on.isoformat())

    liked_posts = []
    for p in posts[:items_per_page]:
        post = p.to_dict(user)

        if p.parent:
            post['parent'] = PostSchema(
                only=('id', 'body', 'author',)).dump(p.parent)
        liked_posts.append(post)

    return {
        'data': liked_posts,
        'nextCursor': nextCursor,
        'total': query.count(),
    }


@users.route('/messages', methods=['GET'])
@authenticate
def get_messages(user):
    cursor = request.args.get('cursor')
    items_per_page = current_app.config['ITEMS_PER_PAGE']
    stmt, query = user.get_last_messages_in_conv()
    last_messages = None
    nextCursor = None
    messages = []

    if cursor == '0':
        last_messages = query.limit(items_per_page + 1).all()
    else:
        cursor = urlsafe_base64(cursor, from_base64=True)
        last_messages = query.filter(
            stmt.c.last_messages < cursor).limit(items_per_page + 1).all()

    if len(last_messages) > items_per_page:
        nextCursor = urlsafe_base64(
            last_messages[items_per_page - 1].last_messages.isoformat())

    for msg, user1, user2, _ in last_messages[:items_per_page]:
        author = user2 if user.id == user1.id else user1
        last_read_msg = user.last_read_msg_ts(msg.conversation_id)
        message = MessageSchema(exclude=('author_id',)).dump(msg)
        message['isRead'] = False if not last_read_msg else \
            last_read_msg.timestamp >= msg.created_on
        message['user'] = {
            'id': author.id,
            'username': author.auth.username,
            'name': author.profile.name,
            'avatar': author.profile.avatar
        }
        messages.append(message)

    return {
        'data': messages,
        'nextCursor': nextCursor,
    }
