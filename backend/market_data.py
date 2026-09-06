import random
from datetime import datetime


DEMO_DATA = {
    "TCS": {
        "base_price": 3925.50,
        "price": 3925.50,
        "base_volume": 1250000,
        "previous_close": 3890.00
    },
    "INFY": {
        "base_price": 1518.25,
        "price": 1518.25,
        "base_volume": 2100000,
        "previous_close": 1560.00
    },
    "RELIANCE": {
        "base_price": 2945.75,
        "price": 2945.75,
        "base_volume": 3500000,
        "previous_close": 2830.00
    }
}


def get_demo_data(symbol: str):
    symbol = symbol.upper()

    data = DEMO_DATA.get(symbol)

    # Generate a stable base for newly added stocks
    if not data:
        base_price = round(
            random.uniform(500, 3000),
            2
        )

        data = {
            "base_price": base_price,
            "price": base_price,
            "base_volume": random.randint(
                800000,
                4000000
            ),
            "previous_close": round(
                base_price * random.uniform(0.97, 1.03),
                2
            )
        }

        DEMO_DATA[symbol] = data

    # -----------------------------------
    # Simulate a small market movement
    # -----------------------------------

    movement_percent = random.uniform(
        -2.5,
        2.5
    )

    new_price = data["price"] * (
        1 + movement_percent / 100
    )

    # Keep demo price within a reasonable
    # range around the original base price.
    min_price = data["base_price"] * 0.92
    max_price = data["base_price"] * 1.08

    new_price = max(
        min_price,
        min(new_price, max_price)
    )

    data["price"] = round(
        new_price,
        2
    )

    # -----------------------------------
    # Simulate realistic trading volume
    # -----------------------------------

    volume_multiplier = random.uniform(
        0.8,
        3.2
    )

    volume = int(
        data["base_volume"] * volume_multiplier
    )

    # -----------------------------------
    # Calculate today's movement
    # -----------------------------------

    change = (
        data["price"]
        - data["previous_close"]
    )

    change_percent = (
        change
        / data["previous_close"]
    ) * 100

    return {
        "symbol": symbol,
        "price": data["price"],
        "volume": volume,
        "previous_close": data["previous_close"],
        "change": round(change, 2),
        "change_percent": round(change_percent, 2),
        "timestamp": datetime.now().isoformat(),
        "source": "DEMO"
    }


def get_stock_data(symbol: str):
    try:
        import yfinance as yf

        ticker = yf.Ticker(
            symbol.upper() + ".NS"
        )

        history = ticker.history(
            period="1d",
            interval="5m"
        )

        if not history.empty:
            latest = history.iloc[-1]

            price = float(
                latest["Close"]
            )

            volume = float(
                latest["Volume"]
            )

            previous_close = float(
                history.iloc[0]["Open"]
            )

            change = (
                price
                - previous_close
            )

            change_percent = (
                change
                / previous_close
            ) * 100

            return {
                "symbol": symbol.upper(),
                "price": round(price, 2),
                "volume": volume,
                "previous_close": round(
                    previous_close,
                    2
                ),
                "change": round(
                    change,
                    2
                ),
                "change_percent": round(
                    change_percent,
                    2
                ),
                "timestamp": str(
                    history.index[-1]
                ),
                "source": "YAHOO"
            }

    except Exception:
        pass

    return get_demo_data(symbol)