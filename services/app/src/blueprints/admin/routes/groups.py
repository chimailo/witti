from marshmallow import ValidationError
from sqlalchemy import exc
from flask import request, url_for, jsonify, current_app

from src import db
from src.blueprints.errors import error_response, \
    bad_request, server_error, not_found
from src.blueprints.admin.routes import admin
from src.blueprints.users.models import User
from src.blueprints.admin.models import Group, Permission
from src.blueprints.admin.schema import GroupSchema


@admin.route('/groups/page/<int:page>', methods=['GET'])
@admin.route('/groups', methods=['GET'])
# @permission_required(['can_view_Group'])
def get_groups(page=1):
    """Get list of groups"""
    groups = Group.query.paginate(
        page, current_app.config['ITEMS_PER_PAGE'], False)
    next_url = url_for('admin.get_groups', page=groups.next_num) \
        if groups.has_next else None
    prev_url = url_for('admin.get_groups', page=groups.prev_num) \
        if groups.has_prev else None

    return {
        'items': GroupSchema(many=True).dump(groups.items),
        'next_url': next_url,
        'prev_url': prev_url
    }


@admin.route('/groups/<int:id>', methods=['GET'])
# @permission_required(['can_view_user'])
def get_group(id):
    """Get a single group"""
    group = Group.find_by_id(id)
    if group is None:
        return not_found('Group not found!')
    return jsonify(GroupSchema().dump(group))


@admin.route('/groups', methods=['POST'])
# @permission_required(['can_view_user'])
def add_group():
    request_data = request.get_json()

    if not request_data:
        return bad_request('No input data provided.')

    try:
        data = GroupSchema().load(request_data)

        name = data.get('name')
        description = data.get('description')

        # check for existing group name
        group = Group.find_by_name(name=name)

        if group:
            return bad_request('Group already exist.')

        group = Group(name=name, description=description)
        group.save()

        response = jsonify(GroupSchema().dump(group))
        response.status_code = 201
        response.headers['Location'] = url_for('admin.get_group', id=group.id)
        return response

    # handle errors
    except ValidationError as err:
        return error_response(422, err.messages)
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')


@admin.route('/groups/<int:id>', methods=['PUT'])
# @permission_required(['can_view_user'])
def update_group(id):
    request_data = request.get_json()

    if not request_data:
        return bad_request('No input data provided.')

    try:
        data = GroupSchema().load(request_data)

        # check for existing group name
        group = Group.find_by_id(id)
        existing_group = Group.find_by_name(name=data.get('name'))

        if existing_group is not None:
            if existing_group.id != group.id:
                return bad_request(f'Group already exists.')

        group.name = data.get('name')
        group.description = data.get('description')
        group.save()

        return jsonify(GroupSchema().dump(group))

    # handle errors
    except ValidationError as err:
        return error_response(422, err.messages)
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')


@admin.route('/groups/<int:id>', methods=['DELETE'])
# @permission_required(['can_delete_user'])
def delete_group(id):
    try:
        group = Group.find_by_id(id)

        if not group:
            return not_found('Group does not exist.')

        group.delete()
        return {'message': 'Successfully deleted group.'}
    except Exception as error:
        return {'message': error}


@admin.route('/groups/<int:grp_id>/members', methods=['PUT'])
# @permission_required(['can_delete_user'])
def add_group_members(grp_id):
    data = request.get_json()
    group = Group.find_by_id(grp_id)

    users = []
    for id in data.get('users'):
        user = User.find_by_id(id)
        users.append(user)

    group.add_members(users)
    return jsonify(GroupSchema().dump(group))


@admin.route('/groups/<int:grp_id>/members', methods=['DELETE'])
# @permission_required(['can_delete_user'])
def remove_group_members(grp_id):
    data = request.get_json()
    group = Group.find_by_id(grp_id)

    users = []
    for id in data.get('users'):
        user = User.find_by_id(id)
        users.append(user)

    group.remove_members(users)
    return jsonify(GroupSchema().dump(group))


@admin.route('/groups/<int:grp_id>/permissions', methods=['PUT'])
# @permission_required(['can_delete_user'])
def add_group_permissions(grp_id):
    data = request.get_json()
    group = Group.find_by_id(grp_id)

    perms = []
    for id in data.get('perms'):
        perm = Permission.find_by_id(id)
        perms.append(perm)

    group.add_permissions(perms)
    return jsonify(GroupSchema().dump(group))


@admin.route('/groups/<int:grp_id>/permissions', methods=['DELETE'])
# @permission_required(['can_delete_perms'])
def remove_group_permissions(grp_id):
    data = request.get_json()
    group = Group.find_by_id(grp_id)

    perms = []
    for id in data.get('perms'):
        perm = Permission.find_by_id(id)
        perms.append(perm)

    group.remove_permissions(perms)
    return jsonify(GroupSchema().dump(group))
