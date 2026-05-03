from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import orm
import sqlalchemy
import datetime
import uuid

from .db_session import SqlAlchemyBase
from .json_mixin import JsonSerializableMixin



class AuthException(Exception):
    pass



class User(SqlAlchemyBase, JsonSerializableMixin):
    __tablename__ = 'users'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    name = sqlalchemy.Column(sqlalchemy.String, index=True, unique=True)
    hashed_password = sqlalchemy.Column(sqlalchemy.String)
    created_date = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.now)

    tests = orm.relationship("Test", back_populates='user')

    def set_password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)


class Auth(SqlAlchemyBase, JsonSerializableMixin):
    __tablename__ = 'authentications'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    session_token = sqlalchemy.Column(sqlalchemy.String, unique=True, default=lambda: str(uuid.uuid4()))
    user_agent = sqlalchemy.Column(sqlalchemy.String, nullable=True)
    created_at = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.now())
    last_activity = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.now)
    logout_at = sqlalchemy.Column(sqlalchemy.DateTime, nullable=True)

    user_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey("users.id"), nullable=True)
    user = orm.relationship('User')