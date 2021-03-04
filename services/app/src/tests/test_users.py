import json

from src import create_app
from src.config import TestingConfig
from src.blueprints.auth.models import User
from src.blueprints.admin.models import Permission

app = create_app(config=TestingConfig)


def test_get_user(client, users):
    user = User.find_by_identity('adminuser@test.com')
    response = client.get(f'/api/admin/users/{user.id}',)
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert data.get('username') == 'adminuser'
    assert data.get('profile')['name'] == 'admin'


def test_get_user_invalid_id(client, users):
    response = client.get('/api/admin/users/66853')
    data = json.loads(response.data.decode())
    assert response.status_code == 404
    assert 'User not found' in data.get('message')
    assert 'Not Found' in data.get('error')


def test_get_all_users(client, users):
    response = client.get('/api/admin/users')
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert len(data.get('items')) == app.config['ITEMS_PER_PAGE']


def test_all_users_with_pagination_first_page(client, users):
    response = client.get('/api/admin/users/page/1')
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert len(data.get('items')) <= app.config['ITEMS_PER_PAGE']
    assert data.get('next_url') == '/api/admin/users/page/2'
    assert data.get('prev_url') is None


def test_all_users_with_pagination_last_page(client, users):
    response = client.get('/api/admin/users/page/2')
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert len(data.get('items')) <= app.config['ITEMS_PER_PAGE']
    assert data.get('prev_url') == '/api/admin/users/page/1'
    assert data.get('next_url') is None


def test_add_user_no_data(client):
    response = client.post(
        '/api/admin/users',
        data=json.dumps({}),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 400
    assert 'No input data provided' in data.get('message')


def test_add_user_invalid_data(client):
    response = client.post(
        '/api/admin/users',
        data=json.dumps({
            'name': 'common',
            'username': 'user',
            'email': 'commonuser.host',
            'password': 'password',
        }),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 422
    assert data.get('message') is not None


def test_add_user_duplicate_email(client):
    response = client.post(
        '/api/admin/users',
        data=json.dumps({
            'name': 'common',
            'username': 'user',
            'email': 'adminuser@test.com',
            'password': 'password',
        }),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 400
    assert 'user already exists.' in data.get('message')


def test_add_user_duplicate_username(client):
    response = client.post(
        '/api/admin/users',
        data=json.dumps({
            'name': 'common',
            'username': 'commonuser',
            'email': 'user@test.host',
            'password': 'password',
        }),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 400
    assert 'user already exists.' in data.get('message')


def test_add_user_valid(client):
    response = client.post(
        '/api/admin/users',
        data=json.dumps({
            'username': 'test',
            'name': 'user',
            'email': 'testuser@test.host',
            'password': 'password',
        }),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 201
    assert response.headers['Location'] is not None
    assert isinstance(data, dict) is True
    assert data.get('username') == 'test'


def test_update_user_duplicate_username(client, users):
    user = User.find_by_identity('regularuser@test.com')
    response = client.put(
        f'/api/admin/users/{user.id}',
        data=json.dumps({
            'auth': {
                'username': 'commonuser',
                'is_active': True,
                'is_admin': True,
            },
            'name': 'test',
            'bio': 'Another user.'
        }),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 400
    assert 'Username already exists.' in data.get('message')


def test_update_user_no_data(client, users):
    user = User.find_by_identity('adminuser@test.com')
    response = client.put(
        f'/api/admin/users/{user.id}',
        data=json.dumps({}),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 400
    assert 'No input data provided' in data.get('message')


def test_update_user_invalid_data(client, users):
    response = client.put(
        '/api/admin/users/2',
        data=json.dumps({
            'name': 'test1',
            'username': 'w.',
            'bio': 'test user',
            'email': 'user1@test.host',
        }),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 422
    assert data.get('message') is not None


def test_update_user(client, users):
    user = User.find_by_identity('commonuser@test.com')
    response = client.put(
        f'/api/admin/users/{user.id}',
        data=json.dumps({
            'bio': 'test user',
            'name': 'test',
            'auth': {
                'username': 'testuser',
                'is_active': True,
                'is_admin': True,
            }
        }),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert isinstance(data, dict) is True
    assert data.get('username') == 'testuser'


def test_delete_user(client, users):
    user = User.find_by_identity('commonuser@test.com')
    response = client.delete(
        f'/api/admin/users/{user.id}',)
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert 'deleted user' in data.get('message')


def test_delete_user_invalid_id(client, users):
    response = client.delete(
        '/api/admin/users/333',
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 404
    assert 'User does not exist.' in data.get('message')


def test_add_user_perms(client, users):
    name1 = Permission.set_code_name('can view groups')
    name2 = Permission.set_code_name('can delete users')
    perm1 = Permission.find_by_name(name1)
    perm2 = Permission.find_by_name(name2)
    user = User.find_by_identity('adminuser@test.com')

    response = client.put(
        f'/api/admin/users/{user.id}/permissions',
        content_type='application/json',
        data=json.dumps({'perms': [perm1.id, perm2.id]})
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert len(data.get('permissions')) == 2
    assert data.get('permissions')[1]['name'] == 'can view groups'
    assert data.get('permissions')[0]['name'] == 'can delete users'


def test_remove_user_perms(client, users):
    name1 = Permission.set_code_name('can view groups')
    name2 = Permission.set_code_name('can delete users')
    perm1 = Permission.find_by_name(name1)
    perm2 = Permission.find_by_name(name2)
    user = User.find_by_identity('adminuser@test.com')
    user.add_permissions([perm2, perm1])
    assert len(user.permissions.all()) == 2

    response = client.delete(
        f'/api/admin/users/{user.id}/permissions',
        content_type='application/json',
        data=json.dumps({'perms': [perm1.id, perm2.id]})
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert len(data.get('permissions')) == 0
