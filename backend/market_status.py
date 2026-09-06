from datetime import datetime, time
from zoneinfo import ZoneInfo


IST = ZoneInfo("Asia/Kolkata")


def get_market_status():
    now = datetime.now(IST)

    # Saturday = 5, Sunday = 6
    if now.weekday() >= 5:
        return {
            "status": "CLOSED",
            "label": "Market closed",
            "reason": "Weekend"
        }

    market_open = time(9, 15)
    market_close = time(15, 30)

    if now.time() < market_open:
        return {
            "status": "CLOSED",
            "label": "Market closed",
            "reason": "Before market open"
        }

    if now.time() > market_close:
        return {
            "status": "CLOSED",
            "label": "Market closed",
            "reason": "After market close"
        }

    return {
        "status": "OPEN",
        "label": "Market open",
        "reason": "Regular trading hours"
    }