import { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  ChevronRight,
  Clock,
  Plus,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  Minus,
  X
} from "lucide-react";

import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [stocks, setStocks] = useState([]);
  const [watchlistName, setWatchlistName] = useState("My Watchlist");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [marketStatus, setMarketStatus] = useState({
  status: "CLOSED",
  label: "Market closed"
  });

  const [showAddStock, setShowAddStock] = useState(false);
  const [symbolInput, setSymbolInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [addStockError, setAddStockError] = useState("");

  async function loadMarketData() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/watchlists/1/market`
      );

      if (!response.ok) {
        throw new Error("Failed to load market data");
      }

      const data = await response.json();

      setStocks(data.stocks);
      setWatchlistName(data.watchlist);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(
        "Failed to load market data:",
        error
      );

      setError(
        "Unable to load market data. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  }

  function openAddStockModal() {
    setShowAddStock(true);
    setSymbolInput("");
    setAddStockError("");
    setError("");
  }

  function closeAddStockModal() {
    setShowAddStock(false);
    setSymbolInput("");
    setAddStockError("");
  }

  async function addStock() {
    const symbol = symbolInput.trim().toUpperCase();

    if (!symbol) {
      setAddStockError(
        "Please enter a stock symbol."
      );
      return;
    }

    const alreadyExists = stocks.some(
      (stock) =>
        stock.symbol.toUpperCase() === symbol
    );

    if (alreadyExists) {
      setAddStockError(
        `${symbol} is already in your watchlist.`
      );
      return;
    }

    try {
      setActionLoading(true);
      setAddStockError("");

      const response = await fetch(
        `${API_URL}/watchlists/1/stocks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            symbol: symbol,
            exchange: "NSE"
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAddStockError(
          data.detail || "Failed to add stock."
        );
        return;
      }

      closeAddStockModal();

      await loadMarketData();
    } catch (error) {
      console.error(
        "Failed to add stock:",
        error
      );

      setAddStockError(
        "Unable to add stock. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function removeStock(symbol) {
    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/watchlists/1/stocks/${encodeURIComponent(
          symbol
        )}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to remove stock"
        );
      }

      await loadMarketData();
    } catch (error) {
      console.error(
        "Failed to remove stock:",
        error
      );

      setError(
        error.message || "Failed to remove stock."
      );
    } finally {
      setActionLoading(false);
    }
  }

  function handleAddStockKeyDown(event) {
    if (event.key === "Enter") {
      addStock();
    }

    if (event.key === "Escape") {
      closeAddStockModal();
    }
  }
  
  async function loadMarketStatus() {
    try {
      const response = await fetch(
        `${API_URL}/market-status`
      );

      if (!response.ok) {
        throw new Error("Failed to load market status");
      }

      const data = await response.json();

      setMarketStatus(data);
    } catch (error) {
      console.error(
        "Failed to load market status:",
        error
      );
    }
  }

  useEffect(() => {
    loadMarketData();
    loadMarketStatus();
  }, []);

  const attentionStocks = stocks.filter(
    (stock) => stock.attention === "HIGH"
  );

  const changedStocks = stocks.filter(
    (stock) => stock.attention === "MEDIUM"
  );

  const stableStocks = stocks.filter(
    (stock) => stock.attention === "LOW"
  );

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="logo">

          <div className="logo-icon">
            <Activity size={21} />
          </div>

          <span>PulseWatch</span>

        </div>

        <nav>

          <div className="nav-item active">
            <Activity size={18} />
            Market Watch
          </div>

          <div className="nav-item">
            <Bell size={18} />
            Alerts
          </div>

        </nav>

        <div className="sidebar-bottom">

          <div className="market-status">
            <span
              className={`status-dot ${
                marketStatus.status === "OPEN"
                  ? "open"
                  : ""
              }`}
            ></span>

            {marketStatus.label}
          </div>

        </div>

      </aside>


      {/* MAIN */}

      <main className="main">

        <header className="topbar">

          <div>

            <div className="breadcrumb">
              MARKET WATCH
            </div>

            <h1>{watchlistName}</h1>

            <p className="subtitle">
              Here's what changed since you last checked.
            </p>

          </div>

          <div className="topbar-actions">

            <button
              className="add-stock-button"
              onClick={openAddStockModal}
            >
              <Plus size={17} />
              Add Stock
            </button>

            <button
              className="refresh-button"
              onClick={loadMarketData}
              disabled={loading}
            >
              <RefreshCw
                size={17}
                className={loading ? "spin" : ""}
              />
              Refresh
            </button>

          </div>

        </header>


        {/* ADD STOCK MODAL */}

        {showAddStock && (

          <div
            className="modal-overlay"
            onClick={closeAddStockModal}
          >

            <div
              className="add-stock-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="modal-header">

                <div>

                  <h2>Add stock</h2>

                  <p>
                    Add an NSE stock to your watchlist.
                  </p>

                </div>

                <button
                  className="close-button"
                  onClick={closeAddStockModal}
                >
                  <X size={19} />
                </button>

              </div>


              <div className="search-input-wrapper">

                <Search size={18} />

                <input
                  autoFocus
                  type="text"
                  placeholder="Enter symbol e.g. HDFCBANK"
                  value={symbolInput}
                  onChange={(event) => {
                    setSymbolInput(
                      event.target.value.toUpperCase()
                    );
                    setAddStockError("");
                  }}
                  onKeyDown={handleAddStockKeyDown}
                />

              </div>


              {addStockError && (

                <div className="modal-error">

                  <span>
                    {addStockError}
                  </span>

                  <button
                    onClick={() =>
                      setAddStockError("")
                    }
                  >
                    <X size={15} />
                  </button>

                </div>

              )}


              <button
                className="modal-add-button"
                onClick={addStock}
                disabled={actionLoading}
              >

                {actionLoading ? (
                  <>
                    <RefreshCw
                      size={16}
                      className="spin"
                    />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Add to Watchlist
                  </>
                )}

              </button>

            </div>

          </div>

        )}


        {/* GENERAL ERROR */}

        {error && (

          <div className="error-message">

            <span>{error}</span>

            <button
              onClick={() => setError("")}
            >
              <X size={16} />
            </button>

          </div>

        )}


        {/* LAST CHECKED */}

        <div className="last-checked">

          <Clock size={16} />

          <span>
            Last checked{" "}
            {lastUpdated
              ? lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : "—"}
          </span>

          <span className="separator">
            •
          </span>

          <span>
            Demo market data
          </span>

        </div>


        {/* SUMMARY */}

        <section className="summary-grid">

          <div className="summary-card">

            <span>
              Stocks tracked
            </span>

            <strong>
              {stocks.length}
            </strong>

          </div>


          <div className="summary-card attention-summary">

            <span>
              Need attention
            </span>

            <strong>
              {attentionStocks.length}
            </strong>

          </div>


          <div className="summary-card">

            <span>
              Changed
            </span>

            <strong>
              {changedStocks.length}
            </strong>

          </div>


          <div className="summary-card">

            <span>
              Stable
            </span>

            <strong>
              {stableStocks.length}
            </strong>

          </div>

        </section>


        {/* CONTENT */}

        {loading ? (

          <div className="loading">

            <RefreshCw
              className="spin"
              size={24}
            />

            Loading market data...

          </div>

        ) : (

          <>

            {/* ATTENTION */}

            {attentionStocks.length > 0 && (

              <section className="section">

                <div className="section-title">

                  <div>

                    <h2>
                      Needs Attention
                    </h2>

                    <p>
                      Significant changes worth checking now.
                    </p>

                  </div>

                </div>

                <div className="stock-grid">

                  {attentionStocks.map((stock) => (

                    <StockCard
                      key={stock.symbol}
                      stock={stock}
                      onRemove={removeStock}
                      actionLoading={actionLoading}
                      onSelect={setSelectedStock}
                    />

                  ))}

                </div>

              </section>

            )}


            {/* CHANGED */}

            {changedStocks.length > 0 && (

              <section className="section">

                <div className="section-title">

                  <div>

                    <h2>
                      Changed Since You Last Checked
                    </h2>

                    <p>
                      These stocks have meaningful movement.
                    </p>

                  </div>

                </div>

                <div className="stock-grid">

                  {changedStocks.map((stock) => (

                    <StockCard
                      key={stock.symbol}
                      stock={stock}
                      onRemove={removeStock}
                      actionLoading={actionLoading}
                      onSelect={setSelectedStock}
                    />

                  ))}

                </div>

              </section>

            )}


            {/* STABLE */}

            {stableStocks.length > 0 && (

              <section className="section">

                <div className="section-title">

                  <div>

                    <h2>
                      Stable
                    </h2>

                    <p>
                      Nothing significant has changed.
                    </p>

                  </div>

                </div>

                <div className="stock-grid">

                  {stableStocks.map((stock) => (

                    <StockCard
                      key={stock.symbol}
                      stock={stock}
                      onRemove={removeStock}
                      actionLoading={actionLoading}
                      onSelect={setSelectedStock}
                    />

                  ))}

                </div>

              </section>

            )}


            {/* EMPTY WATCHLIST */}

            {stocks.length === 0 && (

              <div className="empty-state">

                <div className="empty-icon">
                  <Search size={24} />
                </div>

                <h2>
                  Your watchlist is empty
                </h2>

                <p>
                  Add a stock to start tracking
                  meaningful market changes.
                </p>

                <button
                  className="add-stock-button"
                  onClick={openAddStockModal}
                >
                  <Plus size={17} />
                  Add your first stock
                </button>

              </div>

            )}

          </>

        )}
        {selectedStock && (
          <StockDetailModal
            stock={selectedStock}
            onClose={() => setSelectedStock(null)}
          />
        )}
      </main>

    </div>
  );
}


function StockCard({
  stock,
  onRemove,
  actionLoading,
  onSelect
}) {

  const isUp = stock.direction === "UP";
  const isDown = stock.direction === "DOWN";
  const isFlat = stock.direction === "FLAT";

  const sinceLastCheck = Number(
    stock.change_since_last_check || 0
  );

  const sinceLastCheckPercent = Number(
    stock.change_since_last_check_percent || 0
  );

  const hasPreviousCheck =
    stock.previous_price !== null &&
    stock.previous_price !== undefined;


  return (

    <div
      className="stock-card"
      onClick={() => onSelect(stock)}
    >

      {/* CARD HEADER */}

      <div className="stock-header">

        <div>

          <h3>
            {stock.symbol}
          </h3>

          <span className="exchange">
            NSE • {stock.source}
          </span>

        </div>


        <div className="stock-header-actions">

          <div
            className={`direction ${
              isUp
                ? "up"
                : isDown
                ? "down"
                : "flat"
            }`}
          >

            {isUp ? (
              <TrendingUp size={17} />
            ) : isDown ? (
              <TrendingDown size={17} />
            ) : (
              <Minus size={17} />
            )}

          </div>


          <button
            className="remove-button"
            title={`Remove ${stock.symbol}`}
            onClick={(event) => {
              event.stopPropagation();
              onRemove(stock.symbol);
            }}
            disabled={actionLoading}
          >
            <X size={15} />
          </button>

        </div>

      </div>


      {/* PRICE */}

      <div className="price-row">

        <div>

          <div className="price">
            ₹{Number(stock.price).toLocaleString(
              "en-IN"
            )}
          </div>

          <div
            className={`change ${
              Number(stock.change_percent) > 0
                ? "up-text"
                : Number(stock.change_percent) < 0
                ? "down-text"
                : "flat-text"
            }`}
          >

            {Number(stock.change_percent) > 0
              ? "+"
              : ""}

            {stock.change_percent}%
            <span className="change-label">
              {" "}today
            </span>

          </div>

        </div>


        {/* ATTENTION SCORE */}

        <div className="score">

          <div className="score-number">
            {stock.score}
          </div>

          <div className="score-label">
            ATTENTION
          </div>

        </div>

      </div>


      {/* SINCE LAST CHECK */}

      <div
        className={`since-check ${
          hasPreviousCheck
            ? ""
            : "first-check"
        }`}
      >

        <div className="since-check-label">
          Since last check
        </div>

        {hasPreviousCheck ? (

          <div className="since-check-value">

            <span
              className={
                sinceLastCheck > 0
                  ? "up-text"
                  : sinceLastCheck < 0
                  ? "down-text"
                  : "flat-text"
              }
            >

              {sinceLastCheck > 0
                ? "+"
                : ""}

              ₹
              {Math.abs(
                sinceLastCheck
              ).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}

            </span>


            <span
              className={
                sinceLastCheckPercent > 0
                  ? "up-text"
                  : sinceLastCheckPercent < 0
                  ? "down-text"
                  : "flat-text"
              }
            >

              (
              {sinceLastCheckPercent > 0
                ? "+"
                : ""}

              {sinceLastCheckPercent.toFixed(2)}
              %)

            </span>

          </div>

        ) : (

          <div className="first-check-text">
            Baseline saved
          </div>

        )}

      </div>


      {/* REASONS */}

      <div className="reasons">

        {stock.reasons.length > 0 ? (

          stock.reasons.map((reason) => (

            <div
              className="reason"
              key={reason}
            >

              <span className="reason-dot"></span>

              {reason}

            </div>

          ))

        ) : (

          <div className="reason stable-reason">

            {hasPreviousCheck
              ? "No significant movement detected"
              : "Baseline saved for future comparison"}

          </div>

        )}

      </div>


      {/* FOOTER */}

      <div className="card-footer">

        <span>
          Volume{" "}
          {Number(stock.volume).toLocaleString(
            "en-IN"
          )}
        </span>

        <ChevronRight size={16} />

      </div>

    </div>

  );
}

function StockDetailModal({ stock, onClose }) {
  const hasPreviousCheck =
    stock.previous_price !== null &&
    stock.previous_price !== undefined;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="stock-detail-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>{stock.symbol}</h2>
            <p>NSE • {stock.source}</p>
          </div>

          <button
            className="close-button"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>

        <div className="detail-price">
          ₹{Number(stock.price).toLocaleString("en-IN")}
        </div>

        <div className="detail-section">
          <div className="detail-label">
            WHY YOU'RE SEEING THIS
          </div>

          <div className="detail-score">
            <strong>{stock.score}</strong>
            <span>Attention score</span>
          </div>

          {hasPreviousCheck && (
            <div className="detail-change">
              Since last check:{" "}
              <strong>
                {stock.change_since_last_check > 0
                  ? "+"
                  : ""}
                ₹
                {Math.abs(
                  stock.change_since_last_check
                ).toFixed(2)}
                {" ("}
                {stock.change_since_last_check_percent > 0
                  ? "+"
                  : ""}
                {stock.change_since_last_check_percent.toFixed(2)}
                {"%)"}
              </strong>
            </div>
          )}

          <div className="detail-reasons">
            {stock.reasons.length > 0 ? (
              stock.reasons.map((reason) => (
                <div
                  className="detail-reason"
                  key={reason}
                >
                  <span className="reason-dot"></span>
                  {reason}
                </div>
              ))
            ) : (
              <div className="detail-reason stable-reason">
                No significant movement detected.
              </div>
            )}
          </div>
        </div>

        <div className="detail-stats">
          <div>
            <span>Today's change</span>
            <strong>
              {stock.change_percent > 0 ? "+" : ""}
              {stock.change_percent}%
            </strong>
          </div>

          <div>
            <span>Volume</span>
            <strong>
              {Number(stock.volume).toLocaleString("en-IN")}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;