import React, { useState } from "react";

export default function WebScrapingDemo() {
  const [scrapingStatus, setScrapingStatus] = useState("idle");
  const [scrapedData, setScrapedData] = useState(null);
  const [artistName, setArtistName] = useState("andfriends.nyc");
  const [scrapingProgress, setScrapingProgress] = useState(0);

  const handleScrape = async () => {
    if (!artistName.trim()) {
      alert("Please enter an artist name");
      return;
    }

    setScrapingStatus("scraping");
    setScrapedData(null);
    setScrapingProgress(0);

    // Simulate YouTube Data API v3 scraping progress
    const progressInterval = setInterval(() => {
      setScrapingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await fetch('/api/v1/scraping/youtube/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ artist_name: artistName })
      });

      if (!response.ok) {
        throw new Error('YouTube API call failed');
      }

      const data = await response.json();
      
      // Complete progress
      setScrapingProgress(100);
      setTimeout(() => {
        setScrapedData(data);
        setScrapingStatus("completed");
      }, 500);

    } catch (error) {
      clearInterval(progressInterval);
      setScrapingStatus("error");
      console.error("YouTube API error:", error);
    }
  };

  const renderScrapedData = () => {
    if (!scrapedData) return null;
    
    return (
      <div style={styles.resultsContainer}>
        <div style={styles.resultsHeader}>
          <h3 style={styles.resultsTitle}>
            📺 YouTube Data for "{scrapedData.artist_name}"
          </h3>
          <span style={styles.scrapedTime}>
            Scraped: {new Date(scrapedData.scraped_at).toLocaleString()}
          </span>
        </div>

        <div style={styles.apiInfo}>
          <div style={styles.apiBadge}>
            🔗 {scrapedData.api_source || 'Playwright Web Scraping'}
          </div>
          <p style={styles.apiDescription}>
            Real-time data collection using Playwright browser automation. 
            Extracts live data directly from YouTube channel pages.
          </p>
          {scrapedData.genre && (
            <div style={styles.genreInfo}>
              <span style={styles.genreLabel}>Genre:</span>
              <span style={styles.genreValue}>{scrapedData.genre}</span>
            </div>
          )}
        </div>

        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <h4>📊 Channel Metrics</h4>
            <div style={styles.metricRow}>
              <span>Subscribers:</span>
              <span style={styles.metricValue}>{scrapedData.metrics.subscribers.toLocaleString()}</span>
            </div>
            <div style={styles.metricRow}>
              <span>Total Views:</span>
              <span style={styles.metricValue}>{scrapedData.metrics.total_views.toLocaleString()}</span>
            </div>
            <div style={styles.metricRow}>
              <span>Videos:</span>
              <span style={styles.metricValue}>{scrapedData.metrics.video_count}</span>
            </div>
            <div style={styles.metricRow}>
              <span>Engagement Rate:</span>
              <span style={styles.metricValue}>{scrapedData.metrics.engagement_rate}%</span>
            </div>
            <div style={styles.metricRow}>
              <span>Growth Rate:</span>
              <span style={styles.metricValue}>{scrapedData.metrics.growth_rate}%</span>
            </div>
          </div>

          <div style={styles.metricCard}>
            <h4>🎬 Recent Videos</h4>
            {scrapedData.recent_videos.map((video, index) => (
              <div key={index} style={styles.videoItem}>
                <div style={styles.videoTitle}>{video.title}</div>
                <div style={styles.videoStats}>
                  {video.views.toLocaleString()} views • {video.likes.toLocaleString()} likes • {video.duration}
                </div>
                <div style={styles.videoDate}>
                  Published: {video.published}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.metricCard}>
            <h4>🔥 Trending Keywords</h4>
            <div style={styles.keywordsContainer}>
              {scrapedData.trending_keywords.map((keyword, index) => (
                <span key={index} style={styles.keywordTag}>{keyword}</span>
              ))}
            </div>
            <div style={styles.apiNote}>
              <p>Keywords extracted from video titles using Playwright web scraping</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <img src="/static/assets/logo.png" alt="Mesh Scout Logo" style={styles.logo} />
          YouTube Web Scraping Demo
        </h1>
        <p style={styles.subtitle}>Real-time Artist Data Collection using Playwright Web Scraping</p>
      </div>

      <div style={styles.demoSection}>
        <div style={styles.controlsContainer}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Artist Name:</label>
            <input
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              style={styles.input}
              placeholder="Enter artist name..."
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Platform:</label>
            <div style={styles.platformInfo}>
              <span style={styles.platformBadge}>🎭 Playwright Web Scraping</span>
              <span style={styles.platformStatus}>✅ Real-time Data</span>
            </div>
          </div>

          <button
            onClick={handleScrape}
            disabled={scrapingStatus === "scraping"}
            style={{
              ...styles.scrapeButton,
              ...(scrapingStatus === "scraping" && styles.scrapeButtonDisabled)
            }}
          >
            {scrapingStatus === "scraping" ? "🔄 Scraping YouTube Data..." : "🚀 Scrape YouTube Data"}
          </button>
        </div>

        {scrapingStatus === "scraping" && (
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: `${scrapingProgress}%`
                }}
              />
            </div>
            <p style={styles.progressText}>
              Scraping YouTube with Playwright... {scrapingProgress}%
            </p>
          </div>
        )}

        {scrapingStatus === "error" && (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>❌ YouTube scraping failed. Please try again.</p>
          </div>
        )}

        {renderScrapedData()}
      </div>

      <div style={styles.techStack}>
        <h3 style={styles.techTitle}>🛠️ Technology Stack</h3>
        <div style={styles.techGrid}>
          <div style={styles.techCard}>
            <h4>🎭 Playwright</h4>
            <p>Browser automation for dynamic content scraping. Handles JavaScript-rendered pages.</p>
          </div>
          <div style={styles.techCard}>
            <h4>🌐 Web Scraping</h4>
            <p>Real-time data extraction from YouTube channel pages using CSS selectors</p>
          </div>
          <div style={styles.techCard}>
            <h4>📊 Data Processing</h4>
            <p>Real-time analysis of channel metrics, video performance, and trending keywords</p>
          </div>
          <div style={styles.techCard}>
            <h4>🔄 Async Processing</h4>
            <p>Asynchronous web scraping with proper error handling and timeout management</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    minHeight: '100vh',
    padding: '20px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px'
  },
  logo: {
    width: '50px',
    height: '50px'
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#888',
    margin: '0'
  },
  demoSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    marginBottom: '40px'
  },
  controlsContainer: {
    backgroundColor: '#1a1a1a',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '30px',
    border: '1px solid #333'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#fff'
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '1rem',
    backgroundColor: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '6px',
    color: '#fff',
    outline: 'none'
  },
  platformInfo: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center'
  },
  platformBadge: {
    backgroundColor: '#FF0000',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 'bold'
  },
  platformStatus: {
    color: '#4ecdc4',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  scrapeButton: {
    padding: '15px 30px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    backgroundColor: '#4ecdc4',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  scrapeButtonDisabled: {
    backgroundColor: '#666',
    cursor: 'not-allowed'
  },
  progressContainer: {
    marginBottom: '30px'
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#333',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '10px'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ecdc4',
    transition: 'width 0.3s ease'
  },
  progressText: {
    textAlign: 'center',
    color: '#888',
    margin: '0'
  },
  errorContainer: {
    backgroundColor: '#2a1a1a',
    border: '1px solid #ff6b6b',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px'
  },
  errorText: {
    color: '#ff6b6b',
    margin: '0',
    textAlign: 'center'
  },
  resultsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    padding: '30px',
    border: '1px solid #333'
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #333'
  },
  resultsTitle: {
    fontSize: '1.8rem',
    margin: '0',
    color: '#fff'
  },
  scrapedTime: {
    color: '#888',
    fontSize: '0.9rem'
  },
  apiInfo: {
    backgroundColor: '#1a2a1a',
    border: '1px solid #4ecdc4',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px',
    textAlign: 'center'
  },
  apiBadge: {
    backgroundColor: '#4ecdc4',
    color: '#000',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 'bold',
    display: 'inline-block',
    marginBottom: '10px'
  },
  apiDescription: {
    color: '#888',
    margin: '0',
    fontSize: '0.9rem'
  },
  genreInfo: {
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center'
  },
  genreLabel: {
    color: '#888',
    fontSize: '0.9rem'
  },
  genreValue: {
    backgroundColor: '#FF0000',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px'
  },
  metricCard: {
    backgroundColor: '#2a2a2a',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #444'
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    padding: '5px 0'
  },
  metricValue: {
    fontWeight: 'bold',
    color: '#4ecdc4'
  },
  videoItem: {
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid #444'
  },
  videoTitle: {
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#fff'
  },
  videoStats: {
    fontSize: '0.9rem',
    color: '#888'
  },
  videoDate: {
    fontSize: '0.8rem',
    color: '#666',
    marginTop: '5px'
  },
  keywordsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  keywordTag: {
    backgroundColor: '#4ecdc4',
    color: '#000',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  apiNote: {
    marginTop: '15px',
    padding: '10px',
    backgroundColor: '#1a1a1a',
    borderRadius: '6px',
    border: '1px solid #333'
  },
  techStack: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  techTitle: {
    fontSize: '1.8rem',
    textAlign: 'center',
    marginBottom: '30px',
    color: '#fff'
  },
  techGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  techCard: {
    backgroundColor: '#1a1a1a',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #333',
    textAlign: 'center'
  }
};