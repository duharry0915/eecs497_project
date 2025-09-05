import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navigation() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const isActive = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
    // Check if user is logged in by calling the auth endpoint
    const checkAuth = async () => {
      try {
        const response = await fetch('/accounts/auth/');
        if (response.ok) {
          // User is logged in, get user info
          const userResponse = await fetch('/api/v1/users/');
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserInfo(userData);
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.log('User not logged in');
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    };

    checkAuth();
    
    // Also check on page focus (in case user logged in another tab)
    const handleFocus = () => {
      checkAuth();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/accounts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          operation: 'logout'
        })
      });
      setIsLoggedIn(false);
      setUserInfo(null);
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <div style={styles.brand}>
          <Link to="/" style={styles.brandLink}>
            <img src="/static/assets/logo.png" alt="Logo" style={styles.logo} />
            <img src="/static/assets/&friends.png" alt="&friends" style={styles.friendsLogo} />
          </Link>
        </div>
        
        <div style={styles.rightSection}>
          <div style={styles.links}>
            <Link 
              to="/discovery" 
              style={{
                ...styles.link,
                ...(isActive('/discovery') && styles.activeLink)
              }}
            >
              🔥 Music Discovery
            </Link>
            
            <Link 
              to="/scraping" 
              style={{
                ...styles.link,
                ...(isActive('/scraping') && styles.activeLink)
              }}
            >
              🔍 Web Scraping Demo
            </Link>
          </div>
          
          <div style={styles.authSection}>
            {isLoggedIn && userInfo ? (
              <div style={styles.userProfile}>
                <img 
                  src={`/uploads/${userInfo.filename}`} 
                  alt={userInfo.username}
                  style={styles.userAvatar}
                  onError={(e) => {
                    e.target.src = '/static/assets/card46.png';
                  }}
                />
                <div style={styles.userDropdown}>
                  <span style={styles.username}>{userInfo.username}</span>
                  <button style={styles.logoutBtn} onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" style={styles.loginBtn}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: '#1a1a1a',
    borderBottom: '1px solid #333',
    padding: '12px 0',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  brand: {
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  brandLink: {
    color: '#ff6b6b',
    textDecoration: 'none',
    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  logo: {
    width: '30px',
    height: '30px',
    marginRight: '8px',
    verticalAlign: 'middle'
  },
  friendsLogo: {
    width: '80px',
    height: '30px',
    verticalAlign: 'middle'
  },
  links: {
    display: 'flex',
    gap: '20px'
  },
  link: {
    color: '#ccc',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
    border: '1px solid transparent'
  },
  activeLink: {
    color: '#fff',
    backgroundColor: '#333',
    borderColor: '#444'
  },
  authSection: {
    display: 'flex',
    alignItems: 'center'
  },
  loginBtn: {
    backgroundColor: '#4ecdc4',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    textDecoration: 'none',
    display: 'inline-block'
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    position: 'relative'
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
    cursor: 'pointer',
    border: '2px solid #4ecdc4'
  },
  userDropdown: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px'
  },
  username: {
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  logoutBtn: {
    backgroundColor: '#ff6b6b',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '0.7rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  }
};
