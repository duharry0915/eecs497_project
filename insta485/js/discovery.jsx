import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function MusicDiscovery() {
  const [trendingArtists, setTrendingArtists] = useState([]);
  const [tastemakers, setTastemakers] = useState([]);
  const [trendingGenres, setTrendingGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all data for the dashboard
    const fetchData = async () => {
      try {
        const [artistsRes, tastemakersRes, genresRes] = await Promise.all([
          fetch('/api/v1/discovery/trending-artists/'),
          fetch('/api/v1/discovery/tastemakers/'),
          fetch('/api/v1/discovery/trending-genres/')
        ]);

        const artistsData = await artistsRes.json();
        const tastemakersData = await tastemakersRes.json();
        const genresData = await genresRes.json();

        setTrendingArtists(artistsData.trending_artists);
        setTastemakers(tastemakersData.tastemakers);
        setTrendingGenres(genresData.trending_genres);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading Music Discovery Data...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <img src="/static/assets/logo.png" alt="Logo" style={styles.logo} />
          <img src="/static/assets/&friends.png" alt="&friends" style={styles.friendsLogo} />
          <span style={styles.titleText}>- Music Discovery Platform</span>
        </h1>
        <p style={styles.subtitle}>Discovering emerging artists through social media intelligence</p>
      </div>

      <div style={styles.grid}>
        {/* Trending Artists Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🔥 Trending Artists</h2>
          <div style={styles.artistsGrid}>
            {trendingArtists.map((artist) => (
              <div key={artist.artist_id} style={styles.artistCard}>
                <div style={styles.artistHeader}>
                  <div style={styles.artistInfo}>
                    <h3 style={styles.artistName}>{artist.artist_name}</h3>
                    <p style={styles.artistHandle}>{artist.instagram_handle}</p>
                    <p style={styles.artistGenre}>{artist.genre}</p>
                  </div>
                  <div style={styles.breakoutScore}>
                    <span style={styles.scoreLabel}>Breakout Score</span>
                    <span style={styles.scoreValue}>{artist.breakout_score}</span>
                  </div>
                </div>
                <div style={styles.metrics}>
                  <div style={styles.metric}>
                    <span style={styles.metricLabel}>Followers</span>
                    <span style={styles.metricValue}>{artist.followers_count.toLocaleString()}</span>
                  </div>
                  <div style={styles.metric}>
                    <span style={styles.metricLabel}>Growth</span>
                    <span style={styles.metricValue}>+{artist.growth_rate}%</span>
                  </div>
                </div>
                <div style={styles.instagramLink}>
                  <a 
                    href={artist.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.instagramBtn}
                  >
                    📸 View on Instagram
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tastemakers Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>👑 Tastemakers</h2>
          <div style={styles.tastemakersGrid}>
            {tastemakers.map((tastemaker) => (
              <div key={tastemaker.user_id} style={styles.tastemakerCard}>
                <div style={styles.tastemakerInfo}>
                  <h3 style={styles.tastemakerName}>{tastemaker.username}</h3>
                  <div style={styles.scores}>
                    <div style={styles.score}>
                      <span style={styles.scoreLabel}>Influence</span>
                      <span style={styles.scoreValue}>{tastemaker.influence_score}</span>
                    </div>
                    <div style={styles.score}>
                      <span style={styles.scoreLabel}>Early Adopter</span>
                      <span style={styles.scoreValue}>{tastemaker.early_adopter_score}</span>
                    </div>
                  </div>
                  <div style={styles.genres}>
                    {tastemaker.genres_followed.map((genre, index) => (
                      <span key={index} style={styles.genreTag}>{genre}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Genres Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📈 Trending Genres</h2>
          <div style={styles.genresGrid}>
            {trendingGenres.map((genre, index) => (
              <div key={index} style={styles.genreCard}>
                <h3 style={styles.genreName}>{genre.genre}</h3>
                <div style={styles.genreMetrics}>
                  <div style={styles.genreMetric}>
                    <span style={styles.metricLabel}>Growth</span>
                    <span style={styles.metricValue}>+{genre.growth_rate}%</span>
                  </div>
                  <div style={styles.genreMetric}>
                    <span style={styles.metricLabel}>Artists</span>
                    <span style={styles.metricValue}>{genre.artist_count}</span>
                  </div>
                  <div style={styles.genreMetric}>
                    <span style={styles.metricLabel}>Trend Score</span>
                    <span style={styles.metricValue}>{genre.trending_score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          Powered by social media data analysis • Real-time trend detection • AI-powered predictions
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    padding: '20px 0'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#888',
    margin: '0'
  },
  grid: {
    display: 'grid',
    gap: '30px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #333'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0 0 20px 0',
    color: '#fff'
  },
  artistsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  artistCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #444'
  },
  artistHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  artistInfo: {
    flex: 1
  },
  artistName: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    margin: '0 0 4px 0',
    color: '#fff'
  },
  artistHandle: {
    fontSize: '0.9rem',
    color: '#888',
    margin: '0 0 4px 0'
  },
  artistGenre: {
    fontSize: '0.8rem',
    color: '#4ecdc4',
    margin: '0'
  },
  breakoutScore: {
    textAlign: 'right'
  },
  scoreLabel: {
    fontSize: '0.7rem',
    color: '#888',
    display: 'block'
  },
  scoreValue: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#ff6b6b'
  },
  metrics: {
    display: 'flex',
    gap: '16px'
  },
  metric: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  metricLabel: {
    fontSize: '0.7rem',
    color: '#888',
    marginBottom: '2px'
  },
  metricValue: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#fff'
  },
  tastemakersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  },
  tastemakerCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #444'
  },
  tastemakerInfo: {
    textAlign: 'center'
  },
  tastemakerName: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    margin: '0 0 12px 0',
    color: '#fff'
  },
  scores: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '12px'
  },
  score: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  genres: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    justifyContent: 'center'
  },
  genreTag: {
    fontSize: '0.7rem',
    backgroundColor: '#4ecdc4',
    color: '#000',
    padding: '2px 8px',
    borderRadius: '12px'
  },
  genresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  genreCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #444',
    textAlign: 'center'
  },
  genreName: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    margin: '0 0 12px 0',
    color: '#fff'
  },
  genreMetrics: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  genreMetric: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#888',
    padding: '40px'
  },
  footer: {
    textAlign: 'center',
    marginTop: '40px',
    padding: '20px 0',
    borderTop: '1px solid #333'
  },
  footerText: {
    fontSize: '0.9rem',
    color: '#666',
    margin: '0'
  },
  logo: {
    width: '40px',
    height: '40px',
    marginRight: '8px',
    verticalAlign: 'middle'
  },
  friendsLogo: {
    width: '120px',
    height: '40px',
    marginRight: '10px',
    verticalAlign: 'middle'
  },
  titleText: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    verticalAlign: 'middle'
  },
  instagramLink: {
    marginTop: '12px',
    textAlign: 'center'
  },
  instagramBtn: {
    display: 'inline-block',
    backgroundColor: '#E4405F',
    color: '#fff',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
    border: 'none',
    cursor: 'pointer'
  }
};
