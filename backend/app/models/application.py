from datetime import date
from app import db

class Application(db.Model):
    # Specifies the database table name explicitly.
    __tablename__ = 'application'
    
    # Primary Key - uniquely identifies each job application record.
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Key - links this application to the Student who applied.
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    
    # Foreign Key - links this application to the specific PlacementDrive.
    drive_id = db.Column(db.Integer, db.ForeignKey('placement_drive.id'), nullable=False)
    
    # The date when the application was submitted. Defaults to the current date.
    applied_on = db.Column(db.Date, default=date.today, nullable=False)
    
    # The status of the application (e.g. applied, shortlisted, selected, rejected). Defaults to 'applied'.
    status = db.Column(db.String(20), default='applied', nullable=False)

    def __init__(self, student_id, drive_id, applied_on=None, status='applied'):
        self.student_id = student_id
        self.drive_id = drive_id
        self.applied_on = applied_on if applied_on is not None else date.today()
        self.status = status

    def __repr__(self):
        return f'<Application id={self.id} student={self.student_id} drive={self.drive_id}>'

