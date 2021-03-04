from hashlib import md5

from src import db
from src.utils.models import ResourceMixin


class Profile(db.Model, ResourceMixin):
    __tablename__ = 'profiles'

    # Identification
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), index=True, nullable=False)
    avatar = db.Column(db.String(128))
    dob = db.Column(db.DateTime)
    bio = db.Column(db.String(255))
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'),
        nullable=False
    )

    def __repr__(self):
        return f'<Profile: {self.name}>'

    @staticmethod
    def set_avatar(email, size=128):
        digest = md5(email.lower().encode('utf-8')).hexdigest()
        return f'https://www.gravatar.com/avatar/{digest}?s={size}&d=mm&r=pg'
