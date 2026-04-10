# Job Search Assistant

Personal job search assistant for Prakhar Bhargava. The app fetches live jobs, parses JDs, scores them using a personalized framework, and supports actions such as generating an outreach email and selecting the right resume template.

## Stack

- FastAPI backend
- Streamlit dashboard
- SQLite database
- Requests + BeautifulSoup + RSS connectors

## Features

- Live job fetching from:
  - Naukri
  - Indeed RSS / HTML fallback
  - LinkedIn public search fallback
- Manual single-URL fetch safety net
- Personalized scoring with dynamic weights
- Leena AI EIR insertion and ranking
- Resume template recommendation
- Email draft / Gmail send support

## Run locally

### 1. Install dependencies

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### 2. Start API

```bash
python3 -m uvicorn backend.main:app --reload
```

### 3. Start dashboard

```bash
python3 -m streamlit run app.py
```

## Gmail setup

If you want real Gmail sending instead of local draft generation:

1. Create a Google Cloud project
2. Enable Gmail API
3. Download OAuth credentials
4. Put the file path in `GMAIL_CREDENTIALS_PATH`

Without credentials, the system still creates an email draft preview and logs the action as a dry run.

## Important note

Some job sites may block scraping depending on network conditions. The app is built with graceful fallbacks:

- LinkedIn public jobs scraping is the strongest live connector in this environment
- Indeed may return 403 on HTML pages; RSS/public pages are attempted first
- Naukri may intermittently return empty results depending on anti-bot behavior
- A manual single-job fetch endpoint exists so the demo can still run end to end

For a demo, the safest flow is:

1. Start API and Streamlit
2. Insert the Leena AI role
3. Run the pipeline
4. Show live LinkedIn-fed jobs being scored
5. Trigger resume recommendation and email action
