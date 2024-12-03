from dotenv import load_dotenv
load_dotenv()

from flask import Flask, render_template, request, jsonify, session
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache
from flask_talisman import Talisman
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_compress import Compress
from prometheus_flask_exporter import PrometheusMetrics
from src.models import db, SearchHistory, Favorite, SearchMetrics
import os
import requests
from urllib.parse import quote
import re
from datetime import datetime
import logging
import uuid

# Initialize Flask app
app = Flask(__name__,
    template_folder=os.path.join('src', 'templates'),
    static_folder=os.path.join('src', 'static')
)

# Configuration
instance_path = os.path.join(os.path.dirname(__file__), 'instance')
os.makedirs(instance_path, exist_ok=True)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', f'sqlite:///{os.path.join(instance_path, "uncycle.db")}')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = os.getenv('SECRET_KEY', 'dev')

# Initialize extensions
db.init_app(app)

# Security headers with relaxed settings for development
Talisman(app, 
    force_https=False,
    content_security_policy={
        'default-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", '*'],
        'img-src': ['*', 'data:', 'blob:'],
        'media-src': ['*', 'data:', 'blob:'],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", '*'],
        'style-src': ["'self'", "'unsafe-inline'", '*'],
        'frame-src': ['*']
    }
)

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["1000 per day", "100 per hour"],
    storage_uri="memory://"
)

# Caching
cache = Cache(app, config={
    'CACHE_TYPE': 'simple',
    'CACHE_DEFAULT_TIMEOUT': 300
})

# Compression
Compress(app)

# Metrics
PrometheusMetrics(app)

# Initialize database
with app.app_context():
    db.create_all()

# Basic routes
@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/app')
def app_page():
    return render_template('index.html')

# Search functionality
@app.route('/search')
@limiter.limit("20 per minute")
def search():
    query = request.args.get('q', '')
    page = int(request.args.get('page', 1))
    sort = request.args.get('sort', 'relevance')
    duration = request.args.get('duration', 'any')
    
    if not query:
        return jsonify({'error': 'No search term provided'})
    
    try:
        # Track search history
        user_id = session.get('user_id')
        history = SearchHistory(
            query=query,
            user_id=user_id
        )
        db.session.add(history)
        
        # Update metrics
        metric = SearchMetrics.get_or_create(query)
        metric.count = (metric.count or 0) + 1
        metric.last_searched = datetime.utcnow()
        
        db.session.commit()
        
        # Get search results
        results = search_tutorials(query, page=page, sort=sort, duration=duration)
        
        # Update history with results count
        history.results_count = len(results)
        db.session.commit()
        
        return jsonify({
            'items': results,
            'hasMore': len(results) >= 20,
            'nextPage': page + 1
        })
        
    except Exception as e:
        logging.error(f"Search error: {str(e)}", exc_info=True)
        return jsonify({'error': 'An error occurred during search'}), 500

def search_tutorials(query, page=1, sort='relevance', duration='any'):
    results = []
    try:
        # Build search URL with parameters
        search_params = {
            'q': f'how to reuse {query}',
            'sp': f'{"CAASAhAB" if sort == "date" else ""}{"EgIYAQ==" if duration == "short" else "EgIYAw==" if duration == "long" else ""}'
        }
        url = f"https://www.youtube.com/results?search_query={quote(search_params['q'])}&sp={search_params['sp']}"
        response = requests.get(url)
        
        # Extract video IDs
        video_ids = re.findall(r"watch\?v=(\S{11})", response.text)
        unique_ids = list(dict.fromkeys(video_ids))
        
        # Calculate pagination
        start_idx = (page - 1) * 20
        end_idx = start_idx + 20
        page_ids = unique_ids[start_idx:end_idx]
        
        # Extract more detailed info using regex patterns
        for video_id in page_ids:
            # Extract title
            title_match = re.search(
                f'"{video_id}".+?"title":.+?"text":"([^"]+)"',
                response.text
            )
            title = title_match.group(1) if title_match else f"How to reuse {query}"
            
            # Extract description
            desc_match = re.search(
                f'"{video_id}".+?"description":.+?"text":"([^"]+)"',
                response.text
            )
            description = desc_match.group(1) if desc_match else ""
            
            # Extract duration
            duration_match = re.search(
                f'"{video_id}".+?"lengthText":.+?"simpleText":"([^"]+)"',
                response.text
            )
            duration = duration_match.group(1) if duration_match else ""
            
            # Extract views
            views_match = re.search(
                f'"{video_id}".+?"viewCountText":.+?"simpleText":"([^"]+)"',
                response.text
            )
            views = views_match.group(1) if views_match else ""
            
            # Only add videos with valid titles
            if title and not title.isspace():
                results.append({
                    'id': video_id,
                    'title': title,
                    'description': description,
                    'duration': duration,
                    'views': views,
                    'url': f'https://youtube.com/watch?v={video_id}',
                    'thumbnail': f'https://img.youtube.com/vi/{video_id}/mqdefault.jpg'
                })
            
    except Exception as e:
        logging.error(f"Error searching: {e}", exc_info=True)
        
    return results

# User session management
@app.before_request
def before_request():
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())

# History endpoints
@app.route('/api/history')
def get_history():
    user_id = session.get('user_id')
    history = SearchHistory.get_user_history(user_id)
    return jsonify([h.to_dict() for h in history])

# Favorites endpoints
@app.route('/api/favorites', methods=['GET', 'POST', 'DELETE'])
def manage_favorites():
    user_id = session.get('user_id')
    
    if request.method == 'GET':
        favorites = Favorite.get_user_favorites(user_id)
        return jsonify([{
            'id': f.id,
            'video_id': f.video_id,
            'title': f.title
        } for f in favorites])
    
    elif request.method == 'POST':
        data = request.get_json()
        favorite = Favorite(
            video_id=data['video_id'],
            user_id=user_id,
            title=data['title']
        )
        db.session.add(favorite)
        db.session.commit()
        return jsonify({'message': 'Added to favorites'})
    
    elif request.method == 'DELETE':
        video_id = request.args.get('video_id')
        db.session.query(Favorite)\
            .filter(Favorite.user_id == user_id)\
            .filter(Favorite.video_id == video_id)\
            .delete()
        db.session.commit()
        return jsonify({'message': 'Removed from favorites'})

# Analytics endpoints
@app.route('/api/analytics/trending')
@cache.cached(timeout=300)  # Cache for 5 minutes
def trending_searches():
    try:
        trending = SearchMetrics.get_trending()
        return jsonify([metric.to_dict() for metric in trending])
    except Exception as e:
        logging.error(f"Error getting trending searches: {e}", exc_info=True)
        return jsonify([])

@app.route('/analytics')
def analytics_dashboard():
    stats = {
        'total_searches': db.session.query(SearchMetrics).count(),
        'unique_users': db.session.query(SearchHistory.user_id.distinct()).count(),
        'trending': SearchMetrics.get_trending(5),
        'recent': SearchHistory.get_recent(5)
    }
    return render_template('analytics.html', stats=stats)

# Add caching headers
@app.after_request
def add_header(response):
    response.cache_control.max_age = 300
    return response

# Add debug logging for static files
@app.route('/static/<path:filename>')
def static_files(filename):
    print(f"Requesting static file: {filename}")
    return app.send_static_file(filename)

# Add file exists filter
@app.template_filter('file_exists')
def file_exists(path):
    full_path = os.path.join(app.static_folder, path)
    exists = os.path.isfile(full_path)
    print(f"Checking {full_path}: {'Found' if exists else 'Missing'}")
    return exists

if __name__ == '__main__':
    app.run(
        host='127.0.0.1',
        port=5000,
        debug=True  # Set to False in production
    )
