import os
import smtplib
from email.mime.text import MIMEText

def send_alert(subject, body):
    smtp_host = os.getenv('SMTP_HOST')
    smtp_port = int(os.getenv('SMTP_PORT', '587'))
    smtp_user = os.getenv('SMTP_USER')
    smtp_pass = os.getenv('SMTP_PASS')
    recipient = os.getenv('ALERT_EMAIL')
    sender = os.getenv('ALERT_FROM', smtp_user)

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = recipient

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(sender, [recipient], msg.as_string())

def handler(event, context):
    # Example usage: send_alert('Scraper Error', 'Details of the error...')
    send_alert('Test Alert', 'This is a test alert from the FOREX scraper.')
    return {
        'statusCode': 200,
        'body': 'Alert sent.'
    } 