from flask import jsonify, request, redirect, url_for, make_response
from sqlalchemy import func, or_
import json
import os

from web.auth import RegisterForm, AuthForm
from . import api_bp
from .db_manager import db_session
from .db_manager.__all_models import *
from .tastyai import tastyai


db_session.global_init(os.path.join(os.path.dirname(__file__), "db", "db.sqlite3"))



def get_auth_session(requestt, db_sess):
    session_token = requestt.cookies.get("session_token")
    dnow = datetime.datetime.now()
    auth = db_sess.query(Auth).filter(Auth.session_token==session_token).first()
    if not auth:
        raise AuthException("Auth was not found")
    elif requestt.headers.get('User-Agent', '') == auth.user_agent:
        raise AuthException("user_agent != Auth.user_agent")
    if dnow < auth.logout_at:
        raise AuthException("The session was completed.")
    auth.last_activity = dnow
    return auth



@api_bp.route('/logout')
def logout():
    db_sess = db_session.create_session()
    try:
        auth = get_auth_session(request, db_sess)
        auth.logout_at = auth.last_activity
        db_sess.commit()
        return "Successful exit.", 200
    except Exception as e:
        return f"{e.__class__.__name__}: {e}", 403


@api_bp.route('/who_am_i')
def who_am_i():
    db_sess = db_session.create_session()
    try:
        auth = get_auth_session(request, db_sess)
        db_sess.commit()
        return jsonify(auth.to_dict()), 200
    except Exception as e:
        return f"{e.__class__.__name__}: {e}", 403


@api_bp.route('/sign', methods=['POST'])
def sign():
    form_type = request.form.get('form_type')

    if form_type == 'login':
        form = AuthForm()
        if form.validate_on_submit():
            db_sess = db_session.create_session()
            user = db_sess.query(User).filter(User.name == form.name.data).first()
            if user.check_password(form.password.data):
                auth = Auth()
                auth.user_id = user.id
                auth.user_agent = request.headers.get('User-Agent', '')
                db_sess.add(auth)
                db_sess.commit()
                response = make_response(redirect("/"))
                response.set_cookie(
                    'session_token', auth.session_token,
                    httponly=True, # secure=True,
                    samesite='Lax', max_age=30*24*60*60)
                return response
            else:
                return redirect(url_for('web.sign', error_type='auth_error', message='Неверное имя пользователя или пароль'))
        else:
            error_messages = []
            for field, errors in form.errors.items():
                error_messages.extend(errors)
            return redirect(url_for('web.sign', error_type='auth_error', message='; '.join(error_messages)))

    elif form_type == 'register':
        form = RegisterForm()
        if form.validate_on_submit():
            policy_check = request.form.get('policy_check')
            if not policy_check:
                return redirect(url_for('web.sign', error_type='reg_error', message='Подтвердите соглашение с условиями использования!'))
            if form.password.data != form.password_again.data:
                return redirect(url_for('web.sign', error_type='reg_error', message='Введённые пароли не совпадают!'))
            db_sess = db_session.create_session()
            if db_sess.query(User).filter(User.name == form.name.data).first() is not None:
                return redirect(url_for('web.sign', error_type='reg_error', message='Такой пользователь уже существует.'))
            user = User()
            user.name = form.name.data
            user.set_password(form.password.data)
            db_sess.add(user)
            db_sess.commit()
            return redirect("/")
        else:
            error_messages = []
            for field, errors in form.errors.items():
                error_messages.extend(errors)
            return redirect(url_for('web.sign', error_type='reg_error', message='; '.join(error_messages)))

    else:
        return redirect(url_for('web.sign'))



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
    answers = request.get_json()

    try:
        db_sess = db_session.create_session()
        response = tastyai.end_test(attempt_id, answers, db_sess, only_data)
        db_sess.commit()
        return jsonify(response), 200
    except Exception as e:
        return f"{e.__class__.__name__}: {e}", 500