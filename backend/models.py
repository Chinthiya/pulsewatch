from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    stocks = relationship(
        "WatchlistStock",
        back_populates="watchlist",
        cascade="all, delete-orphan"
    )


class WatchlistStock(Base):
    __tablename__ = "watchlist_stocks"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, nullable=False)
    exchange = Column(String, default="NSE")

    watchlist_id = Column(
        Integer,
        ForeignKey("watchlists.id")
    )

    watchlist = relationship(
        "Watchlist",
        back_populates="stocks"
    )


class Snapshot(Base):
    __tablename__ = "snapshots"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, nullable=False)

    price = Column(Float)
    volume = Column(Float)

    timestamp = Column(
        DateTime,
        default=datetime.utcnow
    )