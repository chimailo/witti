import json

from src.blueprints.auth.models import User


def test_check_email_does_not_exist(client, users):
    response = client.post(
        '/api/auth/check-email',
        data=json.dumps({'email': 'testuser@test.com'}),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert data.get('res') is True


def test_check_email_do_exist(client, users):
    response = client.post(
        '/api/auth/check-email',
        data=json.dumps({'email': 'adminuser@test.com'}),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert data.get('res') is False


def test_check_username_does_not_exist(client, users):
    response = client.post(
        '/api/auth/check-username',
        content_type='application/json',
        data=json.dumps({'username': 'user'}),
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert data.get('res') is True


def test_check_username_do_exist(client, users):
    response = client.post(
        '/api/auth/check-username',
        content_type='application/json',
        data=json.dumps({'username': 'regularuser'}),
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert data.get('res') is False


def test_register_user_no_data(client):
    response = client.post(
        '/api/auth/register',
        data=json.dumps({}),
        content_type='application/json'
    )
    assert response.status_code == 400


def test_register_user_invalid_data(client):
    response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'name': 'test',
            'username': 'test',
            'email': 'invalidtest.com',
            'password': 'pass'
        }),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 422
    assert data.get('error') is not None
    assert isinstance(data.get('message'), dict) is True


def test_register_user_valid(client, db):
    response = client.post(
        '/api/auth/register',
        data=json.dumps({
            'username': 'common',
            'name': 'user',
            'email': 'usercommon@test.host',
            'password': 'password',
        }),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 201
    assert response.headers['Location'] is not None
    assert isinstance(data.get('token'), str) is True


def test_valid_user_login(client, users):
    user = User.find_by_identity('regularuser@test.com')
    old_sign_in_count = user.sign_in_count

    response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'identity': 'regularuser@test.com',
            'password': 'password'
        }),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    new_sign_in_count = user.sign_in_count

    assert response.status_code == 200
    assert isinstance(data.get('token'), str) is True
    assert (old_sign_in_count + 1) == new_sign_in_count


def test_login_user_incorrect_password(client, users):
    response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'email': 'regularuser@test.com',
            'password': 'asecret'
        }),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 401
    assert 'Invalid credentials' in data.get('message')
    assert data.get('token') is None


def test_invalid_user_login(client, users):
    response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'email': 'userest.host',
            'password': 'password'
        }),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 401
    assert 'Invalid credentials' in data.get('message')
    assert data.get('token') is None


def test_logout_user(client, token):
    response = client.get(
        '/api/auth/logout',
        headers={'Authorization': f'Bearer {token}'}
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert 'logged out' in data.get('message')


def test_get_user(client, token):
    response = client.get(
        '/api/auth/user',
        headers={'Authorization': f'Bearer {token}'}
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert isinstance(data, dict) is True
    assert data.get('username') == 'adminuser'
    assert data.get('profile')['name'] == 'admin'
