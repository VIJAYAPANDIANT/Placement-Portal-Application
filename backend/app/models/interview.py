from app import db

class InterviewSchedule(db.Model):
    # Specifies the database table name explicitly.
    __tablename__ = 'interview_schedule'
    
    # Primary Key - uniquely identifies each Interview Schedule record.
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Key - links this schedule to the respective PlacementDrive.
    drive_id = db.Column(db.Integer, db.ForeignKey('placement_drive.id'), nullable=False)
    
    # The date on which the interview is scheduled to take place. Stored as a date.
    interview_date = db.Column(db.Date, nullable=False)
    
    # The medium of the interview (e.g. 'Online' or 'In-Person'). Stored as a string.
    interview_mode = db.Column(db.String(50), nullable=False)
    
    # Physical address (for offline interviews) or meeting URL (for online interviews, e.g. Zoom, Google Meet).
    location_or_link = db.Column(db.String(255))
    
    # Any extra instructions or notes for the interviewees.
    notes = db.Column(db.Text)

    def __repr__(self):
        return f'<InterviewSchedule id={self.id} drive={self.drive_id}>'
