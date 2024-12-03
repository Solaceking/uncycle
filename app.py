from flask import jsonify, request
import requests

@app.route('/search')
def search():
    query = request.args.get('q', '')
    page = int(request.args.get('page', 1))
    sort = request.args.get('sort', 'relevance')
    duration = request.args.get('duration', 'any')
    
    print(f"Search request: query={query}, page={page}, sort={sort}, duration={duration}")
    
    try:
        # Example search results (replace with your actual search logic)
        results = {
            'items': [
                {
                    'id': 'example1',
                    'title': f'How to reuse {query} - Tutorial 1',
                    'thumbnail': 'https://via.placeholder.com/320x180.png',
                    'description': f'Learn how to transform {query} into something useful',
                    'duration': '5:30',
                    'views': '1.2K views'
                },
                {
                    'id': 'example2',
                    'title': f'Creative {query} projects',
                    'thumbnail': 'https://via.placeholder.com/320x180.png',
                    'description': f'Amazing DIY ideas using {query}',
                    'duration': '8:45',
                    'views': '3.4K views'
                }
                # Add more example results as needed
            ],
            'hasMore': False,
            'nextPage': page + 1
        }
        return jsonify(results)
    except Exception as e:
        print(f"Search error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Add these helper functions if needed
def perform_search(query, page, sort, duration):
    # Implement your actual search logic here
    # This could involve calling an external API, searching a database, etc.
    # For now, return some example data
    return {
        'items': [
            {
                'id': f'video{i}',
                'title': f'Tutorial {i} for {query}',
                'thumbnail': f'https://via.placeholder.com/320x180.png?text=Tutorial+{i}',
                'description': f'Learn how to reuse {query} in creative way {i}',
                'duration': f'{i+2}:30',
                'views': f'{i*1000} views'
            }
            for i in range(1, 6)  # 5 results per page
        ],
        'hasMore': page < 3,  # Example: only show 3 pages
        'nextPage': page + 1
    } 