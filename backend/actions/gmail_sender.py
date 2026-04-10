import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict

from backend.database import log_action
from backend.profile import PROFILE


def generate_email(job: Dict, profile: Dict = PROFILE) -> Dict[str, str]:
    matched = job.get("skills_matched") or []
    if isinstance(matched, str):
        import json

        try:
            matched = json.loads(matched)
        except Exception:
            matched = []

    role_type = job.get("role_type", "strategy")
    template_map = {
        "founders_office": "founders_office",
        "strategy": "strategy",
        "product": "product",
        "ai_product": "ai_builder",
        "growth": "product",
        "consulting": "strategy",
        "vc": "strategy",
        "other": "founders_office",
    }
    template_key = template_map.get(role_type, "founders_office")
    template = profile["resume_templates"][template_key]

    bullets = [
        f"My experience in {matched[0]} aligns directly with the role."
        if len(matched) > 0
        else "I bring structured problem solving and high-ownership execution."
    ]
    if len(matched) > 1:
        bullets.append(f"I have demonstrated {matched[1]} in prior operating roles.")
    else:
        bullets.append("I thrive in ambiguous, cross-functional environments.")
    bullets.append(template["positioning"])

    subject = f"Prakhar Bhargava — Interest in {job['title']} at {job['company']}"
    body = f"""Hi,

I came across the {job['title']} position at {job['company']} and wanted to express my interest.

I am currently completing my PGP at Masters' Union, with prior experience leading analytics and operating systems in high-pressure environments at Nation With NaMo. I have also worked as an APM Intern at Swiggy, where I improved warehouse efficiency by 70%.

What specifically excites me about this role:
- {bullets[0]}
- {bullets[1]}
- {bullets[2]}

I would value the opportunity to discuss how my background maps to what {job['company']} needs right now.

Best,
Prakhar Bhargava
{profile['phone']}
{profile['email']}
"""
    return {"subject": subject, "body": body}


def send_email(job_id: int, recipient: str, subject: str, body: str) -> Dict:
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    sender = os.getenv("SMTP_FROM", smtp_user or PROFILE["email"])

    if not smtp_host or not smtp_user or not smtp_password:
        result = {
            "sent": False,
            "mode": "dry_run",
            "reason": "SMTP credentials not configured",
            "preview": {"to": recipient, "subject": subject, "body": body},
        }
        log_action(job_id, "email_sent", result, status="dry_run")
        return result

    message = MIMEMultipart()
    message["From"] = sender
    message["To"] = recipient
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(sender, [recipient], message.as_string())

    result = {"sent": True, "mode": "smtp", "to": recipient, "subject": subject}
    log_action(job_id, "email_sent", result)
    return result
