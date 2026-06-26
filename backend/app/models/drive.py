import json
from app import db

class PlacementDrive(db.Model):
    # Specifies the database table name explicitly.
    __tablename__ = 'placement_drive'
    
    # Primary Key - uniquely identifies each Placement Drive record.
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Key - links the drive to the Company that created it.
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=False)
    
    # The title of the job position being offered. Cannot be empty.
    job_title = db.Column(db.String(100), nullable=False)
    
    # Detailed description of the job profile, responsibilities, and requirements.
    job_description = db.Column(db.Text)
    
    # The minimum CGPA required for a student to apply. Cannot be empty.
    eligibility_cgpa = db.Column(db.Float, nullable=False)
    
    # Text field storing the list of eligible academic branches as a serialized JSON string.
    eligible_branches = db.Column(db.Text, nullable=False)
    
    # Date after which applications will not be accepted. Stored as a date. Cannot be empty.
    application_deadline = db.Column(db.Date, nullable=False)
    
    # The compensation package offered (Lakhs Per Annum). Stored as a float. Cannot be empty.
    package_lpa = db.Column(db.Float, nullable=False)
    
    # Current status of the drive (e.g. pending, approved, ongoing, completed). Defaults to 'pending'.
    status = db.Column(db.String(20), default='pending', nullable=False)
    
    # Establishes a one-to-many relationship with Application.
    # - backref='drive' allows an Application to reference the PlacementDrive as application.drive.
    # - lazy=True means related applications are loaded on-demand.
    applications = db.relationship('Application', backref='drive', lazy=True)
    
    # Establishes a one-to-one relationship with InterviewSchedule.
    # - uselist=False tells SQLAlchemy that this is a one-to-one relationship rather than one-to-many.
    # - backref='drive' allows the InterviewSchedule to reference the PlacementDrive as schedule.drive.
    interview_schedule = db.relationship('InterviewSchedule', backref='drive', uselist=False)
    
    def __init__(self, company_id, job_title, eligibility_cgpa, package_lpa, application_deadline, status='pending', job_description=None, eligible_branches=None):
        self.company_id = company_id
        self.job_title = job_title
        self.eligibility_cgpa = eligibility_cgpa
        self.package_lpa = package_lpa
        self.application_deadline = application_deadline
        self.status = status
        self.job_description = job_description
        if eligible_branches is not None:
            self.eligible_branches = eligible_branches

    def set_branches(self, branches_list):
        """Serializes a Python list of branches into a JSON string to store in the database."""
        self.eligible_branches = json.dumps(branches_list)
        
    def get_branches(self):
        """Deserializes the stored JSON string of branches back into a Python list."""
        if not self.eligible_branches:
            return []
        return json.loads(self.eligible_branches)

    def __repr__(self):
        return f'<PlacementDrive {self.job_title}>'

