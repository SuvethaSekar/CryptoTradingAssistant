import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import styles from "../Styles/Histogram.module.css";

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#111",
        color: "#0ff",
        padding: "5px 10px",
        border: "1px solid #333",
        borderRadius: "5px",
        fontSize: "12px",
        opacity: 0.85
      }}>
        <strong>{label}</strong><br />
        Vol: {Number(payload[0].value).toLocaleString()}
      </div>
    );
  }
  return null;
};

const Histogram = () => {
  const [coinList, setCoinList] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [volumeData, setVolumeData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCoinsAndDefaultVolume = async () => {
      try {
        const res = await axios.get("https://api.binance.com/api/v3/exchangeInfo");
        const symbols = res.data.symbols
          .filter((s) => s.quoteAsset === "USDT")
          .map((s) => s.symbol);
        setCoinList(symbols);

        // Load default BTCUSDT histogram
        fetchVolumeData("BTCUSDT");
      } catch (error) {
        console.error("Error fetching coin list or BTCUSDT volume:", error.message);
      }
    };

    fetchCoinsAndDefaultVolume();
  }, []);

  const fetchVolumeData = async (symbol) => {
    setLoading(true);
    const currentYear = new Date().getFullYear();
    const startYear = 2017;
    const yearlyData = [];

    for (let year = startYear; year <= currentYear; year++) {
      const startTime = new Date(`${year}-01-01`).getTime();
      const endTime = new Date(`${year + 1}-01-01`).getTime() - 1;

      try {
        const res = await axios.get("https://api.binance.com/api/v3/klines", {
          params: {
            symbol,
            interval: "1d",
            startTime,
            endTime,
            limit: 1000,
          },
        });

        const yearlyVolume = res.data.reduce(
          (acc, day) => acc + parseFloat(day[5]),
          0
        );

        yearlyData.push({
          year: year.toString(),
          volume: parseFloat(yearlyVolume.toFixed(2)),
        });
      } catch (error) {
        console.error(`Error fetching data for year ${year}:`, error.message);
      }
    }

    setVolumeData(yearlyData);
    setLoading(false);
  };

  const handleSearch = () => {
    if (selectedSymbol) {
      fetchVolumeData(selectedSymbol);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>📊 Crypto Yearly Trading Volume</h2>

      <div className={styles.searchContainer}>
        <input
          list="coins"
          placeholder="Search Coin (e.g., BTCUSDT)"
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
          className={styles.searchInput}
        />
        <datalist id="coins">
          {coinList.map((coin) => (
            <option key={coin} value={coin} />
          ))}
        </datalist>
        <button onClick={handleSearch} className={styles.searchButton}>
          Search
        </button>
      </div>

      {loading ? (
        <p className={styles.loadingText}>Loading volume data...</p>
      ) : (
        volumeData.length > 0 && (
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={400}>
  <BarChart data={volumeData}>
    {/* Removed background grid */}
    <XAxis dataKey="year" />
    <YAxis
      tickFormatter={(value) => `${(value / 1_000_000_000).toFixed(1)}B`}
    />
    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
    <Bar
      dataKey="volume"
      fill="#00eaff"
      barSize={40}
      isAnimationActive={true}
    />
  </BarChart>
</ResponsiveContainer>

          </div>
        )
      )}
    </div>
  );
};

export default Histogram;
