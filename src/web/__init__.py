from flask import Blueprint, request, render_template, abort
import os

from .auth import RegisterForm, AuthForm
from api.routes import get_auth_session

web_bp = Blueprint(
    "web",
    __name__,
    template_folder=os.path.join(os.path.dirname(__file__), "templates"),
)


@web_bp.route("/auth.html")
def sign():
    return render_template(
        "auth.html",
        auth_form=AuthForm(),
        register_form=RegisterForm(),
        message=request.args.get("message"),
        message_type=request.args.get("error_type"),
    )


@web_bp.route("/", defaults={"filename": "index.html"})
@web_bp.route("/<filename>")
def serve_html(filename):
    template_path = os.path.join(web_bp.template_folder, filename)
    if os.path.exists(template_path) and filename.endswith(".html"):
        try:
            user_data, db_sess = get_auth_session(request)
            username = user_data.user.name
        except:
            username = "Авторизация"
        return render_template(filename, username=username)
    else:
        abort(404)
