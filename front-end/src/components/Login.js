import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import supabase from './supabase/supabaseClient';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/dashboard');
      }
    };
    
    checkUser();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      // Store user role - in a real app, you'd fetch this from your user profiles table
      // For now we'll use a simple check - admin emails have "admin" in them
      const userRole = email.includes('admin') ? 'admin' : 'employee';
      localStorage.setItem('userRole', userRole);
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error logging in:', error.message);
      setError(error.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    setError('');

    // Demo credentials - replace these with your actual test accounts in Supabase
    const credentials = {
      dev: { email: 'developer@kaffi.com', password: 'kafficafe' },
    };

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials[role].email,
        password: credentials[role].password
      });

      if (error) throw error;
      
      localStorage.setItem('userRole', role);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error with demo login:', error.message);
      setError('Demo login failed. Please check if these accounts exist in your Supabase auth.');
    } finally {
      setLoading(false);
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
        <h1>Kaffi Cafe Login</h1>
        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="login-helper">
          <p>Demo accounts:</p>
          <button 
            className="demo-button" 
            onClick={() => handleDemoLogin('dev')}
            disabled={loading}
          >
            Login as Developer
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;