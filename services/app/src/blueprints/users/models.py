from datetime import datetime

from sqlalchemy import and_
from sqlalchemy.sql import func
from sqlalchemy.orm import aliased

from src import db
from src.utils.models import ResourceMixin
from src.blueprints.posts.models import Post
from src.blueprints.messages.models import Message, Conversation, \
    LastReadMessage
from src.blueprints.admin.models import Permission


user_perms = db.Table(
    'user_permissions',
    db.Column(
        'user_id',
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'),
        primary_key=True
    ),
    db.Column(
        'perm_id',
        db.Integer,
        db.ForeignKey(
            'permissions.id',
            ondelete='CASCADE',
            onupdate='CASCADE'
        ),
        primary_key=True
    )
)


followers = db.Table(
    'followers',
    db.Column(
        'follower_id',
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'),
        primary_key=True
    ),
    db.Column(
        'followed_id',
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'),
        primary_key=True)
)


deleted_msgs = db.Table(
    'deleted_messages',
    db.Column(
        'user_id',
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'),
        primary_key=True
    ),
    db.Column(
        'message_id',
        db.Integer,
        db.ForeignKey('messages.id', ondelete='CASCADE',  onupdate='CASCADE'),
        primary_key=True
    )
)


class User(db.Model, ResourceMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    # Activity tracking.
    sign_in_count = db.Column(db.Integer, nullable=False, default=0)
    current_sign_in_on = db.Column(db.DateTime)
    current_sign_in_ip = db.Column(db.String(32))
    last_sign_in_on = db.Column(db.DateTime)
    last_sign_in_ip = db.Column(db.String(32))

    # Relationships
    auth = db.relationship(
        'Auth', uselist=False, backref='user', lazy='joined',
        cascade='all, delete-orphan')
    profile = db.relationship(
        'Profile', uselist=False, backref='user', lazy='joined',
        cascade='all, delete-orphan')
    followed = db.relationship(
        'User', secondary='followers', lazy='dynamic',
        primaryjoin=(followers.c.follower_id == id),
        secondaryjoin=(followers.c.followed_id == id),
        backref=db.backref('followers', lazy='dynamic')
    )
    posts = db.relationship(
        'Post', backref='author', cascade='all, delete-orphan')
    # Messages
    # notifications = db.relationship('Notification', backref='user')
    # last_message_read_time = db.Column(db.DateTime)
    conversation1 = db.relationship(
        'Conversation', foreign_keys='Conversation.user1_id',
        backref='user1', cascade='all, delete-orphan')
    conversation2 = db.relationship(
        'Conversation', foreign_keys='Conversation.user2_id',
        backref='user2', cascade='all, delete-orphan')
    deleted_messages = db.relationship(
        'Message', secondary=deleted_msgs, lazy='dynamic')
    permissions = db.relationship(
        'Permission',
        secondary=user_perms,
        backref=db.backref('users', lazy='dynamic'),
        lazy='dynamic'
    )

    def __str__(self):
        return f'<User {self.id}>'

    def update_activity_tracking(self, ip_address):
        """
        Update various fields on the user that's
        related to meta data on their account.

        :param ip_address: str
        :return: SQLAlchemy commit results
        """
        self.sign_in_count += 1

        self.last_sign_in_on = self.current_sign_in_on
        self.last_sign_in_ip = self.current_sign_in_ip

        self.current_sign_in_on = datetime.utcnow()
        self.current_sign_in_ip = ip_address

        return self.save()

    def follow(self, user):
        if not self.is_following(user):
            self.followed.append(user)

    def unfollow(self, user):
        if self.is_following(user):
            self.followed.remove(user)

    def is_following(self, user):
        return self.followed.filter(
            followers.c.followed_id == user.id).count() > 0

    def get_followed_posts(self):
        followed_users_posts = db.session.query(Post.id).join(
            followers, (followers.c.followed_id == Post.user_id)).filter(
                followers.c.follower_id == self.id).filter(
                    Post.comment_id.is_(None))
        own_posts = db.session.query(Post.id).filter_by(
            user_id=self.id).filter(Post.comment_id.is_(None))
        return followed_users_posts.union(own_posts)

    def get_conversation(self, user):
        '''Get conversation between user?'''
        return Conversation.query.filter(and_(
            Conversation.user1_id == self.id,
            Conversation.user2_id == user.id) | and_(
                    Conversation.user1_id == user.id,
                    Conversation.user2_id == self.id)).first()

    def get_messages_in_conv(self, user):
        '''Get all the messages in a conversation between two users'''
        return db.session.query(Message).join(Conversation.messages).filter(and_(Conversation.user1_id == self.id,Conversation.user2_id == user.id) |and_(Conversation.user1_id == user.id,Conversation.user2_id == self.id)).except_(
                    self.deleted_messages).order_by(Message.created_on.desc())

    def get_last_messages_in_conv(self):
        '''Get the last messages in all conversations with self.'''
        user1 = aliased(User)
        user2 = aliased(User)
        # get the last message in all conversations.
        last_msgs = db.session.query(Message.conversation_id, func.max(
            Message.created_on).label('last_messages')).group_by(
                Message.conversation_id).subquery()
        # return the users and messages involved in the conversation with self
        return last_msgs, db.session.query(
            Message, user1, user2, last_msgs.c.last_messages).join(
            last_msgs, Message.created_on == last_msgs.c.last_messages).join(
                Conversation, Conversation.id == Message.conversation_id).join(
                    user1, user1.id == Conversation.user1_id).join(
                        user2, user2.id == Conversation.user2_id).filter((
                            Conversation.user1_id == self.id) | (
                                Conversation.user2_id == self.id)).order_by(
                                    last_msgs.c.last_messages.desc())

    def last_read_msg_ts(self, conv_id):
        return LastReadMessage.query.filter(and_(
            LastReadMessage.user_id == self.id,
            LastReadMessage.conversation_id == conv_id)).first()

    def delete_message_for_me(self, message):
        self.deleted_messages.append(message)
        self.save()

    def user_has_perm(self, perm):
        return self.permissions.filter(
            user_perms.c.perm_id == perm.id).count() > 0

    def add_permissions(self, perms):
        for perm in perms:
            if not self.user_has_perm(perm):
                self.permissions.append(perm)
                self.save()

    def remove_permissions(self, perms):
        for perm in perms:
            if self.user_has_perm(perm):
                self.permissions.remove(perm)
                self.save()

    def get_perms(self):
        perms = []

        for perm in self.permissions:
            perms.append(perm)

        return perms

    def get_all_perms(self):
        perms = []

        for group in self.groups:
            for perm in group.permissions:
                perms.append(perm)

        return list(set(perms).union(set(self.get_perms())))

    def has_permission(self, name):
        perm = Permission.find_by_name(name)
        return perm in self.get_all_perms()

    def has_permissions(self, perms_list):
        perms = []

        for perm in perms_list:
            p = Permission.find_by_name(perm)
            perms.append(p)

        return set(perms).issubset(set(self.get_all_perms()))
