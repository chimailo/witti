from src import db
from src.utils.models import ResourceMixin


grp_members = db.Table(
    'group_members',
    db.Column(
        'group_id',
        db.Integer,
        db.ForeignKey('groups.id', ondelete='CASCADE', onupdate='CASCADE'),
        primary_key=True
    ),
    db.Column(
        'user_id',
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'),
        primary_key=True
    )
)


grp_perms = db.Table(
    'group_permissions',
    db.Column(
        'group_id',
        db.Integer,
        db.ForeignKey('groups.id', ondelete='CASCADE', onupdate='CASCADE'),
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


class Group(db.Model, ResourceMixin):
    __tablename__ = 'groups'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32), unique=True, index=True, nullable=False)
    description = db.Column(db.String(250))

    # relationships
    members = db.relationship(
        'User',
        secondary=grp_members,
        backref=db.backref('groups', lazy='dynamic'),
        lazy='dynamic'
    )
    permissions = db.relationship(
        'Permission',
        secondary=grp_perms,
        backref=db.backref('groups', lazy='dynamic'),
        lazy='dynamic'
    )

    def __init__(self, **kwargs):
        super(Group, self).__init__(**kwargs)
        self.name = kwargs.get('name').lower()
        self.description = kwargs.get('description', '')

    def __repr__(self):
        return f'<Group: {self.name}>'

    @classmethod
    def find_by_name(cls, name):
        return cls.query.filter((cls.name == name)).first()

    def is_group_member(self, user):
        return self.members.filter(
            grp_members.c.user_id == user.id).count() > 0

    def add_members(self, members):
        for member in members:
            if not self.is_group_member(member):
                self.members.append(member)
                self.save()

    def remove_members(self, members):
        for member in members:
            if self.is_group_member(member):
                self.members.remove(member)
                self.save()

    def has_perm(self, perm):
        return self.permissions.filter(
            grp_perms.c.perm_id == perm.id).count() > 0

    def add_permissions(self, perms):
        for perm in perms:
            if not self.has_perm(perm):
                self.permissions.append(perm)
                self.save()

    def remove_permissions(self, perms):
        for perm in perms:
            if self.has_perm(perm):
                self.permissions.remove(perm)
                self.save()


class Permission(db.Model, ResourceMixin):
    __tablename__ = 'permissions'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32), unique=True, index=True, nullable=False)
    code_name = db.Column(
        db.String(32),
        unique=True,
        index=True,
        nullable=False
    )
    model_id = db.Column(
        db.Integer,
        db.ForeignKey('models.id', ondelete='CASCADE', onupdate='CASCADE'),
        nullable=False
    )

    def __init__(self, **kwargs):
        super(Permission, self).__init__(**kwargs)
        self.name = kwargs.get('name').lower()
        self.code_name = Permission.set_code_name(kwargs.get('name').lower())

    def __repr__(self):
        return f'<Permission: {self.name}>'

    @classmethod
    def set_code_name(cls, name):
        return name.strip(',. ').replace(' ', '_').lower()

    @classmethod
    def find_by_name(cls, code_name):
        return cls.query.filter((cls.code_name == code_name)).first()


class Model(db.Model, ResourceMixin):
    __tablename__ = 'models'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32), unique=True, index=True, nullable=False)
    permissions = db.relationship('Permission', backref='perms')

    def __init__(self, **kwargs):
        super(Model, self).__init__(**kwargs)
        self.name = kwargs.get('name').lower()

    def __repr__(self):
        return f'<Model: {self.name}>'
