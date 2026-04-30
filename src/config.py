import os

SCRIPT_PATH = os.path.dirname(__file__)

USERS_JSON_PATH = os.path.join(SCRIPT_PATH, 'db', 'users.json')
TESTS_JSON_PATH = os.path.join(SCRIPT_PATH, 'db', 'tests.json')

TEMPLATES_FOLDER = os.path.join(SCRIPT_PATH, 'templates')