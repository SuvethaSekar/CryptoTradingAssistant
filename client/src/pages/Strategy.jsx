import React, { useState, useEffect, useRef } from 'react';
import styles from '../Styles/Strategy.module.css';

import avatarImg from '../assets/client1.jpg';
import btcIcon from '../assets/btc.png';
import ethIcon from '../assets/eth.jpg';
import solIcon from '../assets/sol.png';
import bnbIcon from '../assets/bnb.png';
import hmstrIcon from '../assets/hmstr.jpg';

const alertSoundUrl = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';

function calculateEMA(prices, period) {
  const k = 2 / (period + 1);
  let emaArray = [];
  let sum = 0;
  for (let i = 0; i < period; i++) sum += prices[i];
  emaArray[period - 1] = sum / period;
  for (let i = period; i < prices.length; i++) {
    emaArray[i] = prices[i] * k + emaArray[i - 1] * (1 - k);
  }
  return emaArray;
}

function calculateRSI(prices) {
  const period = 14;
  if (prices.length < period + 1) return null;
  let gains = 0,
    losses = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calculateMACD(prices) {
  if (prices.length < 26) return null;
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);

  // macdLine is ema12 - ema26, starting from index 25 (since ema26 starts at 25)
  const macdLine = [];
  for (let i = 25; i < prices.length; i++) {
    macdLine.push(ema12[i] - ema26[i]);
  }

  if (macdLine.length < 9) return null; // Not enough data for signal line

  // Signal line is EMA of macdLine with period 9
  const signalLine = calculateEMA(macdLine, 9).slice(8); // slice to align with macdLine indexes

  return { macdLine, signalLine };
}

const Strategy = () => {
  const [strategySelected, setStrategySelected] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const previousSignalsRef = useRef({});
  const intervalIdRef = useRef(null);

  const coins = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'HMSTRUSDT'];

  useEffect(() => {
    if (!strategySelected) {
      // Clear alerts and previous signals & stop interval
      setAlerts([]);
      previousSignalsRef.current = {};
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      return;
    }

    // Request notification permission if needed
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    const alertSound = new Audio(alertSoundUrl);

    const fetchDataAndCheckSignals = async () => {
      try {
        // Fetch all coins in parallel
        const responses = await Promise.all(
          coins.map((coin) =>
            fetch(`https://api.binance.com/api/v3/klines?symbol=${coin}&interval=1h&limit=50`).then((res) =>
              res.json()
            )
          )
        );

        responses.forEach((data, index) => {
          const coin = coins[index];
          const closePrices = data.map((c) => parseFloat(c[4]));

          // EMA 9 and 21 for crossover
          const ema9 = calculateEMA(closePrices, 9);
          const ema21 = calculateEMA(closePrices, 21);
          const lastEma9 = ema9[ema9.length - 1];
          const prevEma9 = ema9[ema9.length - 2];
          const lastEma21 = ema21[ema21.length - 1];
          const prevEma21 = ema21[ema21.length - 2];

          const rsi = calculateRSI(closePrices);
          const macdData = calculateMACD(closePrices);

          const price = closePrices[closePrices.length - 1];

          // EMA Signal: crossover logic
          const emaSignal =
            prevEma9 < prevEma21 && lastEma9 > lastEma21
              ? 'buy'
              : prevEma9 > prevEma21 && lastEma9 < lastEma21
              ? 'sell'
              : null;

          // RSI Signal: oversold/overbought thresholds
          const rsiSignal =
            rsi !== null ? (rsi < 30 ? 'buy' : rsi > 70 ? 'sell' : null) : null;

          // MACD Signal: crossover of macdLine and signalLine
          let macdSignal = null;
          if (macdData && macdData.macdLine.length > 1 && macdData.signalLine.length > 1) {
            const macdLine = macdData.macdLine;
            const signalLine = macdData.signalLine;

            const lastMacd = macdLine[macdLine.length - 1];
            const prevMacd = macdLine[macdLine.length - 2];
            const lastSignal = signalLine[signalLine.length - 1];
            const prevSignal = signalLine[signalLine.length - 2];

            macdSignal =
              prevMacd < prevSignal && lastMacd > lastSignal
                ? 'buy'
                : prevMacd > prevSignal && lastMacd < lastSignal
                ? 'sell'
                : null;
          }

          // Collect signals
          const signals = [emaSignal, rsiSignal, macdSignal].filter(Boolean);

          // Stricter logic: all signals must agree
          let finalSignal = null;
          if (signals.length > 0) {
            const uniqueSignals = Array.from(new Set(signals));
            if (uniqueSignals.length === 1) {
              finalSignal = uniqueSignals[0];
            }
          }

          // Check for new signal and avoid duplicate alerts for same price
          if (
            finalSignal &&
            (!previousSignalsRef.current[coin] ||
              previousSignalsRef.current[coin] !== price)
          ) {
            previousSignalsRef.current[coin] = price;

            // Play alert sound (catch errors for browsers blocking autoplay)
            alertSound.play().catch(() => {});

            // Show browser notification if permitted
            if (Notification.permission === 'granted') {
              new Notification(`Alert for ${coin}`, {
                body: `${coin} is showing a ${
                  finalSignal === 'buy' ? 'Bullish (BUY)' : 'Bearish (SELL)'
                } signal.`,
              });
            }

            // Add alert to state
            const newAlert = {
              id: Date.now() + Math.random(),
              coin,
              price,
              type: finalSignal,
            };

            setAlerts((prev) => [...prev, newAlert]);
          }
        });
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    // Run immediately once
    fetchDataAndCheckSignals();

    // Set interval to run every minute
    intervalIdRef.current = setInterval(fetchDataAndCheckSignals, 60000);

    // Cleanup interval on unmount or deselect
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [strategySelected]);

  const handleSelect = () => setStrategySelected(true);
  const handleCancel = () => setStrategySelected(false);

  const handleTrade = (coin) => {
    const symbol = coin.toLowerCase();
    window.open(`https://www.binance.com/en/trade/${symbol}`, '_blank');
  };

  const closeAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Change Buddy</h2>

      <div className={styles.card}>
        <img src={avatarImg} alt="Avatar" className={styles.avatar} />
        <h3 className={styles.name}>Strategy 1</h3>

        <div className={styles.description}>
          <p>👋 Greetings.</p>
          <p>
            Let's plan a steady and smart journey to your trading goals — confidently
            and consistently.
          </p>
        </div>

        <div className={styles.infoRow}>
          <div className={styles.infoItem}>
            <span className={styles.icon}>📶</span>
            <span>Medium risk</span>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.coins}>
              <img src={btcIcon} alt="BTC" />
              <img src={ethIcon} alt="ETH" />
              <img src={solIcon} alt="SOL" />
              <img src={bnbIcon} alt="BNB" />
              <img src={hmstrIcon} alt="HMSTR" />
            </div>
            <span>Fundamentals</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.icon}>⏱️</span>
            <span>Mid-term</span>
          </div>
        </div>

        {!strategySelected && (
          <button className={styles.selectButton} onClick={handleSelect}>
            Select Strategy
          </button>
        )}

        {strategySelected && (
          <button className={styles.cancelButton} onClick={handleCancel}>
            Cancel Strategy
          </button>
        )}
      </div>

      {strategySelected && alerts.length > 0 && (
        <div className={styles.popup}>
          <button className={styles.closeButton} onClick={() => setAlerts([])}>
            &times;
          </button>
          <h3>Alerts</h3>
          {alerts.map((alert) => (
            <div key={alert.id} className={styles.alertCard}>
              <div>
                <strong>{alert.coin}</strong> —{' '}
                {alert.type === 'buy' ? 'Bullish (BUY)' : 'Bearish (SELL)'} signal
              </div>
              <div className={styles.alertActions}>
                <button
                  className={alert.type === 'buy' ? styles.buyBtn : styles.sellBtn}
                  onClick={() => handleTrade(alert.coin)}
                >
                  {alert.type === 'buy' ? 'Buy' : 'Sell'}
                </button>
                <button
                  className={styles.closeAlertBtn}
                  onClick={() => closeAlert(alert.id)}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Strategy;
