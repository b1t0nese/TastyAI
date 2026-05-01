from db_manager import db_session
from db_manager.__all_models import *
import json, os

DB_PATH = os.path.join(os.path.dirname(__file__), "db")
db_session.global_init(os.path.join(DB_PATH, "db.sqlite"))

with open(os.path.join(DB_PATH, "tests.json"), 'r', encoding='utf-8') as f:
    data = json.load(f)

db_sess = db_session.create_session()
for test_data in data:
    test = Test()
    test.id = test_data["id"]
    test.image = test_data["image"]
    test.name = test_data["name"]
    test.description = test_data["description"]
    test.questions = json.dumps(test_data["questions"])

    direction = db_sess.query(Direction).filter(Direction.direction == test_data["direction"]).first()
    if not direction:
        direction = Direction(direction=test_data["direction"])
        db_sess.add(direction)
        db_sess.flush()
    test.direction = direction
    db_sess.add(test)

db_sess.commit()