from dotenv import load_dotenv
from flask import Flask
import secrets

import web
import api


load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(16)
app.register_blueprint(web.web_bp)
app.register_blueprint(api.api_bp)


if __name__ == "__main__":
    app.run(threaded=True)