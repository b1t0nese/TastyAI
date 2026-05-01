from flask import Flask
import web
import api


app = Flask(__name__)
app.register_blueprint(web.web_bp)
app.register_blueprint(api.api_bp)


if __name__ == "__main__":
    app.run(threaded=True)