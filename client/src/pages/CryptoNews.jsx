import React, { useState, useEffect } from "react";
import styles from "../Styles/CryptoNews.module.css"; 

const CryptoNews = () => {
  const [news, setNews] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null); 

  const fetchNews = async () => {
    try {
      const response = await fetch(
        "https://api.allorigins.win/get?url=https://cointelegraph.com/rss"
      );
      const data = await response.json();

      const parser = new DOMParser();
      const xml = parser.parseFromString(data.contents, "application/xml");
      const items = xml.querySelectorAll("item");

      const newNews = Array.from(items).map((item) => {
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
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.newsContainer}>
      <h2 className={styles.newsHeading}>Latest Cryptocurrency News</h2> 

      <div className={styles.newsScroller}>
        {[...news, ...news].map((article, index) => (
          <div
            key={index}
            className={styles.newsItem}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <a href={article.link} target="_blank" rel="noopener noreferrer" className={styles.newsTitle}>
              <h3>{article.title}</h3>
            </a>
            <p className={styles.newsDescription}>
              {hoveredIndex === index ? article.longDescription : article.shortDescription}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoNews;