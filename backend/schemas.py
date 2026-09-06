from pydantic import BaseModel


class WatchlistCreate(BaseModel):
    name: str


class StockCreate(BaseModel):
    symbol: str
    exchange: str = "NSE"