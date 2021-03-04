from datetime import datetime, timedelta
import jwt

from flask import current_app
from werkzeug.security import generate_password_hash, check_password_hash

from src import db
from src.utils.models import ResourceMixin


class Auth(db.Model, ResourceMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(
        db.String(128),
        index=True,
        unique=True,
        nullable=False
    )
    email = db.Column(
        db.String(128),
        index=True,
        unique=True,
        nullable=False
    )
    password = db.Column(db.String(128), nullable=False)
    is_active = db.Column(db.Boolean(), default=True, nullable=False)
    is_admin = db.Column(db.Boolean(), default=False, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey(
        'users.id', ondelete='CASCADE', onupdate='CASCADE'),  nullable=False)

    def __init__(self, **kwargs):
        super(Auth, self).__init__(**kwargs)
        self.password = Auth.hash_password(kwargs.get('password', ''))

    def __str__(self):
        return f'<Auth {self.username}>'

    @classmethod
    def find_by_identity(cls, identity):
        """
        Find a user by their identity.

        :param: user identity - email or username
        :return: User instance
        """
        return cls.query.filter(
            (cls.email == identity) | (cls.username == identity)).first()

    @classmethod
    def hash_password(cls, password):
        """
        Hash a plaintext string using PBKDF2.

        :param password: Password in plain text
        :type password: str
        :return: str
        """
        if password:
            return generate_password_hash(password)

        return None

    def check_password(self, password):
        """
        Check if the provided password matches that of the specified user.

        :param password: Password in plain text
        :return: boolean
        """
        return check_password_hash(self.password, password)

    def encode_auth_token(self, id):
        """Generates the auth token"""
        try:
            payload = {
                'exp': datetime.utcnow() + timedelta(
                    days=current_app.config.get('TOKEN_EXPIRATION_DAYS'),
                    seconds=current_app.config.get('TOKEN_EXPIRATION_SECONDS')
                ),
                'iat': datetime.utcnow(),
                'sub': {
                    'id': id,
                }
            }
            return jwt.encode(
                payload,
                current_app.config.get('SECRET_KEY'),
                algorithm='HS256'
            )
        except Exception as e:
            return e

    @staticmethod
    def decode_auth_token(token):
        """
        Decodes the auth token

        :param string: token
        :return dict: The user's identity
        """
        try:
            payload = jwt.decode(
                token,
                current_app.config.get('SECRET_KEY'),
                algorithms='HS256'
            )
            return payload.get('sub')
        except jwt.ExpiredSignatureError:
            return 'Signature expired. Please log in again.'
        except jwt.InvalidTokenError:
            return 'Invalid token. Please log in again.'
