# YouTube Data API v3 Setup Guide

## Overview
This demo currently uses simulated data based on artist names. To use real YouTube Data API v3, follow these steps:

## 1. Get YouTube Data API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Copy your API key

## 2. Set Environment Variable

```bash
export YOUTUBE_API_KEY="your_api_key_here"
```

Or add to your `.env` file:
```
YOUTUBE_API_KEY=your_api_key_here
```

## 3. Install Required Dependencies

```bash
pip install requests python-dotenv
```

## 4. Update Code

The current implementation in `insta485/api/discovery.py` includes:

- **Simulated Data Generation**: Based on artist name hash for consistent results
- **Real API Integration**: Ready for actual YouTube Data API v3 calls
- **Error Handling**: Falls back to demo mode if API fails
- **Dynamic Content**: Different data for different artists

## 5. Features

### Current Demo Features:
- ✅ Different data for different artist names
- ✅ Realistic metrics generation
- ✅ Dynamic video titles with artist names
- ✅ Genre-based keyword generation
- ✅ Random but consistent data per artist

### Real API Features (when API key is provided):
- 🔗 Actual YouTube channel search
- 📊 Real subscriber counts and metrics
- 🎬 Actual video data and statistics
- 🏷️ Real trending keywords from video content

## 6. API Quotas

YouTube Data API v3 has daily quotas:
- 10,000 units per day (default)
- Search: 100 units per request
- Channel details: 1 unit per request
- Video details: 1 unit per request

## 7. Production Considerations

- Implement caching to reduce API calls
- Add rate limiting
- Store results in database
- Implement proper error handling
- Add API key rotation

## Demo Mode

The current implementation works in demo mode without an API key, generating realistic data based on artist names. This is perfect for showcasing the functionality during interviews while avoiding API costs and setup complexity.
