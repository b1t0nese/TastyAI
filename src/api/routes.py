from . import api_bp
from flask import jsonify, request
from sqlalchemy import func, or_
from .db_manager import db_session
from .db_manager.__all_models import *
from .tastyai import tastyai
import json
import os

db_session.global_init(os.path.join(os.path.dirname(__file__), "db", "db.sqlite3"))



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
                func.lower(Test.description).contains(search_query.lower()),
                func.lower(Test.direction).contains(search_query.lower())))
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
1. test -id теста, обязательный параметр
2. start_attempt -запустить прохождение, с этим получить attempt_id"""
    test_id = request.args.get('test', type=int)
    start_attempt = False if request.args.get('start_attempt') is None else True

    db_sess = db_session.create_session()
    test = db_sess.query(Test).filter(Test.id == test_id).first()
    if test:
        test = test.to_dict()
        test["questions"] = json.loads(test["questions"])
        for question in test["questions"]:
            del question["answer"]
        if start_attempt:
            attempt = Attempt()
            attempt.test_id = test["id"]
            db_sess.add(attempt)
            db_sess.flush()
            test["attempt"] = attempt.id
            db_sess.commit()
        return jsonify(test), 200
    else:
        return "Test was not found", 404



@api_bp.route("/solve_test", methods=["POST"])
def solve_test():
    """## api/solve_test
### Сохранение данных прохождения теста и получение результатов (данные попытки).
#### Параметры:
1. attempt -id попытки, обязательный параметр
2. only_data -получить просто существующие данные попытки без сохранения результатов
#### Данные: json список из ответов."""
    attempt_id = request.args.get('attempt')
    only_data = False if request.args.get('only_data') is None else True
    answers = request.get_json()['answers']

    try:
        db_sess = db_session.create_session()
        response = tastyai.end_test(attempt_id, answers, db_sess, only_data)
        db_sess.commit()
        return jsonify(response), 200
    except Exception as e:
        return f"{e.__class__.__name__}: {e}", 500