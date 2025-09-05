import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/accounts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: formData.username,
          password: formData.password,
          operation: 'login'
        })
      });

      if (response.ok) {
        // Login successful
        navigate("/discovery");
      } else if (response.status === 403) {
        setError("Invalid username or password");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <h1 style={styles.title}>Login</h1>
        
        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              name="username"
              placeholder="username"
              value={formData.username}
              onChange={handleInputChange}
              style={styles.input}
              required
              disabled={isLoading}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <input
              type="password"
              name="password"
              placeholder="password"
              value={formData.password}
              onChange={handleInputChange}
              style={styles.input}
              required
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            style={{
              ...styles.submitBtn,
              ...(isLoading && styles.submitBtnDisabled)
            }}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "login"}
          </button>
        </form>
        
        <p style={styles.signupText}>
          Don't have an account? <span style={styles.signupLink} onClick={handleSignUp}>Sign up</span>
        </p>
        
        <div style={styles.demoInfo}>
          <p style={styles.demoTitle}>Demo Users:</p>
          <p style={styles.demoText}>Username: <strong>awdeorio</strong> | Password: <strong>password</strong></p>
          <p style={styles.demoText}>Username: <strong>jflinn</strong> | Password: <strong>password</strong></p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundImage: 'url("/static/assets/background.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  },
  loginCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 30px 0',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  input: {
    padding: '12px 16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: '#fff',
    transition: 'border-color 0.2s',
    outline: 'none'
  },
  submitBtn: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '10px'
  },
  signupText: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#666',
    fontSize: '0.9rem'
  },
  signupLink: {
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb',
    fontSize: '0.9rem'
  },
  submitBtnDisabled: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed'
  },
  demoInfo: {
    marginTop: '30px',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #dee2e6'
  },
  demoTitle: {
    margin: '0 0 8px 0',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#495057'
  },
  demoText: {
    margin: '4px 0',
    fontSize: '0.8rem',
    color: '#6c757d',
    fontFamily: 'monospace'
  }
};
