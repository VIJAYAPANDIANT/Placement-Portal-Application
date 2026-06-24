from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from datetime import date, datetime
from app import db
from app.models.company import Company
from app.models.drive import PlacementDrive
from app.models.application import Application
from app.models.student import Student
from app.models.interview import InterviewSchedule
from app.utils.decorators import role_required

student_bp = Blueprint('student_bp', __name__)

@student_bp.route('/drives', methods=['GET'])
@role_required('student')
def get_student_drives():
    # Fetch drives where PlacementDrive.status is 'approved' AND related Company.approval_status is 'approved'
    drives_data = db.session.query(
        PlacementDrive, Company.name.label('company_name'), Company.industry.label('company_industry')
    ).join(Company, PlacementDrive.company_id == Company.id)\
     .filter(PlacementDrive.status == 'approved')\
     .filter(Company.approval_status == 'approved').all()

    result = []
    for drive, comp_name, comp_ind in drives_data:
        result.append({
            "id": drive.id,
            "job_title": drive.job_title,
            "job_description": drive.job_description,
            "package_lpa": drive.package_lpa,
            "application_deadline": drive.application_deadline.strftime("%Y-%m-%d") if drive.application_deadline else None,
            "eligibility_cgpa": drive.eligibility_cgpa,
            "eligible_branches": drive.get_branches(),
            "company_name": comp_name,
            "company_industry": comp_ind
        })

    return jsonify(result), 200

@student_bp.route('/drives/<int:drive_id>/apply', methods=['POST'])
@role_required('student')
def apply_to_drive(drive_id):
    student = Student.query.get(get_jwt_identity())
    if not student:
        return jsonify({"error": "Student not found"}), 404

    drive = PlacementDrive.query.get(drive_id)
    if not drive:
        return jsonify({"error": "Placement drive not found"}), 404

    # Run eligibility checks in the exact specified order
    
    # CHECK 1: CGPA check
    if student.cgpa < drive.eligibility_cgpa:
        return jsonify({"error": "CGPA does not meet eligibility requirement"}), 400

    # CHECK 2: Branch check
    if student.branch not in drive.get_branches():
        return jsonify({"error": "Your branch is not eligible for this drive"}), 400

    # CHECK 3: Duplicate application check
    existing = Application.query.filter_by(student_id=student.id, drive_id=drive_id).first()
    if existing:
        return jsonify({"error": "You have already applied to this drive"}), 400

    # Create application
    application = Application(
        student_id=student.id,
        drive_id=drive_id,
        applied_on=date.today(),
        status='applied'
    )
    db.session.add(application)
    db.session.commit()

    return jsonify({"message": "Application submitted successfully"}), 201

@student_bp.route('/applications', methods=['GET'])
@role_required('student')
def get_student_applications():
    student_id = get_jwt_identity()

    # Join Application with PlacementDrive and Company
    applications_data = db.session.query(
        Application.id.label('app_id'),
        Application.status.label('app_status'),
        Application.applied_on.label('app_applied_on'),
        PlacementDrive.job_title.label('job_title'),
        PlacementDrive.package_lpa.label('package_lpa'),
        Company.name.label('company_name')
    ).join(PlacementDrive, Application.drive_id == PlacementDrive.id)\
     .join(Company, PlacementDrive.company_id == Company.id)\
     .filter(Application.student_id == student_id).all()

    result = []
    for app in applications_data:
        result.append({
            "id": app.app_id,
            "status": app.app_status,
            "applied_on": app.app_applied_on.strftime("%Y-%m-%d") if app.app_applied_on else None,
            "job_title": app.job_title,
            "package_lpa": app.package_lpa,
            "company_name": app.company_name
        })

    return jsonify(result), 200

@student_bp.route('/interviews', methods=['GET'])
@role_required('student')
def get_student_interviews():
    student_id = get_jwt_identity()

    # Query drives where the student has an Application with status in ('shortlisted', 'selected')
    # and has a linked InterviewSchedule details
    interviews_data = db.session.query(
        InterviewSchedule.interview_date.label('interview_date'),
        InterviewSchedule.interview_mode.label('interview_mode'),
        InterviewSchedule.location_or_link.label('location_or_link'),
        InterviewSchedule.notes.label('notes'),
        PlacementDrive.job_title.label('job_title'),
        Company.name.label('company_name')
    ).join(PlacementDrive, InterviewSchedule.drive_id == PlacementDrive.id)\
     .join(Company, PlacementDrive.company_id == Company.id)\
     .join(Application, Application.drive_id == PlacementDrive.id)\
     .filter(Application.student_id == student_id)\
     .filter(Application.status.in_(['shortlisted', 'selected'])).all()

    result = []
    for iv in interviews_data:
        result.append({
            "interview_date": iv.interview_date.strftime("%Y-%m-%d") if iv.interview_date else None,
            "interview_mode": iv.interview_mode,
            "location_or_link": iv.location_or_link,
            "notes": iv.notes,
            "job_title": iv.job_title,
            "company_name": iv.company_name
        })

    return jsonify(result), 200

@student_bp.route('/dashboard/status-breakdown', methods=['GET'])
@role_required('student')
def get_status_breakdown():
    student_id = get_jwt_identity()

    stats = db.session.query(
        Application.status,
        db.func.count(Application.id)
    ).filter(Application.student_id == student_id)\
     .group_by(Application.status).all()

    stats_dict = {"applied": 0, "shortlisted": 0, "selected": 0, "rejected": 0}
    for status, count in stats:
        if status in stats_dict:
            stats_dict[status] = count

    return jsonify(stats_dict), 200
