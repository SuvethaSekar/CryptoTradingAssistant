import { useState, useEffect } from "react";
import styles from "../Styles/CoinGraph.module.css";

const CoinGraph = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [coin, setCoin] = useState("BTCUSDT");  // Default coin is BTCUSDT
  const [coinName, setCoinName] = useState("Bitcoin"); // Default name is Bitcoin
  const [showChart, setShowChart] = useState(true);  // Default to showing the chart

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value.toUpperCase());
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      setCoin(searchTerm + "USDT");
      setCoinName(searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1));  // Capitalize the first letter
      setShowChart(true);
    }
  };

  useEffect(() => {
    // Set the default coin and its name when the component is first loaded
    setCoin("BTCUSDT");
    setCoinName("Bitcoin");
  }, []);

  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.title}>CryptoStrategy</h1>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search Coin (e.g., BTC, ETH)"
          className={styles.searchInput}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
        />
        <button
          className={styles.searchButton}
          onClick={() => {
            setCoin(searchTerm + "USDT");
            setCoinName(searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1));
            setShowChart(true);
          }}
        >
          Search
        </button>
      </div>

      {showChart && (
        <div className={styles.chartContainer}>
          <h2 className={styles.coinName}>{coinName} Graph</h2> {/* Display coin name above graph */}
          <iframe
            title="TradingView"
            src={`https://www.tradingview.com/widgetembed/?symbol=BINANCE:${coin}&interval=1D&theme=dark`}
            width="100%"
            height="400"
            style={{ maxHeight: '500px', overflow: 'hidden' }}
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
};

export default CoinGraph;
