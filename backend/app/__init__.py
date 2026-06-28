from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from flask_caching import Cache
from celery import Celery

# Globally instantiate database and JWT extensions.
db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()
cache = Cache()

def make_celery(app):
    celery = Celery(
        app.import_name,
        broker=app.config['CELERY_BROKER_URL'],
        backend=app.config['CELERY_RESULT_BACKEND']
    )
    celery.conf.update(app.config)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery

def create_app(config_class='config.Config'):
    """
    Flask App Factory.
    Creates, configures, and returns a Flask application instance.
    """
    app = Flask(__name__)
    CORS(app)
    
    # Load settings (database URI, JWT secret key) from config.py's Config class
    app.config.from_object(config_class)
    
    # Bind extensions to the current app instance
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    cache.init_app(app)
    
    celery = make_celery(app)
    app.celery = celery
    
    # Import and register the authentication blueprint
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    # Import and register the admin blueprint
    from app.routes.admin import admin_bp
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    from app.routes.company import company_bp
    app.register_blueprint(company_bp, url_prefix='/api/company')

    from app.routes.student import student_bp
    app.register_blueprint(student_bp, url_prefix='/api/student')
    
    @app.route('/')
    def index():
        return jsonify({
            "status": "online",
            "message": "Placement Portal backend API is active. Use frontend at http://localhost:5173 or endpoints /api/..."
        }), 200
    
    # Ensure database models are registered and create tables
    with app.app_context():
        from app import models
        db.create_all()
        
    return app
