from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# Globally instantiate database and JWT extensions.
# Other components will import these instances to interact with the database or JWT.
db = SQLAlchemy()
jwt = JWTManager()

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
    
    # Import and register the authentication blueprint
    # Handled inside the factory to keep imports clean and scoped
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    # Import and register the admin blueprint
    from app.routes.admin import admin_bp
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Ensure database models are registered and create tables
    with app.app_context():
        # Importing models runs the model initialization file, which registers
        # all 6 models to the db.Model metadata.
        from app import models
        
        # Creates all database tables inside SQLite if they do not exist yet.
        db.create_all()
        
    return app
