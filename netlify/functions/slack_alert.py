import os
import requests

def send_slack_alert(message):
    webhook_url = os.getenv('SLACK_WEBHOOK_URL')
    if not webhook_url:
        print('Slack alert not sent: missing SLACK_WEBHOOK_URL')
        return
    payload = {'text': message}
    try:
        resp = requests.post(webhook_url, json=payload)
        if resp.status_code != 200:
            print(f'Slack alert failed: {resp.text}')
    except Exception as e:
        print(f'Slack alert exception: {e}')

def handler(event, context):
    send_slack_alert('Test alert from FOREX scraper.')
    return {
        'statusCode': 200,
        'body': 'Slack alert sent.'
    } 