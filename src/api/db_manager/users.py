from .db_session import SqlAlchemyBase
from .json_mixin import JsonSerializableMixin
from sqlalchemy import orm
import sqlalchemy
import datetime


class User(SqlAlchemyBase, JsonSerializableMixin):
    __tablename__ = 'users'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    name = sqlalchemy.Column(sqlalchemy.String, index=True, unique=True)
    hashed_password = sqlalchemy.Column(sqlalchemy.String)
    created_date = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.now)

    tests = orm.relationship("Test", back_populates='user')