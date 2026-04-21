

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Moon, Sun, User } from "lucide-react";

import styles from "./Navbar.module.css";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    const user = localStorage.getItem("username");
    setIsAuthenticated(authStatus);
    setUsername(user);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setUsername(null);
    navigate("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <h1 className={styles.logo}>CryptoStrategy</h1>

        <ul className={styles.navLinks}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/coingraph">CoinGraph</Link></li>
          <li><Link to="/trends">Trends</Link></li>
          <li><Link to="/cryptonews">CryptoNews</Link></li>
          <li><Link to="/histogram">Histogram</Link></li>
          <li><Link to="/strategy">Strategy</Link></li>
        </ul>

        <div className={styles.rightSection}>
        

          {isAuthenticated ? (
    <div className={styles.userInfo}>
  <User className={styles.profileIcon} />
  <span>{username?.split('@')[0]}</span>
  <button onClick={handleLogout} className={styles.logoutButton}>
    Logout
  </button>
</div>
          ) : (
            <Link to="/login" className={styles.loginButton}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
