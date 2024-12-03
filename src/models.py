from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import declarative_base

db = SQLAlchemy()
Base = declarative_base()

class SearchHistory(db.Model):
    __tablename__ = 'search_history'
    
    id = db.Column(db.Integer, primary_key=True)
    query = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.String(50))
    results_count = db.Column(db.Integer)
    
    @classmethod
    def get_user_history(cls, user_id, limit=10):
        return db.session.query(cls)\
            .filter(cls.user_id == user_id)\
            .order_by(cls.timestamp.desc())\
            .limit(limit)\
            .all()
    
    def to_dict(self):
        return {
            'id': self.id,
            'query': self.query,
            'timestamp': self.timestamp.isoformat(),
            'results_count': self.results_count
        }

class Favorite(db.Model):
    __tablename__ = 'favorites'
    
    id = db.Column(db.Integer, primary_key=True)
    video_id = db.Column(db.String(20), nullable=False)
    user_id = db.Column(db.String(50))
    title = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    @classmethod
    def get_user_favorites(cls, user_id):
        return db.session.query(cls)\
            .filter(cls.user_id == user_id)\
            .all()

class SearchMetrics(db.Model):
    __tablename__ = 'search_metrics'
    
    id = db.Column(db.Integer, primary_key=True)
    query = db.Column(db.String(255), nullable=False)
    count = db.Column(db.Integer, default=0)
    last_searched = db.Column(db.DateTime, default=datetime.utcnow)
    
    @classmethod
    def get_or_create(cls, query):
        metric = db.session.query(cls)\
            .filter(cls.query == query)\
            .first()
        if not metric:
            metric = cls(query=query, count=0)
            db.session.add(metric)
        return metric
    
    @classmethod
    def get_trending(cls, limit=10):
        return db.session.query(cls)\
            .order_by(cls.count.desc())\
            .limit(limit)\
            .all()
    
    def to_dict(self):
        return {
            'query': self.query,
            'count': self.count,
            'last_searched': self.last_searched.isoformat()
        }