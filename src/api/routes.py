from . import api_bp
from flask import jsonify, request
from .db_manager import db_session
from .db_manager.__all_models import *
from config import DB_PATH
import json

db_session.global_init(DB_PATH)



@api_bp.route("/get_tests")
def get_tests_trudb():
    """## api/get_tests
### Обработка на получение тестов для главной страницы тестов.
#### Вывод:
Данные о тестах в формате json: [[id, image, name, description], [id, image, name, description]]
#### Параметры:
1. len -количество получаемых тестов
2. search -текст для поиска тестов"""
    tests_count = request.args.get('len', type=int)
    search_query = request.args.get('search')

    db_sess = db_session.create_session()
    tests_data = db_sess.query(Test).filter(Test.is_private != True and (search_query is None or (
        search_query.lower() in Test.name.lower() or search_query.lower() in Test.description.lower())))
    tests_data = list(map(lambda x: x.to_dict(["questions", "is_private", "direction_id", "user_id"]), tests_data))
    tests_data = tests_data[:tests_count] if tests_count else tests_data
    return jsonify(tests_data), 200


@api_bp.route("/get_test")
def get_test():
    """## api/get_test
### Получение полных данных теста для прохождения с собственным id прохождения.
#### Параметры:
1. test_id -id теста, обязательный параметр
2. with_answers -включение ответов в данные теста"""
    test_id = request.args.get('test', type=int)
    with_answers = True if request.args.get('with_answers') else False

    db_sess = db_session.create_session()
    test = db_sess.query(Test).filter(Test.id == test_id).first()
    if test:
        test = test.to_dict()
        test["questions"] = json.loads(test["questions"])
        if not with_answers:
            for i in range(len(test["questions"])):
                del test["questions"][i]["answer"]
        return jsonify(test), 200
    else:
        return "The test was not found", 404


@api_bp.route("/solve_test", methods=["POST"])
def solve_test():
    pass