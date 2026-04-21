import 'bootstrap/dist/css/bootstrap.min.css' 
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Home from "./pages/Home";
import Navbar from './Navbar';
import CoinGraph from "./pages/CoinGraph";
import Trends from "./pages/Trends";
import CryptoNews from "./pages/CryptoNews";
import Histogram from "./pages/Histogram";
import Strategy from "./pages/Strategy";

const App = () => {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/coingraph" element={<CoinGraph/>} />
        <Route path="/trends" element={<Trends/>} />
        <Route path="/cryptonews" element={<CryptoNews/>} />
        <Route path="/histogram" element={<Histogram/>} />
        <Route path="/strategy" element={<Strategy/>} />
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        </Routes>
    </Router>
  );
};

export default App;
