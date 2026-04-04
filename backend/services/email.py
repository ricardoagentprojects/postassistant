# Email service for sending transactional emails
import os
import logging
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

# Email configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@postassistant.ai")
FROM_NAME = os.getenv("FROM_NAME", "PostAssistant")

def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """
    Send an email using SMTP
    Returns True if successful, False otherwise
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured, skipping email send")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
        msg["To"] = to_email
        
        # Add text/plain part
        if text_content:
            text_part = MIMEText(text_content, "plain")
            msg.attach(text_part)
        
        # Add HTML part
        html_part = MIMEText(html_content, "html")
        msg.attach(html_part)
        
        # Send email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Email sent to {to_email}: {subject}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


def send_password_reset_email(to_email: str, reset_link: str) -> bool:
    """Transactional email with link to set a new password."""
    subject = "Reset your PostAssistant password"
    text_content = (
        f"Hi,\n\nWe received a request to reset your PostAssistant password.\n\n"
        f"Open this link (valid for 1 hour):\n{reset_link}\n\n"
        f"If you did not request this, you can ignore this email.\n"
    )
    html_content = f"""
    <!DOCTYPE html>
    <html><body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #1e293b;">
      <p>Hi,</p>
      <p>We received a request to reset your <strong>PostAssistant</strong> password.</p>
      <p><a href="{reset_link}" style="display: inline-block; background: #1d4ed8; color: #fff;
        padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Reset password</a></p>
      <p style="font-size: 14px; color: #64748b;">Or copy this link:<br/><span style="word-break: break-all;">{reset_link}</span></p>
      <p style="font-size: 14px; color: #64748b;">This link expires in 1 hour. If you did not request a reset, ignore this email.</p>
    </body></html>
    """
    return send_email(to_email, subject, html_content, text_content=text_content)


def send_waitlist_welcome_email(waitlist_entry) -> bool:
    """
    Send welcome email to new waitlist signup
    """
    subject = "🎉 Welcome to PostAssistant Waitlist!"
    
    # Create HTML email
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to PostAssistant</title>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }}
            .cta-button {{ display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }}
            .feature {{ margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 6px; }}
            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎉 Welcome to PostAssistant!</h1>
            <p>You're on the waitlist for AI-powered social media content</p>
        </div>
        
        <div class="content">
            <p>Hi {waitlist_entry.name or 'there'},</p>
            
            <p>Thank you for joining the PostAssistant waitlist! We're excited to have you on board.</p>
            
            <p><strong>Your position in line:</strong> We'll notify you as soon as early access is available (estimated 1-2 weeks).</p>
            
            <div class="feature">
                <h3>🚀 What to expect:</h3>
                <ul>
                    <li><strong>AI Content Generation:</strong> Create engaging posts in seconds</li>
                    <li><strong>Smart Scheduling:</strong> Post at optimal times automatically</li>
                    <li><strong>Performance Analytics:</strong> Track what works best</li>
                    <li><strong>Multi-platform:</strong> Twitter, Instagram, LinkedIn support</li>
                </ul>
            </div>
            
            <div class="feature">
                <h3>📈 While you wait:</h3>
                <p>Follow us for updates and content tips:</p>
                <ul>
                    <li><strong>Twitter:</strong> <a href="https://twitter.com/postassistant">@postassistant</a></li>
                    <li><strong>Website:</strong> <a href="https://postassistant.ai">postassistant.ai</a></li>
                </ul>
            </div>
            
            <p>We're working hard to launch PostAssistant and can't wait to help you create amazing content!</p>
            
            <p>Best regards,<br>
            <strong>The PostAssistant Team</strong></p>
        </div>
        
        <div class="footer">
            <p>PostAssistant - AI-powered content assistant for social media</p>
            <p><a href="https://postassistant.ai">Website</a> | <a href="https://postassistant.ai/privacy">Privacy Policy</a> | <a href="https://postassistant.ai/terms">Terms</a></p>
            <p>This email was sent to {waitlist_entry.email}. If you didn't sign up, please ignore this email.</p>
        </div>
    </body>
    </html>
    """
    
    # Plain text version
    text_content = f"""Welcome to PostAssistant!

Hi {waitlist_entry.name or 'there'},

Thank you for joining the PostAssistant waitlist! We're excited to have you on board.

Your position in line: We'll notify you as soon as early access is available (estimated 1-2 weeks).

What to expect:
- AI Content Generation: Create engaging posts in seconds
- Smart Scheduling: Post at optimal times automatically
- Performance Analytics: Track what works best
- Multi-platform: Twitter, Instagram, LinkedIn support

While you wait:
Follow us for updates and content tips:
- Twitter: https://twitter.com/postassistant
- Website: https://postassistant.ai

We're working hard to launch PostAssistant and can't wait to help you create amazing content!

Best regards,
The PostAssistant Team

---
PostAssistant - AI-powered content assistant for social media
Website: https://postassistant.ai
Privacy Policy: https://postassistant.ai/privacy
Terms: https://postassistant.ai/terms

This email was sent to {waitlist_entry.email}. If you didn't sign up, please ignore this email."""
    
    return send_email(waitlist_entry.email, subject, html_content, text_content)

def send_invitation_email(waitlist_entry, invitation_token: str) -> bool:
    """
    Send invitation email to waitlist user
    """
    invitation_url = f"https://app.postassistant.ai/signup?token={invitation_token}"
    
    subject = "🎯 You're Invited! Early Access to PostAssistant"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }}
            .cta-button {{ display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎯 You're Invited!</h1>
            <p>Early Access to PostAssistant is Here</p>
        </div>
        
        <div class="content">
            <p>Hi {waitlist_entry.name or 'there'},</p>
            
            <p>Great news! You've been selected for early access to PostAssistant.</p>
            
            <p>As an early user, you'll get:</p>
            <ul>
                <li>🎁 <strong>Free 30-day trial</strong> of all Pro features</li>
                <li>🤝 <strong>Direct feedback channel</strong> to our team</li>
                <li>🚀 <strong>Early adopter pricing</strong> when you subscribe</li>
            </ul>
            
            <p style="text-align: center; margin: 30px 0;">
                <a href="{invitation_url}" class="cta-button">Claim Your Early Access</a>
            </p>
            
            <p>This invitation is exclusive and will expire in 7 days.</p>
            
            <p>We can't wait to see what amazing content you'll create!</p>
            
            <p>Best,<br>The PostAssistant Team</p>
        </div>
    </body>
    </html>
    """
    
    return send_email(waitlist_entry.email, subject, html_content)

def send_password_reset_email(email: str, reset_token: str) -> bool:
    """
    Send password reset email
    """
    reset_url = f"https://app.postassistant.ai/reset-password?token={reset_token}"
    
    subject = "🔐 Reset Your PostAssistant Password"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; }}
            .cta-button {{ display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }}
        </style>
    </head>
    <body>
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your PostAssistant password.</p>
        
        <p style="text-align: center; margin: 30px 0;">
            <a href="{reset_url}" class="cta-button">Reset Password</a>
        </p>
        
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
    </body>
    </html>
    """
    
    return send_email(email, subject, html_content)

# Mock function for development
def send_mock_email(to_email: str, subject: str, content: str) -> bool:
    """
    Mock email function for development (logs instead of sending)
    """
    logger.info(f"[MOCK EMAIL] To: {to_email}, Subject: {subject}")
    logger.info(f"[MOCK EMAIL CONTENT] {content[:200]}...")
    return True