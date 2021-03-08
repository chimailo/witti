import os
import subprocess
import random
from datetime import datetime

import requests
import click
from sqlalchemy import exc, and_
from flask.cli import FlaskGroup

from src import create_app, db
from src.utils.perms import set_model_perms
from src.blueprints.users.models import User
from src.blueprints.auth.models import Auth
from src.blueprints.profiles.models import Profile
from src.blueprints.posts.models import Post
from src.blueprints.messages.models import Message, Chat, LastReadMessage
from src.blueprints.admin.models import Group
from src.blueprints.admin.models import Permission
from src.blueprints.admin.models import grp_members, grp_perms
from src.blueprints.users.models import user_perms

app = create_app()
cli = FlaskGroup(create_app=create_app)


def random_timestamp(start, end):
    return random.random() * (end - start) + start


@cli.command()
@click.argument("path", default="src")
def cov(path):
    """
    Run a test coverage report.

    :param path: Test coverage path
    :return: Subprocess call result
    """
    cmd = f"py.test --cov-report term-missing --cov {path}"
    return subprocess.call(cmd, shell=True)


@cli.command()
def routes():
    """
    List all of the available routes.

    :return: str
    """
    output = {}

    for rule in app.url_map.iter_rules():
        route = {
            'path': rule.rule,
            'methods': '({0})'.format(', '.join(rule.methods))
        }

        output[rule.endpoint] = route

    endpoint_padding = max(len(endpoint) for endpoint in output.keys()) + 2

    for key in sorted(output):
        click.echo('{0: >{1}}: {2}'.format(key, endpoint_padding, output[key]))


@cli.command()
@click.option(
    "--skip-init/--no-skip-init",
    default=True,
    help="Skip __init__.py files?"
)
@click.argument("path", default="app")
def flake8(skip_init, path):
    """
    Run flake8 to analyze your code base.

    :param skip_init: Skip checking __init__.py files
    :param path: Path to directory that flake8 would inspect
    :return: Subprocess call result
    """
    flake8_flag_exclude = ""

    if skip_init:
        flake8_flag_exclude = " --exclude __init__.py"

    cmd = f"flake8 {path}{flake8_flag_exclude} --ignore E128 E402 f401"
    return subprocess.call(cmd, shell=True)


@cli.command()
@click.argument('path', default=os.path.join('src', 'tests'))
def test(path):
    """
    Run tests with Pytest.

    :param path: Test path
    :return: Subprocess call result
    """
    cmd = 'py.test {0}'.format(path)
    return subprocess.call(cmd, shell=True)


@click.argument("num_of_users", default=150)
@click.argument("num_of_posts", default=600)
@click.argument("num_of_comments", default=1800)
@cli.command()
def seed_db(num_of_users, num_of_posts, num_of_comments):
    db_init()
    seed_users(num_of_users)
    seed_posts(num_of_posts)
    seed_comments(num_of_comments)
    seed_conversations()
    seed_messages()


def db_init():
    """Initialize the database."""
    db.drop_all()
    db.create_all()
    db.session.commit()

    print("Initializing Database...")
    set_model_perms(User)
    set_model_perms(Auth)
    set_model_perms(Post)
    set_model_perms(Profile, ['edit', 'view'])
    set_model_perms(Group)
    set_model_perms(grp_members, is_table=True)
    set_model_perms(grp_perms, is_table=True)
    set_model_perms(user_perms, is_table=True)

    print("Database was successfully initialized...")
    return None


# @seed.command()
def seed_users(num_of_users):
    """
    Seed the database with users.
    :param num_of_users: Number of users to seed the
    database with, default is 50.
    """
    print('Collecting users...')
    try:
        data = requests.get(
            'https://randomuser.me/api/?'
            f'results={num_of_users}'
            '&inc=name,email,login,picture,dob,location,nat'
        ).json()

        users = []
        perms = Permission.query.all()

        for user in data.get('results'):
            u = User()

            u.auth = Auth(password='password')
            u.auth.username = user.get('login')['username']
            u.auth.email = user.get('email')
            u.auth.created_on = random_timestamp(
                datetime(2020, 3, 1), datetime(2020, 7, 28))

            u.profile = Profile()
            u.profile.name = user.get('name')['first'] + \
                ' ' + user.get('name')['last']
            u.profile.avatar = user.get('picture')['thumbnail']
            u.profile.dob = random_timestamp(
                datetime(1970, 3, 1), datetime(2002, 7, 28))
            u.profile.bio = f"Hi, I am {user.get('name')['first']} \
                from {user.get('location')['city']} \
                    {user.get('location')['state']}, {user.get('nat')}. \
                        I am a {user.get('dob')['age']} yrs old, who likes \
                            to tell jokes."
            u.profile.created_on = u.created_on
            
            u.permissions.extend(random.sample(
                perms, k=random.randrange(len(perms))))
            users.append(u)

        print('Setting up followers/following...')

        for user in users:
            following = random.sample(
                users, k=random.randrange(20, int(len(users)/4)))
            user.followed.extend(following)

        print('Saving to database...')
        db.session.add_all(users)
        db.session.commit()

        print(f'Users table seeded with {num_of_users} users...')
    except exc.IntegrityError as error:
        db.session.rollback()
        print(f'Error: {error}')


# @seed.command()
def seed_posts(num_of_posts):
    """Seed the database with some posts."""
    users = User.query.all()
    posts1 = []
    posts2 = []
    post_objs = []

    print('Fetching posts...')

    for i in range(int(num_of_posts/15)):
        posts1.extend(requests.get(
            'https://official-joke-api.appspot.com/jokes/ten').json())

    for i in range(int(num_of_posts/15)):
        posts2.extend(requests.get(
            f'https://sv443.net/jokeapi/v2/joke/Any?\
                blacklistFlags=nsfw,racist,sexist&type=twopart&amount=10',
            headers={'accept': 'application/json'}).json().get('jokes'))

    try:
        print('Saving posts to database...')
        for p in posts1:
            user = random.choice(users)

            # tag = p.get('type')
            body = f"{p.get('setup')} - {p.get('punchline')}"

            post = Post()
            post.body = body
            post.user_id = user.id

            post.likes.extend(random.sample(users, k=random.randrange(36)))
            post.created_on = random_timestamp(
                datetime(2020, 7, 1), datetime(2020, 9, 28))
            post_objs.append(post)

        for p in posts2:
            user = random.choice(users)

            # tag = p.get('category').lower()
            body = f"{p.get('setup')} - {p.get('delivery')}"

            post = Post()
            post.body = body
            post.user_id = user.id

            post.created_on = random_timestamp(
                datetime(2020, 9, 1), datetime(2020, 12, 31))
            post.likes.extend(random.sample(users, k=random.randrange(30)))
            post_objs.append(post)

        db.session.add_all(post_objs)
        db.session.commit()

        print(f'Post table seeded with {num_of_posts} posts...')
    except Exception as error:
        print(f'Error: {error}')


# @seed.command()
def seed_comments(num_of_comments):
    users = User.query.all()
    posts = Post.query.all()
    comments_list = []

    try:
        print('Fetching comments...')
        for i in range(int(num_of_comments/500)):
            comments_list.extend(requests.get(
                'https://jsonplaceholder.typicode.com/comments').json())

        comments = [comment.get('body') for comment in comments_list]

        comments_list = []

        for c in comments:
            user = random.choice(users)
            post = random.choice(posts)

            comment = Post(body=c)
            comment.user_id = user.id
            comment.comment_id = post.id
            comment.created_on = random_timestamp(
                datetime(2021, 1, 1), datetime(2021, 2, 11))
            comment.likes.extend(random.sample(users, k=random.randrange(12)))
            comments_list.append(comment)

        print('Saving to database...')
        db.session.add_all(comments_list)
        db.session.commit()

    except Exception as error:
        print(f'Error: {error}')


# @cli.command()
def seed_conversations():
    users = User.query.all()
    chats = []
    print('Setting up chats...')

    for user in users:
        sample = random.sample(
            user.followed.all(), k=(random.randrange(10, 15)))

        for u in sample:
            chat = Chat.query.filter(
                and_(Chat.user1_id == user.id, Chat.user2_id == u.id) |
                and_(Chat.user1_id == u.id, Chat.user2_id == user.id)).first()

            if chat:
                continue

            chat = Chat(user1_id=user.id, user2_id=u.id)
            chats.append(chat)
    print('Saving to database...')
    db.session.add_all(chats)
    db.session.commit()


# @cli.command()
def seed_messages():
    db.session.query(Message).delete()
    db.session.query(LastReadMessage).delete()
    chats = Chat.query.all()
    messages = []
    lr_msgs = []

    try:
        print('Fetching messages...')
        msgs = requests.get(
            'https://jsonplaceholder.typicode.com/todos').json()
    except Exception as error:
        print(f'Error: {error}')

    for c in chats:
        sample = random.sample(msgs, k=random.randrange(3, 8))

        for msg in sample:
            author = random.choice([c.user1_id, c.user2_id])
            message = Message(author_id=author, body=msg["title"])
            message.created_on = random_timestamp(
                datetime(2021, 1, 12), datetime(2021, 2, 11))
            message.chat_id = c.id
            messages.append(message)

            id = random.choice(
                [0, 0, 0, 0, c.user1_id, c.user2_id, 0, 0, 0, 0, 0, 0])

            if id != 0:
                user = User.find_by_id(id)
                user.deleted_messages.append(message)
                db.session.add(user)

            lrm = LastReadMessage.query.filter(
                and_(
                    LastReadMessage.user_id == author,
                    LastReadMessage.chat_id == c.id)
                ).first()

            if lrm:
                lrm.timestamp = random_timestamp(
                    datetime(2021, 1, 12), datetime(2021, 2, 1))
            else:
                lrm = LastReadMessage(user_id=author, chat_id=c.id)
                lrm.timestamp = random_timestamp(
                    datetime(2021, 1, 12), datetime(2021, 2, 1))
            lr_msgs.append(lrm)
            db.session.add(lrm)

    print('Saving to database...')
    db.session.add_all(messages)
    db.session.commit()


# @cli.command()
def seed_groups():
    """
    Seed the database with a few groups.
    """
    try:
        groups = [
            'partner',
            'junior partner',
            'senior associate',
            'associate',
            'paralegal'
        ]
        users = User.query.limit(24).all()
        perms = Permission.query.all()

        for group in groups:
            grp = Group(name=group)
            grp.members.extend(random.sample(
                users, k=random.randrange(len(users))))
            grp.permissions.extend(random.sample(
                perms, k=random.randrange(len(perms))))
            grp.save()

        print(f'Added users to {len(groups)} groups...')
    except Exception as error:
        print(f'Error: {error}')


if __name__ == '__main__':
    cli()
