# Waitlist tasks
import logging
from datetime import datetime, timezone
from typing import List
from worker.celery_app import celery_app
from database.session import SessionLocal
from schemas.models import Waitlist
from services.email import send_waitlist_welcome_email

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, max_retries=3)
def send_waitlist_welcome_emails(self):
    """Send welcome emails to new waitlist signups"""
    db = SessionLocal()
    try:
        # Find waitlist entries without welcome email sent
        new_signups = db.query(Waitlist).filter(
            Waitlist.welcome_email_sent == False,  # This column doesnt exist yet, but well add it
            Waitlist.created_at >= datetime.now(timezone.utc) - timedelta(days=1)
        ).all()
        
        logger.info(f"Found {len(new_signups)} new waitlist signups for welcome emails")
        
        for signup in new_signups:
            try:
                send_waitlist_welcome_email(signup)
                signup.welcome_email_sent = True
                signup.welcome_email_sent_at = datetime.now(timezone.utc)
                db.commit()
                logger.info(f"Sent welcome email to {signup.email}")
            except Exception as e:
                logger.error(f"Failed to send welcome email to {signup.email}: {e}")
                db.rollback()
                
    except Exception as e:
        logger.error(f"Error in send_waitlist_welcome_emails: {e}")
        raise self.retry(exc=e, countdown=60)
    finally:
        db.close()

@celery_app.task(bind=True, max_retries=3)
def invite_waitlist_user(self, waitlist_id: str, user_id: str = None):
    """Invite a waitlist user to create an account"""
    db = SessionLocal()
    try:
        waitlist_entry = db.query(Waitlist).filter(Waitlist.id == waitlist_id).first()
        if not waitlist_entry:
            logger.error(f"Waitlist entry {waitlist_id} not found")
            return
        
        # Mark as invited
        waitlist_entry.invited_at = datetime.now(timezone.utc)
        
        # Send invitation email
        # TODO: Implement invitation email
        
        db.commit()
        logger.info(f"Invited waitlist user {waitlist_entry.email}")
        
    except Exception as e:
        logger.error(f"Error inviting waitlist user: {e}")
        raise self.retry(exc=e, countdown=60)
    finally:
        db.close()

