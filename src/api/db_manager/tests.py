from .db_session import SqlAlchemyBase
from .json_mixin import JsonSerializableMixin
from sqlalchemy import orm
import sqlalchemy
import datetime
import uuid


class Test(SqlAlchemyBase, JsonSerializableMixin):
    __tablename__ = 'tests'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    image = sqlalchemy.Column(sqlalchemy.String, nullable=True)
    name = sqlalchemy.Column(sqlalchemy.String(collation='NOCASE'))
    description = sqlalchemy.Column(sqlalchemy.String(collation='NOCASE'), nullable=True)
    created_date = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.now)
    is_private = sqlalchemy.Column(sqlalchemy.Boolean, default=False)
    questions = sqlalchemy.Column(sqlalchemy.String, nullable=True)
    verdict_type = sqlalchemy.Column(sqlalchemy.String, default="key")

    direction_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey("directions.id"))
    direction = orm.relationship('Direction')
    user_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey("users.id"))
    user = orm.relationship('User')


class Direction(SqlAlchemyBase, JsonSerializableMixin):
    __tablename__ = 'directions'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    direction = sqlalchemy.Column(sqlalchemy.String)

    test = orm.relationship("Test", back_populates='direction')


class Attempt(JsonSerializableMixin, SqlAlchemyBase):
    __tablename__ = 'attempts'

    id = sqlalchemy.Column(sqlalchemy.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    started_at = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.now)
    finished_at = sqlalchemy.Column(sqlalchemy.DateTime, nullable=True)
    answers = sqlalchemy.Column(sqlalchemy.String, nullable=True)
    verdict = sqlalchemy.Column(sqlalchemy.Integer, nullable=True)

    test_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey("tests.id"))
    test = orm.relationship('Test')
    user_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey("users.id"), nullable=True)
    user = orm.relationship('User')