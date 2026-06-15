from app import db

class Student(db.Model):
    # Specifies the database table name explicitly.
    __tablename__ = 'student'
    
    # Primary Key - uniquely identifies each Student record.
    id = db.Column(db.Integer, primary_key=True)
    
    # Full name of the student. Cannot be empty.
    name = db.Column(db.String(100), nullable=False)
    
    # Student email (used for login). Must be unique and cannot be empty.
    email = db.Column(db.String(120), unique=True, nullable=False)
    
    # Hashed version of the student's password for security.
    password_hash = db.Column(db.String(255), nullable=False)
    
    # College roll number of the student. Must be unique and cannot be empty.
    roll_number = db.Column(db.String(50), unique=True, nullable=False)
    
    # Academic branch/department of study (e.g. Computer Science). Cannot be empty.
    branch = db.Column(db.String(100), nullable=False)
    
    # Cumulative Grade Point Average. Stored as a floating-point number. Cannot be empty.
    cgpa = db.Column(db.Float, nullable=False)
    
    # The calendar year the student will graduate. Stored as an integer. Cannot be empty.
    graduation_year = db.Column(db.Integer, nullable=False)
    
    # URL pointing to the student's resume (stored in cloud storage or static path).
    resume_url = db.Column(db.String(255))
    
    # Flag indicating if the student account is active. Defaults to True.
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    # Flag indicating if the student is blacklisted from drives. Defaults to False.
    is_blacklisted = db.Column(db.Boolean, default=False, nullable=False)
    
    # Establishes a one-to-many relationship with Application.
    # - backref='student' allows an Application instance to reference the Student as application.student.
    # - lazy=True means related applications are loaded from the database only when accessed.
    applications = db.relationship('Application', backref='student', lazy=True)

    def __init__(self, name, email, password_hash, roll_number, branch, cgpa, graduation_year, resume_url=None, is_active=True, is_blacklisted=False):
        self.name = name
        self.email = email
        self.password_hash = password_hash
        self.roll_number = roll_number
        self.branch = branch
        self.cgpa = cgpa
        self.graduation_year = graduation_year
        self.resume_url = resume_url
        self.is_active = is_active
        self.is_blacklisted = is_blacklisted

    def __repr__(self):
        return f'<Student {self.name}>'
