import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../Styles/trends.module.css';

const Trends = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [binanceSymbols, setBinanceSymbols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayedCoins, setDisplayedCoins] = useState(16);
  const [maxLimitReached, setMaxLimitReached] = useState(false);

  const fetchCoinGeckoData = () => {
    axios
      .get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 250,
          page: 1,
          sparkline: false,
        },
      })
      .then((response) => {
        const filtered = response.data.filter(
          (coin) =>
            coin.id !== 'staked-ether' &&
            coin.id !== 'wrapped-bitcoin' &&
            coin.id !== 'leo-token' &&
            coin.id !== 'wrapped-steth'
        );
        setCryptoData(filtered);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching CoinGecko data:', error);
        setLoading(false);
      });
  };

  const fetchBinanceSymbols = () => {
    axios
      .get('https://api.binance.com/api/v3/exchangeInfo')
      .then((response) => {
        const usdtPairs = response.data.symbols
          .filter((item) => item.quoteAsset === 'USDT')
          .map((item) => item.symbol);
        setBinanceSymbols(usdtPairs);
      })
      .catch((error) => {
        console.error('Error fetching Binance symbols:', error);
      });
  };

  useEffect(() => {
    fetchCoinGeckoData();
    fetchBinanceSymbols();
    const interval = setInterval(() => {
      fetchCoinGeckoData();
      fetchBinanceSymbols();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const requiredCoins = [
    'bitcoin',
    'ethereum',
    'memefi',
    'dogecoin',
    'sui',
    'solana',
    'cardano',
    'polkadot',
    'ftx-token',
    'maga',
    'chainlink',
  ];

  const getGroupedCoins = () => {
    const required = cryptoData.filter((coin) =>
      requiredCoins.includes(coin.id)
    );
    const rest = cryptoData.filter(
      (coin) => !requiredCoins.includes(coin.id)
    );
    const allCoins = [...required, ...rest.slice(0, 16 - required.length)];
    const grouped = [];
    for (let i = 0; i < 4; i++) {
      grouped.push(allCoins.slice(i * 4, i * 4 + 4));
    }
    return grouped;
  };

  const handleCoinClick = (coin) => {
    const symbol = coin.symbol.toUpperCase();

    // Directly search for Binance symbol
    const binanceSymbol = binanceSymbols.find(
      (s) =>
        s.startsWith(symbol) && s.endsWith('USDT') && s.length === symbol.length + 4
    );

    if (binanceSymbol) {
      const url = `https://www.binance.com/en/trade/${binanceSymbol}`;
      window.open(url, '_blank');
    } else {
      // If no direct pair found, search on Binance
      const searchUrl = `https://www.binance.com/en/search?query=${coin.name}`;
      window.open(searchUrl, '_blank');
    }
  };

  const handleShowMore = () => {
    setDisplayedCoins((prev) => prev + 16);
  };

  const handleShowLess = () => {
    setDisplayedCoins(16);
  };

  useEffect(() => {
    setMaxLimitReached(displayedCoins >= cryptoData.length);
  }, [displayedCoins, cryptoData.length]);

  const groupedCoins = getGroupedCoins();

  return (
    <div className={styles.cryptoContainer}>
      <h1 className={styles.cryptoTitle}>Trends</h1>

      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : (
        <>
          <div className={styles.row}>
            {groupedCoins.map((group, index) => (
              <div key={index} className={styles.column}>
                <div className={styles.headerRow}>
                  <span>Coin</span>
                  <span>Price</span>
                  <span>Change</span>
                </div>
                {group.map((coin) => (
                  <div
                    key={coin.id}
                    className={styles.cryptoItem}
                    onClick={() => handleCoinClick(coin)}
                  >
                    <span className={styles.coinName}>
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className={styles.coinLogo}
                      />
                      {coin.name}
                    </span>
                    <span className={styles.coinPrice}>
                      ${coin.current_price.toFixed(2)}
                    </span>
                    <span
                      className={`${styles.coinChange} ${
                        coin.price_change_percentage_24h >= 0
                          ? styles.positive
                          : styles.negative
                      }`}
                    >
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className={styles.allCoins}>
            <h2 className={styles.sectionTitle}>All Coins</h2>
            <div className={styles.allCoinsContainer}>
              {cryptoData.slice(0, displayedCoins).map((coin) => (
                <div
                  key={coin.id}
                  className={`${styles.cryptoItem} ${
                    coin.price_change_percentage_24h >= 0
                      ? styles.positiveRow
                      : styles.negativeRow
                  }`}
                  onClick={() => handleCoinClick(coin)}
                >
                  <span className={styles.coinName}>
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className={styles.coinLogo}
                    />
                    {coin.name}
                  </span>
                  <span className={styles.coinPrice}>
                    ${coin.current_price.toFixed(2)}
                  </span>
                  <span
                    className={`${styles.coinChange} ${
                      coin.price_change_percentage_24h >= 0
                        ? styles.positive
                        : styles.negative
                    }`}
                  >
                    {coin.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.buttonWrapper}>
              {!maxLimitReached && (
                <button
                  className={styles.toggleButton}
                  onClick={handleShowMore}
                >
                  Show More
                </button>
              )}
              {displayedCoins > 16 && (
                <button
                  className={styles.toggleButton}
                  onClick={handleShowLess}
                >
                  Show Less
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Trends;
