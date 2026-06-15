from app import db

class Admin(db.Model):
    # Specifies the database table name explicitly.
    __tablename__ = 'admin'
    
    # Primary Key - uniquely identifies each Admin record. It is an auto-incrementing integer.
    id = db.Column(db.Integer, primary_key=True)
    
    # The admin's email address. It must be unique (no two admins with same email) and cannot be empty (nullable=False).
    email = db.Column(db.String(120), unique=True, nullable=False)
    
    # Hashed version of the admin's password for security. It cannot be empty.
    password_hash = db.Column(db.String(255), nullable=False)

    def __init__(self, email, password_hash):
        self.email = email
        self.password_hash = password_hash

    def __repr__(self):
        # Provides a readable string representation of the Admin object, useful for debugging.
        return f'<Admin {self.email}>'
