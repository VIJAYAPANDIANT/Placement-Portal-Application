from celery.schedules import crontab

CELERYBEAT_SCHEDULE = {
    'daily-reminder': {
        'task': 'app.tasks.celery_tasks.send_daily_reminders',
        'schedule': crontab(hour=8, minute=0),
    },
    'monthly-report': {
        'task': 'app.tasks.celery_tasks.send_monthly_report',
        'schedule': crontab(day_of_month=1, hour=9, minute=0),
    },
}
