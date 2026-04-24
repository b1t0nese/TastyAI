from flask import Flask, request, redirect, render_template, jsonify
from gradio_client import Client
import os, json, traceback
USERS_JSON_PATH = 'users.json'
TESTS_JSON_PATH = 'tests.json'
with open(USERS_JSON_PATH, 'r') as f:
    users = json.load(f)
chatgpt_prompt ="Тебе дают решёный тест, ты должна написать вывод на основе ответов пользователя. Анализируй каждый вопрос обязательно, правильный ответ на него и ответ пользователя. Ответ пользователя неможет отличаться от правильного ответа специальными символами или словами. Отвечай только на том языке на котором были ответы пользователя. "
client = Client("junu3343/ChatGPT")

app = Flask(__name__, template_folder=os.path.abspath('templates'))
auth_users = {}


def log(text):
    with open("error.txt", "a") as f:
        f.write(str(text)+"\n")


def check_auth(ip):
    if ip in auth_users.keys():
        return auth_users[ip]
    else:
        return "Авторизация"


@app.route("/")
def hello():
    return render_template('index.html', username=check_auth(request.headers.get('X-Forwarded-For').split(',')[0].strip()))


@app.route("/tests")
def ready_tests():
    return render_template('tests.html', username=check_auth(request.headers.get('X-Forwarded-For').split(',')[0].strip()))


@app.route("/get_tests")
def get_tests():
    tests_count = int(request.args.get('len'))
    with open(TESTS_JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    test_data_list = []
    if isinstance(data, list):
        for test in data:
            if isinstance(test, dict):
                link = test.get("link", "")
                image = test.get("image", "")
                name = test.get("name", "")
                description = test.get("description", "")
                test_data_list.append([link, image, name, description])

    selected_tests = test_data_list[:tests_count]
    return jsonify(selected_tests), 200


@app.route('/sign', methods=['GET', 'POST'])
def sign():
    global users
    with open(USERS_JSON_PATH, 'r') as f:
        users = json.load(f)

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
                auth_users[request.headers.get('X-Forwarded-For').split(',')[0].strip()] = username
                return render_template('index.html', username=check_auth(request.headers.get('X-Forwarded-For').split(',')[0].strip()))

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
                auth_users[request.headers.get('X-Forwarded-For').split(',')[0].strip()] = username
                return render_template('index.html', username=check_auth(request.headers.get('X-Forwarded-For').split(',')[0].strip()))

    if not request.headers.get('X-Forwarded-For').split(',')[0].strip() in auth_users.keys():
        return render_template('auth.html')
    else:
        referrer = request.headers.get('Referrer')
        if referrer!=None:
            return redirect(referrer)
        else:
            return redirect("/")


@app.route('/test_solution', methods=['GET', 'POST'])
def test_solution():
    if request.method == 'POST':
        user_test = request.args.get('test')
        user_answers = request.get_json()['answers']
        if len(user_answers.split(':'))>1:
            user_answers = user_answers.split(':')[0]
        user_answers = user_answers.lower().split("|")
        with open(TESTS_JSON_PATH, 'r') as f:
            tests = json.load(f)
        for t in tests.keys():
            if t == user_test:
                test = tests[t]
                break
            else:
                test = None
        questions = {}
        balls = 0
        for i, question in enumerate(test["questions"]):
            user_answer = user_answers[i]
            if question[1] == user_answer:
                balls += 1
            questions[f"id:{i}"] = {"question": question[0], "user_answer": user_answer, "true_answer": question[1]}
        result = client.predict(
                message=questions,
                system_message=chatgpt_prompt+test["prompt"],
                max_tokens=1024,
                temperature=0.7,
                top_p=0.95,
                api_name="/chat")
        return jsonify({'result': result, 'balls': balls, 'questions': questions}, 200)
    else:
        return render_template('solve-test.html',
                               username=check_auth(request.headers.get('X-Forwarded-For').split(',')[0].strip()))


@app.route('/create_test', methods=['GET', 'POST'])
def create_test():
    if request.method == 'POST':
        test_directory = request.args.get('test')
        test = request.get_json()['test']
    else:
        return render_template('create-test.html',
                               username=check_auth(request.headers.get('X-Forwarded-For').split(',')[0].strip()))


if __name__ == "__main__":
    app.run(threaded=True)