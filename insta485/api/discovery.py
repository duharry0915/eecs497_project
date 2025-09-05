"""Music Discovery API endpoints."""
import flask
import insta485
from datetime import datetime


@insta485.app.route('/api/v1/users/', methods=['GET'])
def get_current_user():
    """Get current logged-in user information."""
    if 'username' not in flask.session:
        flask.abort(403)
    
    username = flask.session['username']
    connection = insta485.model.get_db()
    
    cur = connection.execute(
        "SELECT username, fullname, email, filename FROM users WHERE username = ?",
        (username,)
    )
    user = cur.fetchone()
    
    if not user:
        flask.abort(404)
    
    return flask.jsonify({
        "username": user['username'],
        "fullname": user['fullname'],
        "email": user['email'],
        "filename": user['filename']
    })


@insta485.app.route('/api/v1/discovery/trending-artists/', methods=['GET'])
def get_trending_artists_api():
    """Get trending artists sorted by breakout score."""
    # Mock data for prototype - sorted by breakout score (highest first)
    trending_artists = [
        {
            "artist_id": 1,
            "artist_name": "andfriends.nyc",
            "instagram_handle": "@andfriends.nyc",
            "instagram_url": "https://www.instagram.com/andfriends.nyc/",
            "followers_count": 83800,
            "growth_rate": 15.2,
            "genre": "Alternative/Indie",
            "breakout_score": 92.5,
            "profile_pic": "/static/assets/andfriends_profile.jpg"
        },
        {
            "artist_id": 2,
            "artist_name": "Luna Echo",
            "instagram_handle": "@lunaecho",
            "instagram_url": "https://www.instagram.com/lunaecho/",
            "followers_count": 45600,
            "growth_rate": 23.1,
            "genre": "Electronic",
            "breakout_score": 88.7,
            "profile_pic": "/static/assets/luna_profile.jpg"
        },
        {
            "artist_id": 3,
            "artist_name": "The Midnight Collective",
            "instagram_handle": "@midnightcollective",
            "instagram_url": "https://www.instagram.com/midnightcollective/",
            "followers_count": 23400,
            "growth_rate": 31.5,
            "genre": "Hip-Hop",
            "breakout_score": 85.3,
            "profile_pic": "/static/assets/midnight_profile.jpg"
        }
    ]
    
    # Sort by breakout score (highest first)
    trending_artists.sort(key=lambda x: x['breakout_score'], reverse=True)
    
    return flask.jsonify({
        "trending_artists": trending_artists,
        "total": len(trending_artists)
    })


@insta485.app.route('/api/v1/discovery/tastemakers/', methods=['GET'])
def get_tastemakers_api():
    """Get tastemakers sorted by influence score."""
    # Mock data for prototype - sorted by influence score (highest first)
    tastemakers = [
        {
            "user_id": 1,
            "username": "music_curator_nyc",
            "influence_score": 94.2,
            "early_adopter_score": 89.1,
            "genres_followed": ["Alternative", "Electronic", "Hip-Hop"],
            "profile_pic": "/static/assets/curator_profile.jpg"
        },
        {
            "user_id": 2,
            "username": "indie_discoverer",
            "influence_score": 87.6,
            "early_adopter_score": 92.3,
            "genres_followed": ["Indie", "Folk", "Alternative"],
            "profile_pic": "/static/assets/indie_profile.jpg"
        },
        {
            "user_id": 3,
            "username": "electronic_trendsetter",
            "influence_score": 82.1,
            "early_adopter_score": 85.7,
            "genres_followed": ["Electronic", "Techno", "House"],
            "profile_pic": "/static/assets/electronic_profile.jpg"
        }
    ]
    
    # Sort by influence score (highest first)
    tastemakers.sort(key=lambda x: x['influence_score'], reverse=True)
    
    return flask.jsonify({
        "tastemakers": tastemakers,
        "total": len(tastemakers)
    })


@insta485.app.route('/api/v1/discovery/trending-genres/', methods=['GET'])
def get_trending_genres_api():
    """Get trending genres sorted by trend score."""
    # Mock data for prototype - sorted by trend score (highest first)
    trending_genres = [
        {
            "genre": "Alternative/Indie",
            "growth_rate": 28.5,
            "artist_count": 156,
            "trending_score": 94.2
        },
        {
            "genre": "Electronic",
            "growth_rate": 22.1,
            "artist_count": 89,
            "trending_score": 87.6
        },
        {
            "genre": "Hip-Hop",
            "growth_rate": 19.8,
            "artist_count": 203,
            "trending_score": 82.3
        },
        {
            "genre": "Folk",
            "growth_rate": 15.4,
            "artist_count": 67,
            "trending_score": 78.9
        }
    ]
    
    # Sort by trend score (highest first)
    trending_genres.sort(key=lambda x: x['trending_score'], reverse=True)
    
    return flask.jsonify({
        "trending_genres": trending_genres,
        "total": len(trending_genres)
    })


@insta485.app.route('/api/v1/discovery/artist/<int:artist_id>/metrics/', methods=['GET'])
def get_artist_metrics_api(artist_id):
    """Get social media metrics for a specific artist."""
    # Mock data for prototype
    metrics = {
        "artist_id": artist_id,
        "social_metrics": [
            {
                "platform": "Instagram",
                "followers_count": 83800,
                "engagement_rate": 4.2,
                "growth_rate": 15.2,
                "last_updated": "2024-01-15"
            },
            {
                "platform": "TikTok",
                "followers_count": 45600,
                "engagement_rate": 8.7,
                "growth_rate": 23.1,
                "last_updated": "2024-01-15"
            },
            {
                "platform": "Twitter",
                "followers_count": 23400,
                "engagement_rate": 2.1,
                "growth_rate": 12.5,
                "last_updated": "2024-01-15"
            }
        ]
    }
    
    return flask.jsonify(metrics)


@insta485.app.route('/api/v1/scraping/youtube/', methods=['POST'])
def scrape_youtube_data():
    """Scrape YouTube data for artist discovery using Playwright."""
    import asyncio
    from insta485.scraper.youtube_scraper import scrape_youtube_channel
    
    data = flask.request.get_json()
    artist_name = data.get('artist_name', '')
    
    if not artist_name:
        return flask.jsonify({"error": "Artist name is required"}), 400
    
    # Clean the artist name (remove @ if present)
    channel_handle = artist_name.replace('@', '') if artist_name.startswith('@') else artist_name
    
    try:
        # Run the async scraper
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(scrape_youtube_channel(channel_handle))
            
            if result:
                return flask.jsonify(result)
            else:
                # Fallback to demo data if scraping fails
                return flask.jsonify({
                    "artist_name": artist_name,
                    "platform": "YouTube",
                    "scraped_at": datetime.now().isoformat() + "Z",
                    "api_source": "Playwright Web Scraping (Failed - Demo Mode)",
                    "error": "Failed to scrape YouTube data",
                    "metrics": {
                        "subscribers": 0,
                        "total_views": 0,
                        "video_count": 0,
                        "avg_views_per_video": 0,
                        "engagement_rate": 0,
                        "growth_rate": 0
                    },
                    "recent_videos": [],
                    "trending_keywords": [],
                    "genre": "unknown"
                })
        finally:
            loop.close()
            
    except Exception as e:
        flask.current_app.logger.error(f"Playwright scraping error: {str(e)}")
        
        # Return error response
        return flask.jsonify({
            "artist_name": artist_name,
            "platform": "YouTube",
            "scraped_at": datetime.now().isoformat() + "Z",
            "api_source": "Playwright Web Scraping (Error)",
            "error": f"Scraping failed: {str(e)}",
            "metrics": {
                "subscribers": 0,
                "total_views": 0,
                "video_count": 0,
                "avg_views_per_video": 0,
                "engagement_rate": 0,
                "growth_rate": 0
            },
            "recent_videos": [],
            "trending_keywords": [],
            "genre": "unknown"
        }), 500


@insta485.app.route('/api/v1/scraping/spotify/', methods=['POST'])
def scrape_spotify_data():
    """Scrape Spotify data for artist discovery."""
    data = flask.request.get_json()
    artist_name = data.get('artist_name', '')
    
    # Mock Spotify scraping results
    spotify_data = {
        "artist_name": artist_name,
        "platform": "Spotify",
        "scraped_at": "2024-01-15T10:30:00Z",
        "metrics": {
            "monthly_listeners": 89000,
            "followers": 45000,
            "total_plays": 1200000,
            "avg_plays_per_track": 30000,
            "popularity_score": 78,
            "growth_rate": 18.5
        },
        "top_tracks": [
            {
                "name": "Midnight Vibes",
                "plays": 180000,
                "popularity": 85,
                "release_date": "2024-01-01",
                "duration": "3:45"
            },
            {
                "name": "Underground Dreams",
                "plays": 120000,
                "popularity": 72,
                "release_date": "2023-11-15",
                "duration": "4:20"
            },
            {
                "name": "Studio Sessions",
                "plays": 95000,
                "popularity": 68,
                "release_date": "2023-10-01",
                "duration": "5:10"
            }
        ],
        "genres": ["indie", "alternative", "underground", "experimental"],
        "playlist_features": [
            "New Music Friday",
            "Indie Discover Weekly",
            "Underground Vibes",
            "Alternative Rising"
        ]
    }
    
    return flask.jsonify(spotify_data)


@insta485.app.route('/api/v1/scraping/instagram/', methods=['POST'])
def scrape_instagram_data():
    """Scrape Instagram data for artist discovery."""
    data = flask.request.get_json()
    artist_name = data.get('artist_name', '')
    
    # Mock Instagram scraping results
    instagram_data = {
        "artist_name": artist_name,
        "platform": "Instagram",
        "scraped_at": "2024-01-15T10:30:00Z",
        "metrics": {
            "followers": 83800,
            "following": 1557,
            "posts": 93,
            "engagement_rate": 4.2,
            "growth_rate": 15.2,
            "avg_likes": 1396,
            "avg_comments": 96
        },
        "recent_posts": [
            {
                "type": "reel",
                "likes": 1200,
                "comments": 89,
                "caption": "New vibes coming soon 🎵",
                "hashtags": ["#newmusic", "#indie", "#underground"],
                "posted": "2024-01-14"
            },
            {
                "type": "reel",
                "likes": 890,
                "comments": 45,
                "caption": "Studio session 🔥",
                "hashtags": ["#studio", "#music", "#behindthescenes"],
                "posted": "2024-01-12"
            },
            {
                "type": "reel",
                "likes": 2100,
                "comments": 156,
                "caption": "Live from the underground",
                "hashtags": ["#live", "#underground", "#performance"],
                "posted": "2024-01-10"
            }
        ],
        "hashtag_analysis": {
            "most_used": ["#newmusic", "#indie", "#underground", "#music", "#live"],
            "trending": ["#viral", "#fyp", "#music", "#indie", "#newmusic"],
            "engagement_rate": 4.2
        }
    }
    
    return flask.jsonify(instagram_data)
