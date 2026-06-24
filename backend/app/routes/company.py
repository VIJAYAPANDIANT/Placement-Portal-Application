from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from datetime import datetime
from app import db
from app.models.company import Company
from app.models.drive import PlacementDrive
from app.models.application import Application
from app.models.student import Student
from app.models.interview import InterviewSchedule
from app.utils.decorators import role_required

company_bp = Blueprint('company_bp', __name__)

def verify_approved_company():
    company = Company.query.get(get_jwt_identity())
    if not company:
        return jsonify({"error": "Company not found"}), 404
    if company.approval_status != 'approved':
        return jsonify({"error": "Account not yet approved by Admin"}), 403
    return None

@company_bp.route('/drives', methods=['POST'])
@role_required('company')
def create_drive():
    approval_check = verify_approved_company()
    if approval_check:
        return approval_check

    data = request.get_json() or {}
    job_title = data.get('job_title')
    job_description = data.get('job_description')
    eligibility_cgpa = data.get('eligibility_cgpa')
    eligible_branches = data.get('eligible_branches')
    application_deadline_str = data.get('application_deadline')
    package_lpa = data.get('package_lpa')

    # Basic validations
    if not all([job_title, eligibility_cgpa, eligible_branches, application_deadline_str, package_lpa]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        deadline_date = datetime.strptime(application_deadline_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    drive = PlacementDrive(
        company_id=get_jwt_identity(),
        job_title=job_title,
        job_description=job_description,
        eligibility_cgpa=float(eligibility_cgpa),
        package_lpa=float(package_lpa),
        application_deadline=deadline_date,
        status='pending'
    )
    drive.set_branches(eligible_branches)

    db.session.add(drive)
    db.session.commit()

    return jsonify({
        "message": "Drive created, awaiting Admin approval",
        "drive_id": drive.id
    }), 201

@company_bp.route('/drives', methods=['GET'])
@role_required('company')
def get_company_drives():
    company_id = get_jwt_identity()
    drives = PlacementDrive.query.filter_by(company_id=company_id).all()
    
    result = []
    for drive in drives:
        # Count applications for this drive
        applicant_count = Application.query.filter_by(drive_id=drive.id).count()
        result.append({
            "id": drive.id,
            "job_title": drive.job_title,
            "status": drive.status,
            "package_lpa": drive.package_lpa,
            "application_deadline": drive.application_deadline.strftime("%Y-%m-%d") if drive.application_deadline else None,
            "eligibility_cgpa": drive.eligibility_cgpa,
            "eligible_branches": drive.get_branches(),
            "applicant_count": applicant_count
        })
    return jsonify(result), 200

@company_bp.route('/drives/<int:drive_id>/applicants', methods=['GET'])
@role_required('company')
def get_drive_applicants(drive_id):
    drive = PlacementDrive.query.get(drive_id)
    if not drive:
        return jsonify({"error": "Placement drive not found"}), 404

    if drive.company_id != get_jwt_identity():
        return jsonify({"error": "Access denied"}), 403

    # Join Application with Student to retrieve requested fields
    applicants_data = db.session.query(
        Application.id.label('application_id'),
        Application.status.label('application_status'),
        Application.applied_on.label('applied_on'),
        Student.name.label('student_name'),
        Student.roll_number.label('roll_number'),
        Student.branch.label('branch'),
        Student.cgpa.label('cgpa')
    ).join(Student, Application.student_id == Student.id)\
     .filter(Application.drive_id == drive_id).all()

    result = []
    for app in applicants_data:
        result.append({
            "student_name": app.student_name,
            "roll_number": app.roll_number,
            "branch": app.branch,
            "cgpa": app.cgpa,
            "application_id": app.application_id,
            "application_status": app.application_status,
            "applied_on": app.applied_on.strftime("%Y-%m-%d") if app.applied_on else None
        })
    return jsonify(result), 200

@company_bp.route('/applications/<int:application_id>/status', methods=['PUT'])
@role_required('company')
def update_application_status(application_id):
    approval_check = verify_approved_company()
    if approval_check:
        return approval_check

    application = Application.query.get(application_id)
    if not application:
        return jsonify({"error": "Application not found"}), 404

    drive = PlacementDrive.query.get(application.drive_id)
    if not drive or drive.company_id != get_jwt_identity():
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json() or {}
    new_status = data.get('status')
    if new_status not in ['shortlisted', 'selected', 'rejected']:
        return jsonify({"error": "Invalid status value"}), 400

    application.status = new_status
    db.session.commit()

    return jsonify({"message": "Application status updated successfully"}), 200

@company_bp.route('/drives/<int:drive_id>/interview', methods=['POST'])
@role_required('company')
def schedule_interview(drive_id):
    approval_check = verify_approved_company()
    if approval_check:
        return approval_check

    drive = PlacementDrive.query.get(drive_id)
    if not drive:
        return jsonify({"error": "Placement drive not found"}), 404

    if drive.company_id != get_jwt_identity():
        return jsonify({"error": "Access denied"}), 403

    existing_schedule = InterviewSchedule.query.filter_by(drive_id=drive_id).first()
    if existing_schedule:
        return jsonify({"error": "Interview already scheduled for this drive"}), 400

    data = request.get_json() or {}
    interview_date_str = data.get('interview_date')
    interview_mode = data.get('interview_mode')
    location_or_link = data.get('location_or_link')
    notes = data.get('notes')

    if not all([interview_date_str, interview_mode]):
        return jsonify({"error": "Missing required fields"}), 400

    if interview_mode not in ['online', 'offline']:
        return jsonify({"error": "Invalid interview mode"}), 400

    try:
        interview_date = datetime.strptime(interview_date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    schedule = InterviewSchedule(
        drive_id=drive_id,
        interview_date=interview_date,
        interview_mode=interview_mode,
        location_or_link=location_or_link,
        notes=notes
    )

    db.session.add(schedule)
    db.session.commit()

    return jsonify({"message": "Interview scheduled successfully"}), 201

@company_bp.route('/dashboard/funnel', methods=['GET'])
@role_required('company')
def get_funnel_stats():
    company_id = get_jwt_identity()
    
    # Query statuses count by grouping applications on drives owned by company_id
    stats = db.session.query(
        Application.status,
        db.func.count(Application.id)
    ).join(PlacementDrive, Application.drive_id == PlacementDrive.id)\
     .filter(PlacementDrive.company_id == company_id)\
     .group_by(Application.status).all()

    stats_dict = {"applied": 0, "shortlisted": 0, "selected": 0, "rejected": 0}
    for status, count in stats:
        if status in stats_dict:
            stats_dict[status] = count

    return jsonify(stats_dict), 200
