import os
import sys
import time
import shutil

def init_database():
    print("Initializing database...")
    
    # Get the instance directory path
    instance_dir = os.path.join(os.path.dirname(__file__), 'instance')
    
    # Remove entire instance directory if it exists
    if os.path.exists(instance_dir):
        print(f"Removing existing instance directory: {instance_dir}")
        shutil.rmtree(instance_dir, ignore_errors=True)
    
    # Create fresh instance directory
    print("Creating new instance directory...")
    os.makedirs(instance_dir)
    
    # Now initialize the database
    print("Creating new database...")
    from uncycle import app, db
    with app.app_context():
        db.create_all()
        print("Database initialized successfully!")

if __name__ == "__main__":
    try:
        init_database()
    except Exception as e:
        print(f"Error initializing database: {e}")
        sys.exit(1) 