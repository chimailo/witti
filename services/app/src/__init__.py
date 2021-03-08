import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS


from dotenv import load_dotenv
load_dotenv()

# set up extensions
db = SQLAlchemy()
migrate = Migrate()
cors = CORS()


app_settings = os.getenv('APP_SETTINGS')


def create_app(config=app_settings):
    """
    Create a Flask application using the app factory pattern.

    :return - object: Flask app
    """
    # Instantiate app
    app = Flask(__name__)

    # Set configuration
    app.config.from_object(config)

    # set up extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)

    @app.route('/api/ping')
    def ping():
        return {"message": "Ping!"}

    # Register Blueprint
    from src.blueprints.errors import errors
    app.register_blueprint(errors)
    from src.blueprints.admin.routes import admin
    app.register_blueprint(admin)
    from src.blueprints.auth.routes import auth
    app.register_blueprint(auth)
    from src.blueprints.profiles.routes import profile
    app.register_blueprint(profile)
    from src.blueprints.posts.routes import posts
    app.register_blueprint(posts)
    from src.blueprints.users.routes import users
    app.register_blueprint(users)
    from src.blueprints.messages.routes import messages
    app.register_blueprint(messages)

    from src.blueprints.auth.models import Auth
    from src.blueprints.users.models import User
    from src.blueprints.profiles.models import Profile
    from src.blueprints.posts.models import Post
    from src.blueprints.messages.models import Message, Chat
    from src.blueprints.admin.models import Group, Permission, Model

    @app.shell_context_processor
    def ctx():
        """shell context for flask cli """
        return {
            "app": app,
            "db": db,
            "User": User,
            "Auth": Auth,
            "Profile": Profile,
            "Post": Post,
            "Message": Message,
            "Chat": Chat,
            "Group": Group,
            "Permission": Permission,
            "Model": Model,
        }

    return app
