import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post('http://localhost:3001/login', { email, password })
      .then(result => {
        if (result.data.message === "Success") {
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("username", email);
          navigate('/home');
        } else {
          setMessage(result.data.message || "Login failed");
        }
      })
      .catch(() => setMessage("An error occurred. Please try again."));
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#000' }}>
      <div className="bg-dark p-4 rounded" style={{ minWidth: '350px' }}>
        <h2 className="text-center mb-4" style={{ color: '#fff' }}>Login</h2>

        {message && <div className="alert alert-danger">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label style={{ color: '#fff' }}>Email</label>
            <input 
              type="email" 
              className="form-control" 
              required 
              onChange={(e) => setEmail(e.target.value)} 
              style={{ borderColor: '#1e1e1e', backgroundColor: '#333', color: '#fff' }} 
            />
          </div>
          <div className="mb-3">
            <label style={{ color: '#fff' }}>Password</label>
            <input 
              type="password" 
              className="form-control" 
              required 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ borderColor: '#1e1e1e', backgroundColor: '#333', color: '#fff' }} 
            />
          </div>
          <button type="submit" className="btn" style={{ backgroundColor: '#00eaff', color: '#000', width: '100%' }}>Login</button>
        </form>
        <div className="mt-3">
          <span style={{ color: '#fff' }}>New user?</span> <Link to="/register" style={{ color: '#00eaff' }}>Register here</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
