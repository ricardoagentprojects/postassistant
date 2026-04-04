"""
Process scheduled posts: marks due items (simulated publish / notification hook).
Run via Celery Beat every 5 minutes.
"""

import logging
from datetime import datetime, timezone

from worker.celery_app import celery_app
from database.session import SessionLocal
from schemas.models import Content

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=2)
def process_due_scheduled(self):
    """Find scheduled content whose time has passed; mark for follow-up (MVP: log + flag)."""
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        due = (
            db.query(Content)
            .filter(
                Content.status == "scheduled",
                Content.scheduled_for.isnot(None),
                Content.scheduled_for <= now,
            )
            .all()
        )
        for row in due:
            if not row.notification_sent:
                logger.info(
                    "Due scheduled post id=%s platform=%s — ready to publish (integrate network APIs next)",
                    row.id,
                    row.platform,
                )
                row.notification_sent = True
                row.updated_at = now
        db.commit()
        return {"processed": len(due)}
    except Exception as e:
        logger.exception("process_due_scheduled failed: %s", e)
        db.rollback()
        raise self.retry(exc=e, countdown=120) from e
    finally:
        db.close()
