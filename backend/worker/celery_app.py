# Celery configuration for async tasks
import os

from celery import Celery
from dotenv import load_dotenv

load_dotenv()
from celery.schedules import crontab

celery_app = Celery(
    "postassistant",
    broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    include=["worker.tasks.waitlist", "worker.tasks.schedule"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,
    task_soft_time_limit=25 * 60,
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

celery_app.conf.beat_schedule = {
    "send-waitlist-welcome-emails": {
        "task": "worker.tasks.waitlist.send_welcome_emails",
        "schedule": crontab(minute=0, hour="*/1"),
        "args": (),
    },
    "process-due-scheduled-posts": {
        "task": "worker.tasks.schedule.process_due_scheduled",
        "schedule": crontab(minute="*/5"),
        "args": (),
    },
}

if __name__ == "__main__":
    celery_app.start()
