from flask import Blueprint

admin = Blueprint('admin', __name__, url_prefix='/api/admin')


@admin.route('/ping', methods=['GET'])
def ping():
    return {'message': 'Admin Route!'}


import src.blueprints.admin.routes.users
import src.blueprints.admin.routes.groups
