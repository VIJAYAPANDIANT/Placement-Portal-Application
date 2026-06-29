import os

class Config:
    # Specifies the database URL. Here we use SQLite, and 'app.db' will be created in /tmp to support Vercel.
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:////tmp/app.db')
    
    # Disables Flask-SQLAlchemy's event system, which tracks modifications of objects. 
    # Setting it to False avoids overhead and improves performance, as we don't need this custom tracking.
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # The secret key used by Flask-JWT-Extended to sign and encode JWT tokens.
    # In a production environment, this should be a secure, random string loaded from environment variables.
    JWT_SECRET_KEY = 'super-secret-key-change-in-production'

    # Redis config (broker and result backend)
    CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0')
    CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')

    # Flask-Mail config (use Gmail SMTP for simplicity)
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'your-email@gmail.com'
    MAIL_PASSWORD = 'your-app-password'
    MAIL_DEFAULT_SENDER = 'your-email@gmail.com'

    # Flask-Caching config
    CACHE_TYPE = os.environ.get('CACHE_TYPE', 'SimpleCache')
    CACHE_REDIS_URL = os.environ.get('CACHE_REDIS_URL', 'redis://localhost:6379/0')
    CACHE_DEFAULT_TIMEOUT = 300

