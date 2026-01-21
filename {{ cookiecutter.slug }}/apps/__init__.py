import os

from flask import Flask
{%- if cookiecutter.use_auth != 'n' %}
from flask_login import LoginManager
{%- endif %}
from flask_sqlalchemy import SQLAlchemy
from importlib import import_module


db = SQLAlchemy()
{%- if cookiecutter.use_auth != 'n' %}
login_manager = LoginManager()
{%- endif %}

def register_extensions(app):
    db.init_app(app)
    { % - if cookiecutter.use_auth != 'n' %}
    login_manager.init_app(app)
    { % - endif %}

{%- if cookiecutter.use_auth != 'n' %}
apps = ('authentication', 'pages',)
{ % - else %}
apps = ('pages',)
{ % - endif %}

def register_blueprints(app):
    for module_name in apps:
        module = import_module('apps.{}.routes'.format(module_name))
        app.register_blueprint(module.blueprint)


def configure_database(app):

    @app.before_request
    def initialize_database():
        try:
            db.create_all()
        except Exception as e:

            print('> Error: DBMS Exception: ' + str(e) )

            # fallback to SQLite
            basedir = os.path.abspath(os.path.dirname(__file__))
            app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'db.sqlite3')

            print('> Fallback to SQLite ')
            db.create_all()

    @app.teardown_request
    def shutdown_session(exception=None):
        db.session.remove()


def create_app(config):
    app = Flask(__name__)
    app.config.from_object(config)
    register_extensions(app)
    register_blueprints(app)
    configure_database(app)
    return app
