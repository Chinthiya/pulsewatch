from fastapi import FastAPI, Depends, HTTPException
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import Watchlist, WatchlistStock, Snapshot
from schemas import WatchlistCreate, StockCreate
from market_data import get_stock_data
from change_engine import calculate_change_score
from market_status import get_market_status


Base.metadata.create_all(bind=engine)

app = FastAPI(title="PulseWatch API")


# -----------------------------
# CORS
# -----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# ROOT
# -----------------------------

@app.get("/")
def root():
    return {
        "message": "PulseWatch API is running"
    }


# -----------------------------
# CREATE WATCHLIST
# -----------------------------

@app.post("/watchlists")
def create_watchlist(
    watchlist: WatchlistCreate,
    db: Session = Depends(get_db)
):
    new_watchlist = Watchlist(
        name=watchlist.name
    )

    db.add(new_watchlist)
    db.commit()
    db.refresh(new_watchlist)

    return {
        "id": new_watchlist.id,
        "name": new_watchlist.name
    }


# -----------------------------
# GET WATCHLISTS
# -----------------------------

@app.get("/watchlists")
def get_watchlists(
    db: Session = Depends(get_db)
):
    watchlists = db.query(Watchlist).all()

    return [
        {
            "id": watchlist.id,
            "name": watchlist.name,
            "stocks": [
                {
                    "symbol": stock.symbol,
                    "exchange": stock.exchange
                }
                for stock in watchlist.stocks
            ]
        }
        for watchlist in watchlists
    ]


# -----------------------------
# ADD STOCK
# -----------------------------

@app.post("/watchlists/{watchlist_id}/stocks")
def add_stock(
    watchlist_id: int,
    stock: StockCreate,
    db: Session = Depends(get_db)
):
    watchlist = db.query(Watchlist).filter(
        Watchlist.id == watchlist_id
    ).first()

    if not watchlist:
        raise HTTPException(
            status_code=404,
            detail="Watchlist not found"
        )

    symbol = stock.symbol.strip().upper()

    existing_stock = db.query(WatchlistStock).filter(
        WatchlistStock.watchlist_id == watchlist_id,
        WatchlistStock.symbol == symbol
    ).first()

    if existing_stock:
        raise HTTPException(
            status_code=400,
            detail=f"{symbol} is already in your watchlist."
        )

    new_stock = WatchlistStock(
        symbol=symbol,
        exchange=stock.exchange.upper(),
        watchlist_id=watchlist_id
    )

    db.add(new_stock)
    db.commit()
    db.refresh(new_stock)

    return {
        "message": "Stock added successfully",
        "symbol": new_stock.symbol,
        "exchange": new_stock.exchange
    }


# -----------------------------
# REMOVE STOCK
# -----------------------------

@app.delete("/watchlists/{watchlist_id}/stocks/{symbol}")
def remove_stock(
    watchlist_id: int,
    symbol: str,
    db: Session = Depends(get_db)
):
    symbol = symbol.upper()

    stock = db.query(WatchlistStock).filter(
        WatchlistStock.watchlist_id == watchlist_id,
        WatchlistStock.symbol == symbol
    ).first()

    if not stock:
        raise HTTPException(
            status_code=404,
            detail=f"{symbol} is not in your watchlist."
        )

    db.delete(stock)

    # Remove old snapshot too
    snapshot = db.query(Snapshot).filter(
        Snapshot.symbol == symbol
    ).order_by(
        Snapshot.timestamp.desc()
    ).first()

    if snapshot:
        db.delete(snapshot)

    db.commit()

    return {
        "message": f"{symbol} removed successfully"
    }


# -----------------------------
# MARKET DATA
# -----------------------------

@app.get("/watchlists/{watchlist_id}/market")
def get_market_data(
    watchlist_id: int,
    db: Session = Depends(get_db)
):
    watchlist = db.query(Watchlist).filter(
        Watchlist.id == watchlist_id
    ).first()

    if not watchlist:
        raise HTTPException(
            status_code=404,
            detail="Watchlist not found"
        )

    results = []

    for stock in watchlist.stocks:

        # Get current market data
        data = get_stock_data(stock.symbol)

        current_price = data["price"]

        # Find previous user snapshot
        previous_snapshot = db.query(Snapshot).filter(
            Snapshot.symbol == stock.symbol
        ).order_by(
            Snapshot.timestamp.desc()
        ).first()

        is_first_check = previous_snapshot is None

        if previous_snapshot:
            previous_price = previous_snapshot.price

            if previous_price and previous_price != 0:
                change_since_last_check = (
                    current_price - previous_price
                )

                change_since_last_check_percent = (
                    change_since_last_check
                    / previous_price
                ) * 100
            else:
                change_since_last_check = 0
                change_since_last_check_percent = 0

            last_checked_at = previous_snapshot.timestamp

        else:
            previous_price = None
            change_since_last_check = 0
            change_since_last_check_percent = 0
            last_checked_at = None

        # Score based on movement since last check
        if is_first_check:
            analysis = {
                "score": 0,
                "attention": "LOW",
                "direction": "FLAT",
                "reasons": []
            }
        else:
            analysis = calculate_change_score(
                change_since_last_check_percent,
                data["volume"]
            )

        # Save current state as the new snapshot
        if previous_snapshot:
            previous_snapshot.price = current_price
            previous_snapshot.volume = data["volume"]
            previous_snapshot.timestamp = datetime.utcnow()
        else:
            new_snapshot = Snapshot(
                symbol=stock.symbol,
                price=current_price,
                volume=data["volume"]
            )

            db.add(new_snapshot)

        results.append({
            **data,

            "previous_price": (
                round(previous_price, 2)
                if previous_price is not None
                else None
            ),

            "change_since_last_check": round(
                change_since_last_check,
                2
            ),

            "change_since_last_check_percent": round(
                change_since_last_check_percent,
                2
            ),

            "last_checked_at": (
                str(last_checked_at)
                if last_checked_at
                else None
            ),

            "is_first_check": is_first_check,

            **analysis
        })

    db.commit()

    return {
        "watchlist": watchlist.name,
        "stocks": results
    }
    
@app.get("/market-status")
def market_status():
    return get_market_status()