# import json
from datetime import datetime
from sqlalchemy import and_
from src import db


class Conversation(db.Model):
    __table_args__ = (
        db.Index('_conv_users_idx', 'user2_id', 'user1_id', unique=True),
    )

    id = db.Column(db.Integer, primary_key=True)
    user1_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    messages = db.relationship(
        'Message', backref='conversation', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<Conversation: user_{self.user1_id} <-> user_{self.user2_id}>"


class LastReadMessage(db.Model):
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey(
        "users.id"), primary_key=True, nullable=False)
    conversation_id = db.Column(db.Integer, db.ForeignKey(
        "conversation.id"), primary_key=True, nullable=False)

    def save(self):
        """
        Save a model instance.

        :return: Model instance
        """
        db.session.add(self)
        db.session.commit()

    @classmethod
    def find_by_pk(cls, user_id, conv_id):
        return cls.query.filter(
            and_(cls.user_id == user_id, cls.conversation_id == conv_id)
        ).first()


# deleted_msgs = db.Table(
#     'deleted_messages',
#     db.Column(
#         'user_id',
#         db.Integer,
#         db.ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'),
#         primary_key=True
#     ),
#     db.Column(
#         'message_id',
#         db.Integer,
#         db.ForeignKey('posts.id', ondelete='CASCADE',  onupdate='CASCADE'),
#         primary_key=True
#     )
# )


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.Text())
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_on = db.Column(db.DateTime, default=datetime.utcnow)
    conversation_id = db.Column(db.Integer, db.ForeignKey(
        "conversation.id"), nullable=False)
    # deleted_messages = db.relationship(
    #     'User', secondary=deleted_msgs, lazy='dynamic',
    #     backref=db.backref('likes', lazy='dynamic')
    # )

    def __repr__(self):
        return "<Message {}>".format(self.id)

    @classmethod
    def find_by_id(cls, id):
        """
        Get a class instance given its id

        :param id: int
        :return: Class instance
        """
        return cls.query.get(int(id))

    # def is_deleted_by(self, user):
    #     return self.deleted_messages.filter(
    #         deleted_msgs.c.user_id == user.id).count() > 0

    def save(self):
        """
        Save a model instance.

        :return: Model instance
        """
        db.session.add(self)
        db.session.commit()

        return self

    def delete(self):
        """
        Delete a model instance.

        :return: db.session.commit()'s result
        """
        db.session.delete(self)
        return db.session.commit()



# class Notification(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(128), index=True)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
#     timestamp = db.Column(db.Float, index=True, default=time)
#     payload_json = db.Column(db.Text)

#     def get_data(self):
#         return json.loads(str(self.payload_json))
