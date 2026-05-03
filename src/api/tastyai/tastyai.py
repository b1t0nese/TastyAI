from sqlalchemy.orm import Session
from ..db_manager.__all_models import *
import datetime
import json
import os


api_key = os.getenv("DEEPSEEK_API_KEY")


class TestException(Exception):
    pass


class AttemptException(Exception):
    pass



def lower_answer(answer):
    if isinstance(answer, list):
        return list(map(lambda x: x.lower(), answer))
    else:
        return answer.lower()


def nospace_answer(answer):
    if isinstance(answer, list):
        return list(map(lambda x: x.replace(" ", ""), answer))
    else:
        return answer.replace(" ", "")



def end_test(attempt_id: int, answers: list, db_sess: Session, only_data: bool=False):
    attempt = db_sess.query(Attempt).filter(Attempt.id == attempt_id).first()
    if not attempt:
        raise AttemptException(f"attempt {attempt_id} was not found")
    if not only_data:
        if attempt.finished_at:
            raise AttemptException(f"attempt {attempt_id} is finished")
        test = db_sess.query(Test).filter(Test.id == attempt.test_id).first()
        if not test:
            raise TestException(f"test with id {attempt.test_id} was not found")
        questions = json.loads(test.questions)
        if len(answers) != len(questions):
            raise TestException("answers lenght != test questions lenght.")
        attempt.finished_at = datetime.datetime.now()

        if test.verdict_type=="key":
            attempt_answers = []
            for i in range(len(answers)):
                is_correct = None
                actions = questions[i].get("actions", ["lower"])
                user_answer, quest_answer = answers[i], questions[i]["answer"]
                if actions:
                    if "lower" in actions:
                        user_answer = lower_answer(user_answer)
                        quest_answer = lower_answer(quest_answer)
                    if "nospace" in actions:
                        user_answer = nospace_answer(user_answer)
                        quest_answer = nospace_answer(quest_answer)
                if questions[i]["type"] in ["choice", "text"]:
                    if "many_answers" in actions:
                        is_correct = user_answer in quest_answer
                    else:
                        is_correct = user_answer==quest_answer
                elif questions[i]["type"]=="many_choice":
                    is_correct = sorted(answers[i])==sorted(questions[i]["answer"])
                description = "Правильно." if is_correct else f"Неправильно. Правильный ответ: {
                    ", ".join(questions[i]["answer"]) if isinstance(questions[i]["answer"], list) else questions[i]["answer"]}"
                attempt_answers.append({"answer": answers[i], "is_correct": is_correct, "description": description})

            attempt.answers = json.dumps(attempt_answers)
            attempt.verdict = f"""Результат: {len(list(filter(lambda x: x["is_correct"], attempt_answers)))}/{len(questions)}
    {"\n".join([f"Вопрос №{i+1}: {"" if attempt_answers[i]["is_correct"] else "не"}правильно" for i in range(len(attempt_answers))])}"""
        else:
            raise AttemptException(f"verdict_type {test.verdict_type} is not defined")

    result = attempt.to_dict(["test", "user_id"])
    result["answers"] = json.loads(result["answers"])
    return result