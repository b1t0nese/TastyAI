from . import api_bp
from flask import jsonify, request
from .db_manager import db_session
from .db_manager.__all_models import *
from sqlalchemy import func, or_
from config import DB_PATH
import json

db_session.global_init(DB_PATH)



@api_bp.route("/get_tests")
def get_tests_trudb():
    """## api/get_tests
### Обработка на получение тестов для главной страницы тестов.
#### Параметры:
1. len -количество получаемых тестов
2. search -текст для поиска тестов"""
    tests_count = request.args.get('len', type=int)
    search_query = request.args.get('search')

    db_sess = db_session.create_session()
    query = db_sess.query(Test).filter(Test.is_private == False)
    if search_query:
        query = query.filter(
            or_(func.lower(Test.name).contains(search_query.lower()),
                func.lower(Test.description).contains(search_query.lower())))
    if tests_count:
        query = query.limit(tests_count)
    tests = [test.to_dict(exclude=["questions", "is_private", "direction_id", "user_id"])
              for test in query.all()]
    return jsonify(tests), 200


@api_bp.route("/get_test")
def get_test():
    """## api/get_test
### Получение полных данных теста для прохождения с собственным id прохождения.
#### Параметры:
1. test -id теста, обязательный параметр"""
    test_id = request.args.get('test', type=int)

    db_sess = db_session.create_session()
    test = db_sess.query(Test).filter(Test.id == test_id).first()
    if test:
        test = test.to_dict()
        test["questions"] = json.loads(test["questions"])
        return jsonify(test), 200
    else:
        return "The test was not found", 404


@api_bp.route("/solve_test", methods=["POST"])
def solve_test():
    pass