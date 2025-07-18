# Netlify Scheduled Function: scrape_rates
# Placeholder for main scraping logic

from scraper import main as run_scraper

def handler(event, context):
    run_scraper()
    return {
        'statusCode': 200,
        'body': 'Scraper ran successfully.'
    } 