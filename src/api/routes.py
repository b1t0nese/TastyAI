from . import api_bp
from flask import jsonify, request
from config import TESTS_JSON_PATH
import json



@api_bp.route("/get_tests")
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