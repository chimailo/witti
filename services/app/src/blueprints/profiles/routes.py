from flask import jsonify, request, Blueprint
from marshmallow import ValidationError

from src.utils.decorators import authenticate
from src.blueprints.errors import error_response, \
    bad_request, server_error, not_found
from src.blueprints.auth.models import Auth
from src.blueprints.users.schema import UserSchema
from src.blueprints.profiles.schema import ProfileSchema

profile = Blueprint('profile', __name__, url_prefix='/api')


@profile.route('/profile/<username>', methods=['GET'])
@authenticate
def get_profile(user, username):
    a_user = Auth.find_by_identity(username)

    if a_user:
        profile = UserSchema(
            only=('id', 'auth.username', 'profile', 'followers', 'following',)
        ).dump(a_user.user)
        if user.auth.username != username:
            profile['isFollowing'] = user.is_following(a_user)
        return jsonify(profile)

    return not_found('User not found.')


@profile.route('/profile', methods=['PUT'])
@authenticate
def update_profile(user):
    request_data = request.get_json()

    if not request_data:
        return bad_request("No input data provided")

    try:
        data = ProfileSchema().load(request_data)

        profile = user.profile
        profile.name = data.get('name')
        profile.dob = data.get('dob')
        profile.bio = data.get('bio')
        profile.save()

        return jsonify(UserSchema(
            only=('id' 'auth.username', 'profile',)).dump(profile))

    except ValidationError as error:
        return error_response(422, error.messages)
    except Exception:
        return server_error('Something went wrong, please try again.')


@profile.route('/profile', methods=['DELETE'])
@authenticate
def delete_profile(user):
    try:
        user.delete()
        return {'message': 'Successfully deleted.'}
    except Exception:
        return server_error('Something went wrong, please try again.')
