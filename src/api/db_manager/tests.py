from .db_session import SqlAlchemyBase
from sqlalchemy import orm
import sqlalchemy
import datetime


class Tests(SqlAlchemyBase):
    __tablename__ = 'tests'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    image = sqlalchemy.Column(sqlalchemy.String, nullable=True)
    name = sqlalchemy.Column(sqlalchemy.String)
    description = sqlalchemy.Column(sqlalchemy.String, nullable=True)
    created_date = sqlalchemy.Column(sqlalchemy.DateTime, default=datetime.datetime.now)
    is_private = sqlalchemy.Column(sqlalchemy.Boolean, default=False)
    questions = sqlalchemy.Column(sqlalchemy.String, nullable=True)

    direction_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey("directions.id"))
    direction = orm.relationship('Directions')
    user_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey("users.id"))
    user = orm.relationship('User')


class Directions(SqlAlchemyBase):
    __tablename__ = 'directions'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    direction = sqlalchemy.Column(sqlalchemy.String)

    tests = orm.relationship("Tests", back_populates='direction')