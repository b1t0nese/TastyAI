from . import web_bp
from .functions import *
from flask import render_template, request, redirect, jsonify
from config import USERS_JSON_PATH
import json



@web_bp.route("/")
def hello():
    return render_template('index.html', username=check_auth(request.headers.get('X-Forwarded-For', "").split(',')[0].strip()))



@web_bp.route('/sign', methods=['GET', 'POST'])
def sign():
    users = get_users()

    if request.method == 'POST':
        request_type = request.args.get('type')

        if request_type == 'auth':
            username = request.form['username_auth']
            password = request.form['password_auth']
            if not (username in users and users[username] == password):
                return render_template('auth.html', error='Неверное имя пользователя или пароль.')
            elif len(username)<3 or len(password)<8:
                return render_template('auth.html', error='Недопустимое кол-во символов в имени (минимум 3) или в пароле (минимум 8).')
            else:
                users[username] = (password, request.remote_addr)
                auth_users[username] = request.remote_addr
                auth_users[request.headers.get('X-Forwarded-For', "").split(',')[0].strip()] = username
                return render_template('index.html', username=check_auth(request.headers.get('X-Forwarded-For', "").split(',')[0].strip()))

        elif request_type == 'reg':
            username = request.form['username_reg']
            password = request.form['password_reg']
            again_password = request.form['password_again']
            if not 'policy_check' in request.form.keys() or request.form['policy_check']!="on":
                return render_template('auth.html', error='\nПодтвердите соглашение условиями использования!')
            elif again_password!=password:
                return render_template('auth.html', error='\nВведённые пароли в полях не одинаковые!')
            elif not password or not again_password or not username:
                return render_template('auth.html', error='\nЗаполнены не все поля!')
            elif len(username)<3 or len(password)<8:
                return render_template('auth.html', error='\nНедопустимое кол-во символов в имени (минимум 3) или в пароле (минимум 8).')
            elif username in users.keys():
                return render_template('auth.html', error='\nТакой пользователь уже существует.')
            else:
                with open(USERS_JSON_PATH, 'w') as f:
                    users[username] = password
                    f.seek(0)
                    json.dump(users, f)
                auth_users[request.headers.get('X-Forwarded-For', "").split(',')[0].strip()] = username
                return render_template('index.html', username=check_auth(request.headers.get('X-Forwarded-For', "").split(',')[0].strip()))

    if not request.headers.get('X-Forwarded-For', "").split(',')[0].strip() in auth_users.keys():
        return render_template('auth.html')
    else:
        referrer = request.headers.get('Referrer')
        if referrer!=None:
            return redirect(referrer)
        else:
            return redirect("/")



@web_bp.route("/tests")
def ready_tests():
    return render_template('tests.html', username=check_auth(request.headers.get('X-Forwarded-For', "").split(',')[0].strip()))


@web_bp.route('/create_test', methods=['GET', 'POST'])
def create_test():
    if request.method == 'POST':
        test_directory = request.args.get('test')
        test = request.get_json()['test']
    else:
        return render_template('create-test.html', username=check_auth(request.headers.get('X-Forwarded-For', "").split(',')[0].strip()))


@web_bp.route('/test_solution', methods=['GET', 'POST'])
def test_solution():
    if request.method == 'POST':
        user_test_id = request.args.get('test')
        user_answers = request.get_json()['answers']
        if len(user_answers.split(':'))>1:
            user_answers = user_answers.split(':')[0]
        user_answers = user_answers.lower().split("|")
        test = get_test(user_test_id)
        questions = {}
        balls = 0
        for i, question in enumerate(test["questions"]):
            user_answer = user_answers[i]
            if question[1] == user_answer:
                balls += 1
            questions[f"id:{i}"] = {"question": question[0], "user_answer": user_answer, "true_answer": question[1]}
        # result = client.predict(
        #         message=questions,
        #         system_message=chatgpt_prompt+test["prompt"],
        #         max_tokens=1024,
        #         temperature=0.7,
        #         top_p=0.95,
        #         api_name="/chat")
        result = "net"
        return jsonify({'result': result, 'balls': balls, 'questions': questions}, 200)
    else:
        return render_template('solve-test.html', username=check_auth(request.headers.get('X-Forwarded-For', "").split(',')[0].strip()))