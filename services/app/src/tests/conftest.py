import pytest

from src import create_app, db as _db
from src.config import TestingConfig
from src.utils.perms import set_model_perms
from src.tests.utils import add_user, add_group, add_post, add_comment
from src.blueprints.auth.models import User
from src.blueprints.posts.models import Post
from src.blueprints.admin.models import Group


@pytest.fixture(scope='session')
def app():
    """
    Create and configure a new app instance for each test.

    :returns -- object: Flask app
    """
    # create the app with test config.
    app = create_app(config=TestingConfig)

    ctx = app.app_context()
    ctx.push()

    yield app

    ctx.pop()


@pytest.fixture(scope='function')
def client(app):
    """
    Setup an app client, this gets executed for each client.

    :arguments: app {object} -- Pytext fixture
    :return: Flask app client
    """
    return app.test_client()


@pytest.fixture(scope='session')
def db(app):
    """
    Setup the database, this gets executed for every function

    :param app: Pytest fixture
    :return: SQLAlchemy database session
    """
    _db.drop_all()
    _db.create_all()
    _db.session.commit()

    set_model_perms(User)
    set_model_perms(Group)

    add_user(name='admin', username='user', email='adminuser@test.com')

    return _db


@pytest.yield_fixture(scope='function')
def session(db):
    """
    Allow very fast tests by using rollbacks and nested sessions.
    :param db: Pytest fixture
    :return: None
    """
    db.session.begin_nested()
    yield db.session
    db.session.rollback()

    return db


@pytest.fixture(scope='function')
def users(db, session):
    """
    Create user fixtures. They reset per test.

    :param db: Pytest fixture
    :return: SQLAlchemy database session
    """
    db.session.query(User).delete()

    admin = add_user(
        name='admin',
        username='adminuser',
        email='adminuser@test.com',
        bio='just about me.',
        is_admin=True
    )
    add_user(
        name='regular',
        username='regularuser',
        email='regularuser@test.com'
    )
    common = add_user(
        name='common',
        username='commonuser',
        email='commonuser@test.com'
    )

    common.follow(admin)

    return db


@pytest.fixture(scope='function')
def groups(db, session, users):
    """
    Create group fixtures. They reset per test.

    :param db: Pytest fixture
    :return: SQLAlchemy database session
    """
    db.session.query(Group).delete()

    add_group(name='test group 1')
    add_group(name='test group 3')
    add_group(name='test group 2')

    return db


@pytest.fixture(scope='function')
def token(users):
    """
    Serialize a JWT token.

    :param db: Pytest fixture
    :return: JWT token
    """
    user = User.find_by_identity('adminuser@test.com')
    return user.encode_auth_token(user.id).decode()


@pytest.fixture(scope='function')
def posts(db, session, users):
    """
    Create posts fixtures. They reset per test.

    :param db: Pytest fixture
    :return: SQLAlchemy database session
    """
    db.session.query(Post).delete()

    u1 = User.find_by_identity('adminuser@test.com')
    u2 = User.find_by_identity('regularuser@test.com')
    u3 = User.find_by_identity('commonuser@test.com')

    c1 = add_comment(
        'ullamco laboris nisi ut aliquip ex ea commodo consequat.', u1.id)
    c2 = add_comment(
        'ullamco laboris nisi ut aliquip ex ea commodo consequat.', u1.id)
    c3 = add_comment(
        'Ut enim ad minim veniam, quis nostrud exercitation ',
        u2.id,
        comment_id=c2.id
    )
    c4 = add_comment(
        'ullamco laboris nisi ut aliquip ex ea commodo consequat.', u3.id)

    p1 = add_post(
        'Ut enim ad minim veniam, quis nostrud exercitation ',
        u1.id,
        comments=[c3]
    )
    p2 = add_post(
        'Ut enim ad minim veniam, quis nostrud exercitation ',
        u1.id,
        comments=[c1]
    )
    add_post(
        'Ut enim ad minim veniam, quis nostrud exercitation ',
        u3.id,
        comments=[c4]
    )
    p1.likes.append(u1)
    p2.likes.append(u1)

    return db
