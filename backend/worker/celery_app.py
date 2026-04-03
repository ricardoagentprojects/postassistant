# Celery configuration for async tasks
import os
from celery import Celery
from celery.schedules import crontab

# Create Celery app
celery_app = Celery(
    "postassistant",
    broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    include=[
        "worker.tasks.waitlist",
        "worker.tasks.content",
        "worker.tasks.analytics"
    ]
)

# Configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Periodic tasks (beat schedule)
celery_app.conf.beat_schedule = {
    # Send waitlist welcome emails every hour
    "send-waitlist-welcome-emails": {
        "task": "worker.tasks.waitlist.send_welcome_emails",
        "schedule": crontab(minute=0, hour="*/1"),  # Every hour
        "args": (),
    },
    # Process scheduled posts every 5 minutes
    "process-scheduled-posts": {
        "task": "worker.tasks.content.process_scheduled_posts",
        "schedule": crontab(minute="*/5"),  # Every 5 minutes
        "args": (),
    },
    # Update analytics daily at 2 AM
    "update-daily-analytics": {
        "task": "worker.tasks.analytics.update_daily_metrics",
        "schedule": crontab(minute=0, hour=2),  # 2 AM daily
        "args": (),
    },
    # Cleanup old logs weekly
    "cleanup-old-logs": {
        "task": "worker.tasks.analytics.cleanup_old_logs",
        "schedule": crontab(minute=0, hour=3, day_of_week=0),  # Sunday 3 AM
        "args": (30,),  # Keep logs for 30 days
    },
}

if __name__ == "__main__":
    celery_app.start()