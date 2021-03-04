# from flask import current_app
from src import db
from src.blueprints.auth.models import User
from src.blueprints.profiles.models import Profile
from src.blueprints.admin.models import Group, Permission


# auth
#############
def test_password_hashing(db):
    user = User.find_by_identity('adminuser@test.com')
    assert user.check_password('secret') is False
    assert user.check_password('password') is True


def test_avatar(users):
    user = User.find_by_identity('regularuser@test.com')
    profile = Profile.query.filter_by(user_id=user.id).first()
    assert profile.avatar == ('https://www.gravatar.com/avatar/'
                        'e6b6b9ec69c4837878505768b621d383?s=128&d=mm&r=pg')


def test_encode_token(token):
    """ Token serializer encodes a JWT correctly. """
    assert token.count('.') == 2


def test_decode_token(token):
    """ Token decoder decodes a JWT correctly. """
    payload = User.decode_auth_token(token)
    user = User.find_by_id(payload.get('id'))
    assert isinstance(user, User) is True
    assert user.email == 'adminuser@test.com'


def test_decode_token_invalid(token):
    """ Token decoder returns 'Invalid token' when
    it's been tampered with."""
    payload = User.decode_auth_token(f'{token}1337')
    assert isinstance(payload, User) is False
    assert 'Invalid token' in payload


# def test_decode_token_expired(users):
#     """ Token decoder returns None when it's been tampered with. """
#     current_app.config['TOKEN_EXPIRATION_SECONDS'] = -1
#     user = User.find_by_identity('regularuser@test.com')
#     token = user.encode_auth_token(user.id)
#     payload = User.decode_auth_token(token)
#     assert isinstance(payload, User) is False
#     assert 'Signature expired', payload


def test_follow(users):
    u1 = User.find_by_identity('regularuser@test.com')
    u2 = User.find_by_identity('commonuser@test.com')
    assert u1.followed.all() == []
    assert u1.followers.all() == []

    u1.follow(u2)
    db.session.commit()
    assert u1.is_following(u2) is True
    assert u1.followed.count() == 1
    assert u1.followed.first().username == 'commonuser'
    assert u2.followers.count() == 1
    assert u2.followers.first().username == 'regularuser'

    u1.unfollow(u2)
    db.session.commit()
    assert u1.is_following(u2) is False
    assert u1.followed.count() == 0
    assert u2.followers.count() == 0


def test_user_perms(users):
    name1 = Permission.set_code_name('can add users')
    name2 = Permission.set_code_name('can edit groups')
    perm1 = Permission.find_by_name(name1)
    perm2 = Permission.find_by_name(name2)
    user = User.find_by_identity('adminuser@test.com')

    user.add_permissions([perm1, perm2])
    assert user.permissions.count() == 2
    assert user.user_has_perm(perm2) is True

    user.remove_permissions([perm2])
    assert user.user_has_perm(perm2) is False
    assert user.permissions.count() == 1


def test_user_get_all_perms(users, groups):
    name1 = Permission.set_code_name('can add users')
    name2 = Permission.set_code_name('can edit groups')
    perm1 = Permission.find_by_name(name1)
    perm2 = Permission.find_by_name(name2)
    user = User.find_by_identity('adminuser@test.com')
    grp = Group.find_by_name('test group 1')
    grp.add_members([user])

    assert len(user.get_all_perms()) == 0
    user.add_permissions([perm1])
    grp.add_permissions([perm2])

    assert len(user.get_all_perms()) == 2
    assert user.has_permission(perm2.code_name) is True
    assert user.has_permission(perm1.code_name) is True
    assert user.has_permissions([perm1.code_name, perm2.code_name]) is True


def test_group_members(users, groups):
    admin = User.find_by_identity('adminuser@test.com')
    regular = User.find_by_identity('regularuser@test.com')
    grp = Group.find_by_name('test group 1')

    grp.add_members([regular, admin])
    assert grp.is_group_member(regular) is True
    assert grp.members.count() == 2

    grp.remove_members([regular])
    assert grp.is_group_member(regular) is False
    assert grp.members.count() == 1


def test_group_perms(groups):
    name1 = Permission.set_code_name('can view groups')
    name2 = Permission.set_code_name('can delete users')
    perm1 = Permission.find_by_name(name1)
    perm2 = Permission.find_by_name(name2)
    grp = Group.find_by_name('test group 1')

    grp.add_permissions([perm1, perm2])
    assert grp.has_perm(perm2) is True
    assert grp.permissions.count() == 2

    grp.remove_permissions([perm2])
    assert grp.has_perm(perm2) is False
    assert grp.permissions.count() == 1
