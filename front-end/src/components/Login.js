import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; 

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // For demonstration purposes - in a real app you'd validate against your backend
    if (username === 'admin' && password === 'password') {
      // Store some user info in localStorage (use a proper auth system in production)
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'admin');
      navigate('/dashboard');
    } else if (username === 'employee' && password === 'password') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'employee');
      navigate('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <div className="coffee-logo">
          <div className="coffee-cup">
            <div className="steam"></div>
          </div>
        </div>
        <h1>Coffee Shop Login</h1>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <div className="login-helper">
          <p>Demo accounts:</p>
          <p>Admin: admin / password</p>
          <p>Employee: employee / password</p>
        </div>
      </div>
    </div>
  );
}

export default Login;