import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repass, setRepass] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    
    if (!name || !email || !password || !repass) {
      setMessageType('error');
      return setMessage('Please fill in all fields.');
    }

    if (password !== repass) {
      setMessageType('error');
      return setMessage('Passwords do not match.');
    }

    axios.post('http://localhost:3001/register', { name, email, password })
      .then(res => {
        if (res.status === 201) {
          setMessageType('success');
          setMessage('User registered successfully, please login.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      })
      .catch(err => {
        const errorMsg = err.response?.data?.message || 'Registration failed';
        setMessageType('error');
        setMessage(errorMsg);
      });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#000' ,
      marginTop:'4%'
    }}>
      <div className="bg-dark p-4 rounded" style={{ minWidth: '350px' }}>
        <h2 className="text-center mb-4" style={{ color: '#fff' }}>Register</h2>

        {message && (
          <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
      
          <div className="mb-3">
            <label style={{ color: '#fff' }}>Name</label>
            <input
              type="text"
              className="form-control"
              required
              onChange={(e) => setName(e.target.value)}
              style={{ borderColor: '#1e1e1e', backgroundColor: '#333', color: '#fff' }}
            />
          </div>


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

          <div className="mb-3">
            <label style={{ color: '#fff' }}>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              required
              onChange={(e) => setRepass(e.target.value)}
              style={{ borderColor: '#1e1e1e', backgroundColor: '#333', color: '#fff' }}
            />
          </div>

          <button type="submit" className="btn" style={{ backgroundColor: '#00eaff', color: '#000', width: '100%' }}>Register</button>
        </form>

        <div className="mt-3">
          <span style={{ color: '#fff' }}>Already have an account?</span>{' '}
          <Link to="/signin" style={{ color: '#00eaff' }}>Login here</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
