import pytest
from uncycle import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_home_page(client):
    rv = client.get('/')
    assert rv.status_code == 200
    assert b'Uncycle' in rv.data

def test_search_endpoint(client):
    rv = client.get('/search?q=plastic')
    assert rv.status_code == 200
    json_data = rv.get_json()
    assert 'items' in json_data
    assert 'hasMore' in json_data

def test_empty_search(client):
    rv = client.get('/search')
    assert rv.status_code == 200
    json_data = rv.get_json()
    assert 'error' in json_data 