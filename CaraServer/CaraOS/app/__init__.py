from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from config import Config
import os

db = SQLAlchemy()
login = LoginManager()
login.login_view = 'login'

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)
    login.init_app(app)
    
    from app import routes, audio_processing
    app.register_blueprint(routes.bp)
    
    with app.app_context():
        db.create_all()
    
    if not os.path.exists(app.config['TEMP_AUDIO_DIR']):
        os.makedirs(app.config['TEMP_AUDIO_DIR'])

    return app
