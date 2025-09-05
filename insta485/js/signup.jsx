import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullname: "",
    email: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('fullname', formData.fullname);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('operation', 'create');
      
      if (profileImage) {
        formDataToSend.append('file', profileImage);
      }

      const response = await fetch('/accounts/', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        // Sign up successful
        navigate("/discovery");
      } else if (response.status === 409) {
        setError("Username already exists. Please choose a different username.");
      } else if (response.status === 400) {
        setError("Please fill in all required fields and upload a profile image.");
      } else {
        setError("Sign up failed. Please try again.");
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.signupCard}>
        <h1 style={styles.title}>Sign Up</h1>
        
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

          <div style={styles.inputGroup}>
            <input
              type="text"
              name="fullname"
              placeholder="full name"
              value={formData.fullname}
              onChange={handleInputChange}
              style={styles.input}
              required
              disabled={isLoading}
            />
          </div>

          <div style={styles.inputGroup}>
            <input
              type="email"
              name="email"
              placeholder="email"
              value={formData.email}
              onChange={handleInputChange}
              style={styles.input}
              required
              disabled={isLoading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.fileLabel}>
              Profile Image (required)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={styles.fileInput}
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
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        
        <p style={styles.loginText}>
          Already have an account? <span style={styles.loginLink} onClick={handleBackToLogin}>Login</span>
        </p>
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
  signupCard: {
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
  fileLabel: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px'
  },
  fileInput: {
    padding: '8px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '0.9rem',
    backgroundColor: '#fff'
  },
  submitBtn: {
    backgroundColor: '#28a745',
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
  submitBtnDisabled: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed'
  },
  loginText: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#666',
    fontSize: '0.9rem'
  },
  loginLink: {
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
  }
};
