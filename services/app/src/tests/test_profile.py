import json


def test_get_profile(client, users, token):
    response = client.get(
        '/api/profile/adminuser',
        headers={'Authorization': f'Bearer {token}'}
    )
    data = json.loads(response.data.decode())
    print(data)
    assert response.status_code == 200
    assert data.get('username') == 'adminuser'
    assert data.get('profile')['name'] == 'admin'


def test_update_profile_valid(client, token):
    response = client.put(
        '/api/profile',
        data=json.dumps({
            # 'dob': datetime.utcnow,
            'name': 'user',
            'bio': 'I am the admin here.'}),
        content_type='application/json',
        headers={'Authorization': f'Bearer {token}'}
    )
    data = json.loads(response.data.decode())
    assert response.status_code == 200
    assert data.get('bio') is not None


# def test_update_profile_invalid_data(client, token):
#     response = client.put(
#         '/api/profile',
#         headers={'Authorization': f'Bearer {token}'},
#         data=json.dumps({
#             'bio': 'I am the admin'
#         }),
#         content_type='application/json'
#     )
#     data = json.loads(response.data.decode())
#     assert response.status_code == 422
#     # assert data.get('error') is None is False
#     assert isinstance(data.get('error'), str) is True
#     assert isinstance(data.get('message'), dict) is True


def test_delete_profile(client, token):
    response = client.delete(
        '/api/profile',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert response.status_code == 200
