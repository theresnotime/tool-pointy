import os
import re

import sqlalchemy.pool
import yaml
from flask import Flask, render_template
from flask_jsonlocale import Locales
from flask_socketio import SocketIO
from markupsafe import escape

app = Flask(__name__)
socketio = SocketIO(app)

# Create in-memory database
engine = sqlalchemy.create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=sqlalchemy.pool.StaticPool,
)

# Load configuration from YAML file
__dir__ = os.path.dirname(__file__)
app.config.update(
    yaml.safe_load(
        open(os.path.join(__dir__, os.environ.get("FLASK_CONFIG_FILE", "config.yaml")))
    )
)
locales = Locales(app)
_ = locales.get_message


def parsePhab(id):
    regex = re.compile(r"T\d+")
    if regex.match(id):
        return id
    else:
        return False


@app.route("/")
def index():
    return render_template("index.html", nav_title="Pointy")


@app.route("/pointing/<id>")
def pointing(id):
    parsedId = escape(parsePhab(id))

    if parsedId is not False:
        return render_template(
            "pointing.html", id=parsedId, phab=True, nav_title="Pointy: " + parsedId
        )
    else:
        return render_template(
            "pointing.html", id=parsedId, phab=False, nav_title="Pointy: " + parsedId
        )


@socketio.on("client.connected")
def handle_client_connected(json):
    print("Client connected: " + json["session"])


@socketio.on("client.start_pointing")
def handle_client_start_pointing(json):
    print("received json: " + str(json))


if __name__ == "__main__":
    socketio.run(
        app,
        debug=True,
        reloader_options={
            "extra_files": [
                "templates/base.html",
                "templates/index.html",
                "templates/pointing.html",
                "static/js/app.js",
                "static/css/stylesheet.css",
            ]
        },
    )
