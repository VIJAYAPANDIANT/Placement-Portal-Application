from datetime import date, datetime, timedelta
from celery import shared_task
from flask_mail import Message
from app import db, mail
from app.models import Admin, Application, Company, PlacementDrive, Student

@shared_task(name='app.tasks.celery_tasks.send_daily_reminders')
def send_daily_reminders():
    """
    BJ-1: Daily Reminder Task
    Runs every day at 8:00 AM.
    Sends reminders to students for upcoming deadlines and a digest to admin for pending companies.
    """
    today = date.today()
    three_days_later = today + timedelta(days=3)

    # PART A — Student deadline reminders
    upcoming_drives = PlacementDrive.query.filter(
        PlacementDrive.status == 'approved',
        PlacementDrive.application_deadline >= today,
        PlacementDrive.application_deadline <= three_days_later
    ).all()

    all_students = Student.query.filter_by(is_active=True).all()

    for drive in upcoming_drives:
        applied_student_ids = set(
            app.student_id for app in Application.query.filter_by(drive_id=drive.id).all()
        )
        company_name = drive.company.name if drive.company else "Company"
        deadline_str = drive.application_deadline.strftime("%Y-%m-%d")

        for student in all_students:
            if student.id not in applied_student_ids:
                msg = Message(
                    subject=f"Placement Drive Deadline Approaching — {drive.job_title}",
                    recipients=[student.email],
                    body=f"Dear {student.name}, the drive for {drive.job_title} at {company_name} closes on {deadline_str}. Apply before it's too late!"
                )
                try:
                    mail.send(msg)
                except Exception as e:
                    print(f"Failed to send deadline email to {student.email}: {e}")

    # PART B — Admin digest
    pending_count = Company.query.filter_by(approval_status='pending').count()
    if pending_count > 0:
        admin = Admin.query.first()
        if admin and admin.email:
            msg = Message(
                subject="Daily Digest — Pending Company Approvals",
                recipients=[admin.email],
                body=f"There are {pending_count} companies awaiting your approval. Please log in to review them."
            )
            try:
                mail.send(msg)
            except Exception as e:
                print(f"Failed to send admin digest email: {e}")

    return "Daily reminders process completed"


@shared_task(name='app.tasks.celery_tasks.send_monthly_report')
def send_monthly_report():
    """
    BJ-2: Monthly Report Task
    Runs on the 1st of every month at 9:00 AM.
    Gathers monthly placement metrics and emails an HTML report to Admin.
    """
    now = datetime.now()
    current_month = now.month
    current_year = now.year

    total_drives = PlacementDrive.query.filter(
        db.extract('month', PlacementDrive.application_deadline) == current_month,
        db.extract('year', PlacementDrive.application_deadline) == current_year
    ).count()

    total_applications = Application.query.filter(
        db.extract('month', Application.applied_on) == current_month,
        db.extract('year', Application.applied_on) == current_year
    ).count()

    total_selections = Application.query.filter(
        Application.status == 'selected',
        db.extract('month', Application.applied_on) == current_month,
        db.extract('year', Application.applied_on) == current_year
    ).count()

    top_companies_query = db.session.query(
        Company.name, db.func.count(PlacementDrive.id).label('drive_count')
    ).join(PlacementDrive, PlacementDrive.company_id == Company.id)\
     .filter(PlacementDrive.status == 'approved')\
     .group_by(Company.id)\
     .order_by(db.desc('drive_count'))\
     .limit(3).all()

    month_year_str = now.strftime("%B %Y")
    
    company_items = "".join([f"<li>{comp_name} — {count} drives</li>" for comp_name, count in top_companies_query])
    if not company_items:
        company_items = "<li>No approved drives recorded</li>"

    html_content = f"""<h2>Monthly Placement Report — {month_year_str}</h2>
<p>Drives conducted: {total_drives}</p>
<p>Applications received: {total_applications}</p>
<p>Students selected: {total_selections}</p>
<h3>Top Companies</h3>
<ul>
  {company_items}
</ul>"""

    admin = Admin.query.first()
    if admin and admin.email:
        msg = Message(
            subject=f"Monthly Placement Report — {month_year_str}",
            recipients=[admin.email],
            html=html_content
        )
        try:
            mail.send(msg)
        except Exception as e:
            print(f"Failed to send monthly report email: {e}")

    return "Monthly report completed"


@shared_task(name='app.tasks.celery_tasks.export_student_applications_csv')
def export_student_applications_csv(student_id, student_email):
    """
    BJ-3: CSV Export Task
    User-triggered task called on demand.
    Generates a CSV of application history for a specific student and emails it as an attachment.
    """
    apps = db.session.query(
        Company.name.label('company_name'),
        PlacementDrive.job_title,
        PlacementDrive.package_lpa,
        Application.applied_on,
        Application.status
    ).join(PlacementDrive, Application.drive_id == PlacementDrive.id)\
     .join(Company, PlacementDrive.company_id == Company.id)\
     .filter(Application.student_id == student_id).all()

    csv_lines = ["Company,Job Title,Package LPA,Applied On,Status"]
    for app in apps:
        applied_str = app.applied_on.strftime("%Y-%m-%d") if app.applied_on else ""
        csv_lines.append(f"{app.company_name},{app.job_title},{app.package_lpa},{applied_str},{app.status}")
    
    csv_content = "\n".join(csv_lines) + "\n"

    msg = Message(
        subject="Your Application History Export",
        recipients=[student_email],
        body="Please find your application history attached."
    )
    msg.attach("applications.csv", "text/csv", csv_content)
    
    try:
        mail.send(msg)
    except Exception as e:
        print(f"Failed to send CSV export email: {e}")

    return f"Export completed for student {student_id}"
