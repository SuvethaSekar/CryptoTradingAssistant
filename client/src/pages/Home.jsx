import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import styles from "../styles/home.module.css";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#111",
          color: "#0ff",
          padding: "5px 10px",
          border: "1px solid #333",
          borderRadius: "5px",
          fontSize: "12px",
          opacity: 0.85,
        }}
      >
        <strong>{label}</strong> <br />
        Volume: {Number(payload[0].value).toLocaleString()}
      </div>
    );
  }
  return null;
};

const Home = () => {
  const [symbol, setSymbol] = useState("");
  const [searchedSymbol, setSearchedSymbol] = useState("BTCUSDT");
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [histogramData, setHistogramData] = useState([]);
  const [coinData, setCoinData] = useState([]);
  const [globalData, setGlobalData] = useState(null);
  const [error, setError] = useState(null);
  const [news, setNews] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [newsLoading, setNewsLoading] = useState(false);

  const requiredCoins = [
    "bitcoin",
    "ethereum",
    "binancecoin",
    "solana",
    "memefi",
    "hamster",
    "polkadot",
    "cardano",
    "dogecoin",
    "litecoin",
  ];

  const options = [
    { value: "", label: "Select Strategy" },
    { value: "strategy1", label: "Strategy 1" },
    { value: "strategy2", label: "Strategy 2" },
    { value: "strategy3", label: "Strategy 3" },
  ];

  const fetchVolumeData = async (coin) => {
    setLoading(true);
    const fullSymbol = coin.endsWith("USDT") ? coin : coin + "USDT";
    const currentYear = new Date().getFullYear();
    const startYear = 2017;
    const yearlyData = [];

    for (let year = startYear; year <= currentYear; year++) {
      const startTime = new Date(`${year}-01-01T00:00:00Z`).getTime();
      const endTime = new Date(`${year + 1}-01-01T00:00:00Z`).getTime() - 1;
      let allData = [];
      let nextStartTime = startTime;

      try {
        while (nextStartTime < endTime) {
          const res = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${fullSymbol}&interval=1d&startTime=${nextStartTime}&endTime=${endTime}&limit=1000`
          );
          const data = await res.json();
          if (!Array.isArray(data) || data.length === 0) break;

          allData = allData.concat(data);
          const lastTimestamp = data[data.length - 1][0];
          nextStartTime = lastTimestamp + 24 * 60 * 60 * 1000;
        }

        const yearlyVolume = allData.reduce(
          (sum, candle) => sum + parseFloat(candle[5]),
          0
        );
        yearlyData.push({
          name: year.toString(),
          volume: parseFloat(yearlyVolume.toFixed(2)),
        });
      } catch (error) {
        console.error(`Error fetching data for ${fullSymbol} in ${year}:`, error.message);
        setError(`Failed to fetch data for ${fullSymbol} in ${year}`);
      }
    }

    setHistogramData(yearlyData);
    setLoading(false);
  };

  const fetchTrendingCoins = async () => {
    try {
      const url = "https://api.coingecko.com/api/v3/coins/markets";
      const response = await axios.get(url, {
        params: {
          vs_currency: "usd",
          ids: requiredCoins.join(","),
          order: "market_cap_desc",
        },
      });
      setCoinData(response.data);
    } catch (error) {
      console.error("Error fetching trending coins:", error.message);
      setError("Failed to fetch trending coins.");
    }
  };

  const fetchGlobalMarketData = async () => {
    try {
      const res = await axios.get("https://api.coingecko.com/api/v3/global");
      setGlobalData(res.data.data);
    } catch (error) {
      console.error("Error fetching global market data:", error.message);
    }
  };

  const fetchNews = async () => {
    try {
      setNewsLoading(true);
      const response = await fetch(
        "https://api.allorigins.win/get?url=https://cointelegraph.com/rss"
      );
      const data = await response.json();

      const parser = new DOMParser();
      const xml = parser.parseFromString(data.contents, "application/xml");
      const items = xml.querySelectorAll("item");

      const newNews = Array.from(items).slice(0, 5).map((item) => {
        const fullDescription = item
          .querySelector("description")
          ?.textContent.replace(/<[^>]+>/g, "");
        return {
          title: item.querySelector("title")?.textContent,
          link: item.querySelector("link")?.textContent,
          shortDescription: fullDescription?.slice(0, 250) + "...",
          longDescription: fullDescription?.slice(0, 400) + "...",
        };
      });

      setNews(newNews);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    fetchVolumeData("BTCUSDT");
    fetchTrendingCoins();
    fetchGlobalMarketData();
    fetchNews();

    const interval = setInterval(() => {
      fetchTrendingCoins();
      fetchGlobalMarketData();
      fetchNews();
    }, 30000); // updates every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    if (symbol.trim() !== "") {
      const upperSymbol = symbol.toUpperCase();
      setLoading(true);
      setSearchedSymbol(upperSymbol + "USDT");
      fetchVolumeData(upperSymbol);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.flexRow}>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Search Coin"
          className={styles.searchBar}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
        <button onClick={handleSearch} className={styles.button}>
          Search
        </button>
        <select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className={styles.dropdown}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <div className={styles.loadingText}>Loading...</div>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.chartSection}>
        <div className={styles.chartWrapper}>
          <iframe
            title="TradingView Chart"
            src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${searchedSymbol}&interval=1D&theme=dark&style=1&timezone=Etc/UTC&withdateranges=1&hide_side_toolbar=false&allow_symbol_change=true&save_image=true&locale=en`}
            width="100%"
            height="100%"
            frameBorder="0"
            allowTransparency
            allowFullScreen
            style={{ border: "none" }}
          />
        </div>

        <div className={styles.histogramWrapper}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={histogramData}>
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis
                stroke="#fff"
                tickFormatter={(value) => `${(value / 1_000_000_000).toFixed(1)}B`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
              <Bar dataKey="volume" fill="#00eaff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {globalData && (
        <div className={styles.marketUpdateWrapper}>
          <h2 className={styles.trendsTitle}>📈 Market Overview</h2>
          <div className={styles.marketStats}>
            <div className={styles.marketStat}>
              🪙 <strong>Market Cap:</strong><br />
              ${Number(globalData.total_market_cap.usd).toLocaleString()}
            </div>
            <div className={styles.marketStat}>
              💸 <strong>24h Volume:</strong><br />
              ${Number(globalData.total_volume.usd).toLocaleString()}
            </div>
            <div className={styles.marketStat}>
              ⚡ <strong>BTC Dominance:</strong><br />
              {globalData.market_cap_percentage.btc.toFixed(2)}%
            </div>
            <div className={styles.marketStat}>
              🔥 <strong>ETH Dominance:</strong><br />
              {globalData.market_cap_percentage.eth.toFixed(2)}%
            </div>
            <div className={styles.marketStat}>
              📊 <strong>Active Coins:</strong><br />
              {globalData.active_cryptocurrencies.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <div className={styles.trendsWrapper}>
        <h2 className={styles.trendsTitle}>🔥 Trending Coins</h2>
        <div className={styles.trendsContainer}>
          {coinData.map((coin) => (
            <div key={coin.id} className={styles.trendItem}>
              <img src={coin.image} alt={coin.name} className={styles.coinLogo} />
              <div className={styles.coinInfo}>
                <span className={styles.coinName}>{coin.name}</span>
                <span className={styles.coinPrice}>${coin.current_price.toFixed(2)}</span>
                <span
                  className={`${styles.coinChange} ${
                    coin.price_change_percentage_24h >= 0 ? styles.positive : styles.negative
                  }`}
                >
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.newsContainer}>
        <h2 className={styles.newsHeading}>Latest Cryptocurrency News</h2>
        {newsLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <div className={styles.loadingText}>Loading News...</div>
          </div>
        ) : (
          <div className={styles.newsScroller}>
            {news.map((article, index) => (
              <div
                key={index}
                className={styles.newsItem}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.newsTitle}
                >
                  <h3>{article.title}</h3>
                </a>
                <p className={styles.newsDescription}>
                  {hoveredIndex === index ? article.longDescription : article.shortDescription}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
