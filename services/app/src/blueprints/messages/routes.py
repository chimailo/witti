from datetime import datetime
from sqlalchemy import exc
from flask import json, jsonify, request, url_for, Blueprint, current_app

from src import db
from src.utils import urlsafe_base64
from src.utils.decorators import authenticate
from src.blueprints.errors import error_response, bad_request, server_error, \
    not_found
from src.blueprints.users.models import User
from src.blueprints.auth.models import Auth
from src.blueprints.messages.models import Message, Conversation, \
    LastReadMessage
from src.blueprints.messages.schema import MessageSchema

messages = Blueprint('messages', __name__, url_prefix='/api/messages')


@messages.route('/ping', methods=['GET'])
def ping():
    return {'message': 'Messages Route!'}


@messages.route('', methods=['GET'])
@authenticate
def get_messages(user):
    username = request.args.get('username', '')
    cursor = request.args.get('cursor')
    items_per_page = current_app.config['ITEMS_PER_PAGE']
    a_user = Auth.find_by_identity(username).user
    nextCursor = None
    msgs = None

    if not a_user:
        return not_found('User not found.')

    try:
        query = user.get_messages_in_conv(a_user)
        conv = user.get_conversation(a_user)

        if cursor == '0':
            msgs = query.limit(items_per_page + 1).all()
        else:
            cursor = urlsafe_base64(cursor, from_base64=True)
            msgs = query.filter(
                Message.created_on < cursor).limit(items_per_page + 1).all()

        if len(msgs) > items_per_page:
            nextCursor = urlsafe_base64(
                msgs[items_per_page - 1].created_on.isoformat())

        # check if lrm exist
        if conv:
            lrm = LastReadMessage.find_by_pk(user.id, conv.id)

            if lrm:
                lrm.timestamp = datetime.utcnow()
            else:
                lrm = LastReadMessage()
                lrm.user_id = user.id
                lrm.conversation_id = conv.id
                lrm.timestamp = datetime.utcnow()
            lrm.save()
    except Exception as e:
        db.session.rollback()
        print(e)
        return server_error('Something went wrong, please try again.')
    else:
        return {
            'data': MessageSchema(many=True).dump(msgs[:items_per_page]),
            'nextCursor': nextCursor
        }


@messages.route('', methods=['POST'])
@authenticate
def create_message(user):
    req_data = request.get_json()
    user_id = request.args.get('user', None, int)

    if not req_data:
        return bad_request("No request data provided")

    try:
        a_user = User.find_by_id(user_id)

        if not a_user:
            return not_found('User not found.')

        conv = user.get_conversation(a_user)

        if not conv:
            conv = Conversation(user1_id=user, user2_id=user_id)
            db.session.add(conv)
            db.session.commit()

        message = Message()
        message.body = json.dumps(req_data.get('body'))
        message.author_id = user.id
        message.created_on = datetime.utcnow()
        message.conversation_id = conv.id
        message.save()

        lrm = LastReadMessage.find_by_pk(user.id, conv.id)

        if lrm:
            lrm.timestamp = datetime.utcnow()
        else:
            lrm = LastReadMessage()
            lrm.user_id = user.id
            lrm.conversation_id = conv.id
            lrm.timestamp = message.created_on
        lrm.save()
    except (exc.IntegrityError, AttributeError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
    else:
        response = jsonify(MessageSchema().dump(message))
        response.status_code = 201
        response.headers['Location'] = url_for(
            'messages.get_messages', user=user, user_id=a_user.id)
        return response


@messages.route('/<int:msg_id>', methods=['DELETE'])
@authenticate
def delete_message(user, msg_id):
    del_for_user = request.args.get('userOnly')
    try:
        message = Message.find_by_id(msg_id)

        if not message:
            return not_found('Message not found.')

        if del_for_user:
            user.delete_message_for_me(message)
            return {'message': 'Successfully deleted for you.'}

        if user.id != message.author_id:
            return error_response(403, "Cannot delete another user's message.")

        message.delete()
        return {'message': 'Successfully deleted.'}
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
