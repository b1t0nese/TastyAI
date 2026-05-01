from config import USERS_JSON_PATH, TESTS_JSON_PATH
import json
auth_users = {}


def get_users():
    with open(USERS_JSON_PATH, 'r') as f:
        return json.load(f)


def get_test(test_id):
    with open(TESTS_JSON_PATH, 'r') as f:
        tests = json.load(f)
    for t in tests.keys():
        if t == test_id:
            return tests[t]


def check_auth(ip):
    if ip in auth_users.keys():
        return auth_users[ip]
    else:
        return "Авторизация"