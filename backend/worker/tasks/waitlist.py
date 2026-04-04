# Waitlist tasks
import logging
import os

from worker.celery_app import celery_app
from database.session import SessionLocal
from schemas.models import Waitlist
from services.email import send_waitlist_welcome_email

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3)
def send_welcome_emails(self):
    """Send welcome emails to waitlist entries not yet marked notified."""
    if not os.getenv("SMTP_USER") or not os.getenv("SMTP_PASSWORD"):
        logger.debug("SMTP not configured; skipping waitlist welcome batch")
        return

    db = SessionLocal()
    try:
        pending = db.query(Waitlist).filter(Waitlist.notified.is_(False)).all()
        logger.info("Waitlist welcome batch: %s pending", len(pending))

        for signup in pending:
            try:
                if send_waitlist_welcome_email(signup):
                    signup.notified = True
                    db.commit()
                    logger.info("Welcome email sent to %s", signup.email)
                else:
                    logger.debug("Welcome email skipped (SMTP not configured) for %s", signup.email)
            except Exception as e:
                logger.exception("Failed welcome email for %s: %s", signup.email, e)
                db.rollback()

    except Exception as e:
        logger.exception("send_welcome_emails failed: %s", e)
        raise self.retry(exc=e, countdown=60) from e
    finally:
        db.close()


@celery_app.task(bind=True, max_retries=3)
def invite_waitlist_user(self, waitlist_id: int):
    """Placeholder: invite flow when product onboarding is ready."""
    db = SessionLocal()
    try:
        entry = db.query(Waitlist).filter(Waitlist.id == waitlist_id).first()
        if not entry:
            logger.error("Waitlist id %s not found", waitlist_id)
            return
        logger.info("Invite placeholder for waitlist user %s", entry.email)
        db.commit()
    except Exception as e:
        logger.exception("invite_waitlist_user: %s", e)
        raise self.retry(exc=e, countdown=60) from e
    finally:
        db.close()
