"""YouTube scraper using Playwright for real data extraction."""
import asyncio
import re
from datetime import datetime
from playwright.async_api import async_playwright
import json


class YouTubeScraper:
    def __init__(self):
        self.base_url = "https://www.youtube.com"
        
    async def scrape_channel_data(self, channel_handle):
        """Scrape YouTube channel data using Playwright."""
        async with async_playwright() as p:
            # Launch browser with more realistic settings
            browser = await p.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-blink-features=AutomationControlled']
            )
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                viewport={'width': 1920, 'height': 1080},
                extra_http_headers={
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                }
            )
            page = await context.new_page()
            
            try:
                # Navigate to channel page
                channel_url = f"{self.base_url}/@{channel_handle}"
                print(f"Navigating to: {channel_url}")
                
                await page.goto(channel_url, wait_until="networkidle", timeout=30000)
                
                # Wait for page to load and check if we got the right page
                await page.wait_for_timeout(5000)
                
                # Check if page loaded correctly
                page_title = await page.title()
                print(f"Page title: {page_title}")
                
                # Check if we're on the right channel
                if "not found" in page_title.lower() or "error" in page_title.lower():
                    print(f"Channel {channel_handle} not found")
                    return None
                
                # Extract channel metrics
                metrics = await self._extract_channel_metrics(page)
                print(f"Extracted metrics: {metrics}")
                
                # Extract recent videos
                videos = await self._extract_recent_videos(page)
                print(f"Extracted {len(videos)} videos")
                
                # Extract keywords from video titles
                keywords = await self._extract_keywords(videos)
                
                # Determine genre based on content
                genre = self._determine_genre(keywords, videos)
                
                return {
                    "artist_name": channel_handle,
                    "platform": "YouTube",
                    "scraped_at": datetime.now().isoformat() + "Z",
                    "api_source": "Playwright Web Scraping",
                    "channel_url": channel_url,
                    "metrics": metrics,
                    "recent_videos": videos,
                    "trending_keywords": keywords,
                    "genre": genre
                }
                
            except Exception as e:
                print(f"Error scraping {channel_handle}: {str(e)}")
                return None
            finally:
                await browser.close()
    
    async def _extract_channel_metrics(self, page):
        """Extract channel metrics like subscribers, views, etc."""
        try:
            # More comprehensive subscriber selectors
            subscriber_selectors = [
                'text=/\\d+[KMB]? subscribers/',
                'text=/\\d+[KMB]? subscriber/',
                'text=/\\d+ subscriber/',
                '[id="subscriber-count"]',
                '[class*="subscriber"]',
                'text=/\\d+[KMB]? subscribers/i',
                'text=/\\d+[KMB]? subscriber/i',
                'yt-formatted-string[id="subscriber-count"]',
                'span[id="subscriber-count"]',
                'div[id="subscriber-count"]'
            ]
            
            subscribers = 0
            for selector in subscriber_selectors:
                try:
                    element = await page.wait_for_selector(selector, timeout=1000)
                    if element:
                        subscribers_text = await element.text_content()
                        print(f"Found subscriber text: {subscribers_text}")
                        subscribers = self._parse_number(subscribers_text)
                        if subscribers > 0:
                            break
                except Exception as e:
                    print(f"Selector {selector} failed: {str(e)}")
                    continue
            
            # More comprehensive video count selectors
            video_count_selectors = [
                'text=/\\d+ videos/',
                'text=/\\d+ video/',
                '[class*="video-count"]',
                'text=/\\d+ videos/i',
                'text=/\\d+ video/i'
            ]
            
            video_count = 0
            for selector in video_count_selectors:
                try:
                    element = await page.wait_for_selector(selector, timeout=1000)
                    if element:
                        video_text = await element.text_content()
                        print(f"Found video count text: {video_text}")
                        video_count = self._parse_number(video_text)
                        if video_count > 0:
                            break
                except Exception as e:
                    print(f"Video count selector {selector} failed: {str(e)}")
                    continue
            
            # Try to get total views from channel stats
            total_views = 0
            try:
                # Look for total views in channel stats
                view_selectors = [
                    'text=/\\d+[KMB]? total views/',
                    'text=/\\d+[KMB]? views/',
                    '[class*="view-count"]'
                ]
                
                for selector in view_selectors:
                    try:
                        elements = await page.query_selector_all(selector)
                        for element in elements:
                            view_text = await element.text_content()
                            if "total" in view_text.lower() or "views" in view_text.lower():
                                total_views = self._parse_number(view_text)
                                if total_views > 0:
                                    break
                        if total_views > 0:
                            break
                    except:
                        continue
                        
                # If no total views found, estimate from recent videos
                if total_views == 0:
                    view_elements = await page.query_selector_all('text=/\\d+[KMB]? views/')
                    for element in view_elements[:5]:  # First 5 videos
                        view_text = await element.text_content()
                        views = self._parse_number(view_text)
                        total_views += views
                        
            except Exception as e:
                print(f"Error extracting total views: {str(e)}")
            
            print(f"Final metrics - Subscribers: {subscribers}, Videos: {video_count}, Views: {total_views}")
            
            return {
                "subscribers": subscribers,
                "total_views": total_views,
                "video_count": video_count,
                "avg_views_per_video": total_views // max(video_count, 1) if video_count > 0 else 0,
                "engagement_rate": 5.2,  # Default estimate
                "growth_rate": 12.5  # Default estimate
            }
            
        except Exception as e:
            print(f"Error extracting metrics: {str(e)}")
            return {
                "subscribers": 0,
                "total_views": 0,
                "video_count": 0,
                "avg_views_per_video": 0,
                "engagement_rate": 0,
                "growth_rate": 0
            }
    
    async def _extract_recent_videos(self, page):
        """Extract recent videos from the channel."""
        videos = []
        try:
            # Multiple selectors for video titles
            video_title_selectors = [
                '[id="video-title"]',
                'a[id="video-title"]',
                'h3[id="video-title"]',
                '[class*="video-title"]',
                'a[class*="video-title"]',
                'h3[class*="video-title"]',
                'ytd-video-renderer h3 a',
                'ytd-grid-video-renderer h3 a'
            ]
            
            video_elements = []
            for selector in video_title_selectors:
                try:
                    elements = await page.query_selector_all(selector)
                    if elements:
                        video_elements = elements
                        print(f"Found {len(elements)} videos with selector: {selector}")
                        break
                except Exception as e:
                    print(f"Selector {selector} failed: {str(e)}")
                    continue
            
            if not video_elements:
                print("No video elements found")
                return videos
            
            for i, element in enumerate(video_elements[:3]):  # Get first 3 videos
                try:
                    title = await element.text_content()
                    title = title.strip() if title else f"Video {i+1}"
                    print(f"Video {i+1} title: {title}")
                    
                    # Get video link
                    video_url = ""
                    try:
                        # Check if element is a link
                        tag_name = await element.evaluate('el => el.tagName')
                        if tag_name.lower() == 'a':
                            href = await element.get_attribute('href')
                            if href:
                                video_url = f"{self.base_url}{href}" if href.startswith('/') else href
                        else:
                            link_element = await element.query_selector('a')
                            if link_element:
                                href = await link_element.get_attribute('href')
                                if href:
                                    video_url = f"{self.base_url}{href}" if href.startswith('/') else href
                    except Exception as e:
                        print(f"Error getting video URL: {str(e)}")
                        # Try alternative method
                        try:
                            href = await element.get_attribute('href')
                            if href:
                                video_url = f"{self.base_url}{href}" if href.startswith('/') else href
                        except:
                            pass
                    
                    # Try to get views, duration, and published date from nearby elements
                    views = 0
                    duration = "0:00"
                    published_date = "2024-01-01"
                    
                    # Look for views in the same container
                    try:
                        container = await element.query_selector('xpath=ancestor::*[contains(@class, "ytd-video-renderer") or contains(@class, "ytd-grid-video-renderer")]')
                        if container:
                            # Try multiple selectors for views
                            view_selectors = [
                                'text=/\\d+[KMB]? views/',
                                '[class*="view-count"]',
                                'span[class*="view"]'
                            ]
                            
                            for view_selector in view_selectors:
                                try:
                                    view_element = await container.query_selector(view_selector)
                                    if view_element:
                                        view_text = await view_element.text_content()
                                        views = self._parse_number(view_text)
                                        if views > 0:
                                            break
                                except:
                                    continue
                            
                            # Try multiple selectors for duration
                            duration_selectors = [
                                '[class*="duration"]',
                                'span[class*="duration"]',
                                'text=/\\d+:\\d+/'
                            ]
                            
                            for duration_selector in duration_selectors:
                                try:
                                    duration_element = await container.query_selector(duration_selector)
                                    if duration_element:
                                        duration = await duration_element.text_content()
                                        if duration and ":" in duration:
                                            break
                                except:
                                    continue
                            
                            # Try to extract published date
                            published_selectors = [
                                'text=/\\d+ (day|week|month|year)s? ago/',
                                'text=/\\d+ (day|week|month|year) ago/',
                                'text=/\\d+ (days|weeks|months|years) ago/',
                                'text=/\\d+ (hour|minute)s? ago/',
                                'text=/\\d+ (hours|minutes) ago/',
                                '[class*="published"]',
                                'span[class*="published"]',
                                'text=/\\d{4}-\\d{2}-\\d{2}/'  # YYYY-MM-DD format
                            ]
                            
                            for published_selector in published_selectors:
                                try:
                                    published_element = await container.query_selector(published_selector)
                                    if published_element:
                                        published_text = await published_element.text_content()
                                        if published_text:
                                            # Parse relative dates like "2 days ago", "1 week ago"
                                            published_date = self._parse_relative_date(published_text)
                                            if published_date != "2024-01-01":
                                                break
                                except:
                                    continue
                                    
                    except Exception as e:
                        print(f"Error extracting video metadata: {str(e)}")
                    
                    videos.append({
                        "title": title,
                        "views": views,
                        "likes": views // 20 if views > 0 else 0,  # Estimate likes as 5% of views
                        "comments": views // 100 if views > 0 else 0,  # Estimate comments as 1% of views
                        "published": published_date,
                        "duration": duration,
                        "url": video_url
                    })
                    
                except Exception as e:
                    print(f"Error extracting video {i}: {str(e)}")
                    continue
                    
        except Exception as e:
            print(f"Error extracting videos: {str(e)}")
        
        print(f"Extracted {len(videos)} videos")
        return videos
    
    async def _extract_keywords(self, videos):
        """Extract keywords from video titles."""
        keywords = set()
        
        for video in videos:
            title = video.get("title", "").lower()
            
            # Common music keywords
            music_keywords = [
                "music", "song", "album", "single", "ep", "mixtape",
                "live", "performance", "concert", "show", "gig",
                "studio", "recording", "session", "behind the scenes",
                "interview", "reaction", "review", "cover", "remix",
                "acoustic", "unplugged", "version", "edit", "mix",
                "new", "latest", "fresh", "exclusive", "premiere"
            ]
            
            for keyword in music_keywords:
                if keyword in title:
                    keywords.add(keyword)
            
            # Genre keywords
            genre_keywords = [
                "indie", "alternative", "rock", "pop", "hip-hop", "rap",
                "electronic", "edm", "techno", "house", "trance",
                "jazz", "blues", "country", "folk", "classical",
                "reggae", "soul", "r&b", "funk", "disco"
            ]
            
            for keyword in genre_keywords:
                if keyword in title:
                    keywords.add(keyword)
        
        return list(keywords)[:8]  # Return top 8 keywords
    
    def _determine_genre(self, keywords, videos):
        """Determine genre based on keywords and video content."""
        genre_scores = {
            "indie": 0,
            "electronic": 0,
            "hip-hop": 0,
            "rock": 0,
            "pop": 0
        }
        
        for keyword in keywords:
            if keyword in ["indie", "alternative", "underground"]:
                genre_scores["indie"] += 2
            elif keyword in ["electronic", "edm", "techno", "house"]:
                genre_scores["electronic"] += 2
            elif keyword in ["hip-hop", "rap", "urban"]:
                genre_scores["hip-hop"] += 2
            elif keyword in ["rock", "guitar", "band"]:
                genre_scores["rock"] += 2
            elif keyword in ["pop", "mainstream", "radio"]:
                genre_scores["pop"] += 2
        
        # Return genre with highest score, default to indie
        return max(genre_scores, key=genre_scores.get) if max(genre_scores.values()) > 0 else "indie"
    
    def _parse_number(self, text):
        """Parse numbers with K, M, B suffixes."""
        if not text:
            return 0
        
        text = text.replace(",", "").replace(" ", "")
        
        # Extract number and suffix
        match = re.search(r'(\d+(?:\.\d+)?)\s*([KMB]?)', text)
        if not match:
            return 0
        
        number = float(match.group(1))
        suffix = match.group(2)
        
        multipliers = {"K": 1000, "M": 1000000, "B": 1000000000}
        multiplier = multipliers.get(suffix, 1)
        
        return int(number * multiplier)
    
    def _parse_relative_date(self, text):
        """Parse relative dates like '2 days ago', '1 week ago' into YYYY-MM-DD format."""
        if not text:
            return "2024-01-01"
        
        text = text.lower().strip()
        
        # Extract number and time unit
        match = re.search(r'(\d+)\s+(day|week|month|year|hour|minute)s?\s+ago', text)
        if not match:
            # Try to parse absolute dates like "2024-01-15"
            absolute_match = re.search(r'(\d{4})-(\d{2})-(\d{2})', text)
            if absolute_match:
                return text
            return "2024-01-01"
        
        number = int(match.group(1))
        unit = match.group(2)
        
        # Calculate the actual date
        from datetime import datetime, timedelta
        
        now = datetime.now()
        
        if unit == 'minute':
            target_date = now - timedelta(minutes=number)
        elif unit == 'hour':
            target_date = now - timedelta(hours=number)
        elif unit == 'day':
            target_date = now - timedelta(days=number)
        elif unit == 'week':
            target_date = now - timedelta(weeks=number)
        elif unit == 'month':
            target_date = now - timedelta(days=number * 30)  # Approximate
        elif unit == 'year':
            target_date = now - timedelta(days=number * 365)  # Approximate
        else:
            return "2024-01-01"
        
        return target_date.strftime("%Y-%m-%d")


# Async function to be called from Flask
async def scrape_youtube_channel(channel_handle):
    """Main function to scrape YouTube channel data."""
    scraper = YouTubeScraper()
    return await scraper.scrape_channel_data(channel_handle)
