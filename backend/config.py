class Config:
    # Specifies the database URL. Here we use SQLite, and 'app.db' will be created in the application's root directory.
    SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'
    
    # Disables Flask-SQLAlchemy's event system, which tracks modifications of objects. 
    # Setting it to False avoids overhead and improves performance, as we don't need this custom tracking.
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # The secret key used by Flask-JWT-Extended to sign and encode JWT tokens.
    # In a production environment, this should be a secure, random string loaded from environment variables.
    JWT_SECRET_KEY = 'super-secret-key-change-in-production'
