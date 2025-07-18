import os
import requests
from datetime import datetime
from supabase import create_client
import pdfplumber
import time
import re
import smtplib
from email.mime.text import MIMEText

# Import Slack alert function
try:
    from netlify.functions.slack_alert import send_slack_alert
except ImportError:
    def send_slack_alert(msg):
        print('Slack alert (mock):', msg)

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

RATE_REGEX = re.compile(r"EUR\s*[:\-]?\s*(\d{1,3}\.\d{2,4})\b")

MAX_RETRIES = 3
RETRY_BACKOFF = 5  # seconds
PDF_TIMEOUT = 45
PAGE_LOAD_TIMEOUT = 30

# Email alert function

def send_alert(subject, body):
    smtp_host = os.getenv('SMTP_HOST')
    smtp_port = int(os.getenv('SMTP_PORT', '587'))
    smtp_user = os.getenv('SMTP_USER')
    smtp_pass = os.getenv('SMTP_PASS')
    recipient = os.getenv('ALERT_EMAIL')
    sender = os.getenv('ALERT_FROM', smtp_user)
    if not all([smtp_host, smtp_port, smtp_user, smtp_pass, recipient, sender]):
        print('Email alert not sent: missing SMTP config')
        return
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = recipient
    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(sender, [recipient], msg.as_string())
    except Exception as e:
        print(f'Failed to send alert email: {e}')

def fetch_banks():
    resp = supabase.table('banks').select('*').execute()
    return resp.data

def download_pdf(pdf_url, dest_path):
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.get(pdf_url, timeout=PDF_TIMEOUT)
            resp.raise_for_status()
            with open(dest_path, 'wb') as f:
                f.write(resp.content)
            return dest_path
        except Exception as e:
            print(f"Download failed (attempt {attempt}): {e}")
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_BACKOFF * attempt)
            else:
                raise

def parse_eur_bdt_rate(pdf_path):
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text() or ''
                # Look for 'Student File' section
                if 'Student File' in text:
                    # Try to extract EUR rate using regex
                    match = RATE_REGEX.search(text)
                    if match:
                        return float(match.group(1))
        # Fallback: search all pages
        for page in pdf.pages:
            text = page.extract_text() or ''
            match = RATE_REGEX.search(text)
            if match:
                return float(match.group(1))
    except Exception as e:
        print(f"PDF parsing error: {e}")
    raise ValueError("EUR→BDT rate not found in PDF")

def upsert_rate(bank_id, rate_date, eur_rate):
    supabase.table('rates').upsert({
        'bank_id': bank_id,
        'rate_date': rate_date,
        'eur_rate': eur_rate
    }).execute()

def main():
    banks = fetch_banks()
    today = datetime.now().strftime('%Y%m%d')
    for bank in banks:
        pdf_url = bank['pdf_page_url'].replace('YYYYMMDD', today)
        pdf_path = f"/tmp/{bank['name']}_{today}.pdf"
        try:
            download_pdf(pdf_url, pdf_path)
            eur_rate = parse_eur_bdt_rate(pdf_path)
            # Validation: check for anomalies (e.g., >10% change from previous day)
            prev = supabase.table('rates').select('eur_rate').eq('bank_id', bank['id']).order('rate_date', desc=True).limit(1).execute()
            if prev.data:
                prev_rate = prev.data[0]['eur_rate']
                if abs(eur_rate - prev_rate) / prev_rate > 0.10:
                    anomaly_msg = f"Anomaly: {bank['name']} rate changed >10% from previous day ({prev_rate} → {eur_rate})"
                    print(anomaly_msg)
                    send_alert(f"FOREX Rate Anomaly: {bank['name']}", anomaly_msg)
                    send_slack_alert(anomaly_msg)
            upsert_rate(bank['id'], datetime.now().date().isoformat(), eur_rate)
            print(f"{bank['name']}: {eur_rate}")
        except Exception as e:
            error_msg = f"Error processing {bank['name']}: {e}"
            print(error_msg)
            send_alert(f"FOREX Scraper Error: {bank['name']}", error_msg)
            send_slack_alert(error_msg)

if __name__ == "__main__":
    main() 