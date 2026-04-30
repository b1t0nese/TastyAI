from flask import Flask
import web
import api
import config


app = Flask(__name__, template_folder=config.TEMPLATES_FOLDER)
app.register_blueprint(web.web_bp)
app.register_blueprint(api.api_bp)


if __name__ == "__main__":
    app.run(threaded=True)