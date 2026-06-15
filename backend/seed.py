from app import create_app, db
from app.models.admin import Admin
from werkzeug.security import generate_password_hash

def seed_database():
    # 1. Create a Flask application instance using the factory.
    app = create_app()
    
    # 2. Open an application context. This is required because SQLAlchemy needs
    # to know which database application configuration it should run under.
    with app.app_context():
        # 3. Check if there are any records in the Admin table using .first()
        admin = Admin.query.first()
        
        if not admin:
            print("No admin user found. Creating default admin account...")
            # Hash the admin password secure using Werkzeug PBKDF2 hashing
            hashed_pwd = generate_password_hash("admin123")
            
            # Instantiate Admin model
            admin_user = Admin(
                email="admin@placement.com",
                password_hash=hashed_pwd
            )
            
            # Save and commit the new admin record to the database
            db.session.add(admin_user)
            db.session.commit()
            print("Default admin created successfully: admin@placement.com / admin123")
        else:
            # If an admin already exists, do nothing to prevent overwriting existing configurations.
            print(f"Admin account already exists: {admin.email}")

if __name__ == '__main__':
    seed_database()
