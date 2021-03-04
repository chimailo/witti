import json

from src import create_app
from src.config import TestingConfig
from src.blueprints.auth.models import User
from src.blueprints.admin.models import Group, Permission

app = create_app(config=TestingConfig)


def test_get_group(client, groups):
    group = Group.find_by_name('test group 1')
    response = client.get(f'/api/admin/groups/{group.id}',)
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert data.get('name') == 'test group 1'


def test_get_group_invalid_id(client, groups):
    response = client.get('/api/admin/groups/66853')
    data = json.loads(response.data.decode())
    assert response.status_code == 404
    assert 'Group not found' in data.get('message')
    assert 'Not Found' in data.get('error')


def test_get_all_groups(client, groups):
    response = client.get('/api/admin/groups')
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert len(data.get('items')) == app.config['ITEMS_PER_PAGE']


def test_all_groups_with_pagination_first_page(client, groups):
    response = client.get('/api/admin/groups/page/1')
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert len(data.get('items')) <= app.config['ITEMS_PER_PAGE']
    assert data.get('next_url') == '/api/admin/groups/page/2'
    assert data.get('prev_url') is None


def test_all_groups_with_pagination_last_page(client, groups):
    response = client.get('/api/admin/groups/page/2')
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert len(data.get('items')) <= app.config['ITEMS_PER_PAGE']
    assert data.get('prev_url') == '/api/admin/groups/page/1'
    assert data.get('next_url') is None


def test_add_group_no_data(client):
    response = client.post(
        '/api/admin/groups',
        data=json.dumps({}),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 400
    assert 'No input data provided' in data.get('message')


def test_add_group_invalid_data(client):
    response = client.post(
        '/api/admin/groups',
        data=json.dumps({
            'name': 'co/d^mmon',
            'description': 'just a common group',
        }),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 422
    assert data.get('message') is not None


def test_add_group_duplicate_name(client, groups):
    response = client.post(
        '/api/admin/groups',
        data=json.dumps({
            'name': 'test group 1',
            'description': 'Another common group',
        }),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 400
    assert 'Group already exist.' in data.get('message')


def test_add_group_valid(client, groups):
    response = client.post(
        '/api/admin/groups',
        data=json.dumps({
            'name': 'test group 4',
            'description': 'just a test group',
        }),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 201
    assert response.headers['Location'] is not None
    assert isinstance(data, dict) is True
    assert data.get('name') == 'test group 4'


def test_update_group_duplicate_name(client, groups):
    group = Group.find_by_name('test group 2')
    response = client.put(
        f'/api/admin/groups/{group.id}',
        data=json.dumps({
            'name': 'test group 1',
            'description': 'just a common group',
        }),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 400
    assert 'Group already exists.' in data.get('message')


def test_update_group_no_data(client, groups):
    group = Group.find_by_name('test group 2')
    response = client.put(
        f'/api/admin/groups/{group.id}',
        data=json.dumps({}),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 400
    assert 'No input data provided' in data.get('message')


def test_update_group_invalid_data(client, groups):
    group = Group.find_by_name('test group 2')
    response = client.put(
        f'/api/admin/groups/{group.id}',
        data=json.dumps({'name': 'tr*st1'}),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 422
    assert data.get('message') is not None


def test_update_group(client, groups):
    group = Group.find_by_name('test group 2')
    response = client.put(
        f'/api/admin/groups/{group.id}',
        data=json.dumps({
            'description': 'test group',
            'name': 'test group',
        }),
        content_type='application/json'
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert isinstance(data, dict) is True
    assert data.get('name') == 'test group'


def test_delete_group(client, groups):
    group = Group.find_by_name('test group 2')
    response = client.delete(f'/api/admin/groups/{group.id}')
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert 'deleted group' in data.get('message')


def test_delete_group_invalid_id(client, groups):
    response = client.delete('/api/admin/groups/333')
    data = json.loads(response.data.decode())
    assert response.status_code == 404
    assert 'Group does not exist.' in data.get('message')


def test_add_group_members(client, users, groups):
    user1 = User.find_by_identity('adminuser@test.com')
    user2 = User.find_by_identity('regularuser@test.com')
    group = Group.find_by_name('test group 1')

    response = client.put(
        f'/api/admin/groups/{group.id}/members',
        content_type='application/json',
        data=json.dumps({'users': [user1.id, user2.id]})
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert len(data.get('members')) == 2
    assert data.get('members')[0]['username'] == 'adminuser'
    assert data.get('members')[1]['username'] == 'regularuser'


def test_remove_group_members(client, users, groups):
    user1 = User.find_by_identity('adminuser@test.com')
    user2 = User.find_by_identity('regularuser@test.com')
    group = Group.find_by_name('test group 3')
    group.add_members([user2, user1])
    assert len(group.members.all()) == 2

    response = client.delete(
        f'/api/admin/groups/{group.id}/members',
        content_type='application/json',
        data=json.dumps({'users': [user1.id, user2.id]})
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert len(data.get('members')) == 0


def test_add_group_perms(client, groups):
    name1 = Permission.set_code_name('can view groups')
    name2 = Permission.set_code_name('can delete users')
    perm1 = Permission.find_by_name(name1)
    perm2 = Permission.find_by_name(name2)
    group = Group.find_by_name('test group 1')

    response = client.put(
        f'/api/admin/groups/{group.id}/permissions',
        content_type='application/json',
        data=json.dumps({'perms': [perm1.id, perm2.id]})
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert len(data.get('permissions')) == 2
    assert data.get('permissions')[1]['name'] == 'can view groups'
    assert data.get('permissions')[0]['name'] == 'can delete users'


def test_remove_group_perms(client, groups):
    name1 = Permission.set_code_name('can view groups')
    name2 = Permission.set_code_name('can delete users')
    perm1 = Permission.find_by_name(name1)
    perm2 = Permission.find_by_name(name2)
    group = Group.find_by_name('test group 3')
    group.add_permissions([perm2, perm1])
    assert len(group.permissions.all()) == 2

    response = client.delete(
        f'/api/admin/groups/{group.id}/permissions',
        content_type='application/json',
        data=json.dumps({'perms': [perm1.id, perm2.id]})
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert len(data.get('permissions')) == 0
