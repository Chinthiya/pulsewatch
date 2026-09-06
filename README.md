# PulseWatch

### Don't just watch the market. Know what you missed.

PulseWatch is a smart market watchlist designed to help users quickly understand what meaningfully changed in the stocks they follow since their last visit.

Unlike a traditional watchlist that mainly shows the current market state, PulseWatch remembers the user's previous check and highlights changes that deserve attention.

---

## Problem

A normal stock watchlist tells users what is happening **right now**, but it does not answer an important question:

> **"What changed since I last checked?"**

Users may follow many stocks and return after several hours or days. Looking through every price and volume value manually makes it difficult to identify which stocks actually deserve attention.

PulseWatch solves this by comparing the current market state with the user's previous check and prioritizing meaningful changes.

---

## Key Feature — Since You Last Checked

PulseWatch stores a snapshot of each watched stock when the user checks the watchlist.

The next time the user checks the watchlist, the system compares:

- Previous price
- Current price
- Price movement since the last check
- Current trading volume

It then calculates an **Attention Score** and explains why the stock is being highlighted.

### Example

```text
Previous price:       ₹1,455.35
Current price:        ₹1,490.59

Since last check:
+₹35.24 (+2.42%)

Attention Score:
70 / 100 — HIGH

Instead of manually comparing every stock, the user can immediately see what changed and what deserves attention.

What Makes a Change Meaningful?

PulseWatch does not simply rank stocks by the largest percentage movement.

A meaningful change can involve multiple signals:

Noticeable price movement
Significant price movement
Unusually high trading volume
A combination of price movement and unusual volume

This produces an explainable attention score rather than an unexplained alert.

Attention Scoring

PulseWatch currently uses a deterministic rule-based scoring engine.

Price Movement
Change Since Last Check	Score
≥ 5%	+50
≥ 2%	+40
≥ 1%	+15
Volume

Volume contributes additional points when price movement is at least 1%.

Volume Compared With Baseline	Score
≥ 3×	+30
≥ 2×	+20
Attention Levels
70+       HIGH
40–69     MEDIUM
0–39      LOW
Example
Price movement:      +2.42%  → +40
Unusual volume:      ≥3×     → +30
                              ----
Total Score:                 70
Attention:                   HIGH

Every attention score is accompanied by reasons explaining why the stock received that score.

Dashboard

PulseWatch organizes stocks into three categories:

Need Attention

Stocks with higher attention scores that deserve immediate attention.

Changed

Stocks with meaningful movement but lower priority.

Stable

Stocks without significant changes since the previous check.

Each stock card displays:

Current price
Today's market change
Change since last check
Attention score
Reasons for the score
Trading volume
Stock Details

Clicking a stock card opens a detailed view containing:

Current price
Attention score
Change since last check
Reasons for the alert
Today's percentage change
Trading volume
Market data source

This allows users to understand:

"Why am I seeing this stock?"

rather than simply receiving an unexplained alert.

Market Status

PulseWatch detects the Indian market's regular trading hours using IST.

09:15 – 15:30 IST

The application displays whether the market is:

Open
Closed
Before market open
After market close
Closed due to weekend

This gives users context about whether the displayed market information is from an active trading session.

Data Handling and Resilience

PulseWatch uses Yahoo Finance through yfinance when market data is available.

For reliable development and demonstrations, the application also includes a clearly labelled demo-data fallback.

The UI identifies the data source:

YAHOO

or

DEMO

Demo data is never presented as real-time market data.

If the external market-data provider fails, PulseWatch can continue operating using the fallback data source instead of crashing the application.

First Check vs Returning User

On the first check of a stock, PulseWatch creates a baseline snapshot.

Since there is no previous state to compare against, the stock is not incorrectly marked as changed.

On subsequent checks:

Previous Snapshot
       ↓
Current Market Data
       ↓
Calculate Change
       ↓
Calculate Attention Score
       ↓
Generate Reasons
       ↓
Display Priority

This is the core logic behind the Since You Last Checked feature.

Edge Cases Handled

PulseWatch considers several practical cases:

Duplicate stocks are rejected.
Invalid watchlists return appropriate errors.
External market-data failures fall back to demo data.
First-time stock checks do not generate false change alerts.
Market closed periods are explicitly displayed.
Previous snapshots are persisted in the database.
Stock removal also removes its stored snapshot.
API failures are handled without crashing the frontend.
Data source and timestamps are exposed for transparency.
Architecture

PulseWatch uses a simple modular monolith architecture.

The frontend communicates with a FastAPI backend through REST APIs. The backend handles watchlists, market data, snapshot persistence and change analysis.

                         ┌─────────────────────┐
                         │      React UI       │
                         │      Frontend       │
                         └──────────┬──────────┘
                                    │
                              REST API
                                    │
                         ┌──────────▼──────────┐
                         │       FastAPI       │
                         │       Backend       │
                         └──────┬──────┬────────┘
                                │      │
                 ┌──────────────┘      └──────────────┐
                 │                                    │
        ┌────────▼────────┐                 ┌─────────▼─────────┐
        │  SQLite         │                 │   Market Data     │
        │  Database       │                 │ Yahoo Finance /   │
        │                 │                 │ Demo Fallback     │
        └────────┬────────┘                 └─────────┬─────────┘
                 │                                    │
                 └────────────────┬───────────────────┘
                                  │
                         ┌────────▼─────────┐
                         │  Change Engine   │
                         │ Attention Score  │
                         └──────────────────┘
Main Components

React Frontend

Responsible for:

Dashboard UI
Watchlist management
Stock cards
Attention categories
Stock detail popup
Market status display

FastAPI Backend

Responsible for:

REST API endpoints
Watchlist operations
Stock management
Market data retrieval
Snapshot comparison
Change analysis

SQLite Database

Stores:

Watchlists
Watched stocks
Previous stock snapshots

Market Data Layer

Retrieves market information from Yahoo Finance when available and provides demo data as a fallback.

Change Engine

Compares the current state with the previous snapshot and calculates:

Price movement
Volume-based signals
Attention score
Attention level
Reasons for the score
Why a Modular Monolith?

PulseWatch intentionally uses a modular monolith instead of multiple microservices.

For this application size, microservices would introduce unnecessary operational complexity.

The current architecture keeps deployment and development simple while maintaining clear separation between:

API logic
Database models
Market data
Change detection
Market status

These modules can be evolved independently if the application grows.

Technology Stack
Frontend
React
Vite
JavaScript
CSS
Lucide React
Backend
Python
FastAPI
SQLAlchemy
Pydantic
Uvicorn
Database
SQLite
Market Data
Yahoo Finance through yfinance
Demo-data fallback
Project Structure
pulsewatch/
│
├── backend/
│   ├── change_engine.py
│   ├── database.py
│   ├── main.py
│   ├── market_data.py
│   ├── market_status.py
│   ├── models.py
│   ├── schemas.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
How to Run
Prerequisites

Install:

Python 3.10 or later
Node.js 18 or later
npm
1. Clone the Repository
git clone https://github.com/Chinthiya/pulsewatch
cd pulsewatch
2. Start the Backend

Open a terminal in the project folder:

cd backend

Create a Python virtual environment:

Windows
python -m venv venv

Activate it:

venv\Scripts\activate

Install the backend dependencies:

pip install -r requirements.txt

Start the FastAPI server:

uvicorn main:app --reload

The backend will run at:

http://127.0.0.1:8000

FastAPI interactive API documentation:

http://127.0.0.1:8000/docs

The SQLite database is created automatically when the backend starts.

3. Start the Frontend

Open a second terminal.

From the project root:

cd frontend

Install frontend dependencies:

npm install

Start the Vite development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173

Open the displayed address in a browser.

How to Explore PulseWatch

For the best demonstration:

Step 1 — Create a Watchlist

Open PulseWatch and create a watchlist.

Example:

My Watchlist
Step 2 — Add Stocks

Add stocks such as:

TCS
INFY
RELIANCE
Step 3 — Establish the Baseline

The first market check creates a snapshot of each stock.

Since there is no previous check, stocks are not incorrectly flagged as changed.

Step 4 — Refresh

Refresh the market data.

PulseWatch compares the new market state with the stored snapshot.

Step 5 — Check the Dashboard

Look at:

Need Attention
Changed
Stable

The stocks are automatically organized based on their attention scores.

Step 6 — Open a Stock

Click a stock card to view:

Current Price
Attention Score
Since Last Check
Reasons
Today's Change
Volume

This is the main PulseWatch experience.

API Endpoints
Method	Endpoint	                         Purpose
GET	    /	                                API health check
GET	    /market-status	                    Get current market status
POST	/watchlists	                        Create a watchlist
GET	    /watchlists	                        Get watchlists and stocks
POST	/watchlists/{id}/stocks	            Add a stock
DELETE	/watchlists/{id}/stocks/{symbol}	Remove a stock
GET	    /watchlists/{id}/market	            Get market data and change analysis
Why Rule-Based Detection?

PulseWatch intentionally uses a deterministic rule-based system instead of machine learning in the current version.

The goal is to detect and explain meaningful changes, not predict future stock prices.

A rule-based approach provides:

Explainability
Predictable behaviour
Easy testing
Easy debugging
Transparent scoring
No training-data dependency

For example:

Significant price movement
        +
Unusually high volume
        =
70 Attention Score

The user can understand exactly why the system highlighted a stock.

A future version could use larger historical datasets and personalized thresholds while maintaining explainability.

Design Principles
Simple

The dashboard focuses on meaningful changes instead of overwhelming users with unnecessary indicators.

Responsible

PulseWatch detects market changes but does not provide trading recommendations or claim to predict stock prices.

Delightful

The Since You Last Checked experience gives users immediate context when they return to the application.

Scalability Considerations

The current version is intentionally optimized for simplicity and hackathon-scale usage.

For a larger production deployment, the architecture could evolve to include:

PostgreSQL instead of SQLite
Batch market-data requests
Caching
Background data updates
Pagination for large watchlists
User-specific thresholds
Historical volume baselines
Real-time market-data streaming

The change engine itself can remain a separate logical module while the infrastructure around it scales.

Future Improvements

Possible future extensions include:

User accounts
Cross-device watchlist synchronization
Historical change timelines
Personalized attention thresholds
Better historical volume baselines
Real-time market data streaming
Background market-data updates
Notifications for high-priority changes
More advanced anomaly detection
Pagination and caching for large watchlists
Product Philosophy

PulseWatch is built around one simple idea:

A watchlist should not only tell you what is happening now. It should tell you what you missed.

Disclaimer

PulseWatch is a software project created for demonstration and educational purposes.

Market data may be delayed, simulated, or subject to third-party data-provider limitations.

PulseWatch does not provide financial advice, investment recommendations, or trading instructions