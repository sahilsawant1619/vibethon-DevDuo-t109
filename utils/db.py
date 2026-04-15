import sqlite3
import json
from datetime import datetime
from flask import current_app

# Database file path
DB_PATH = 'users.db'

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database with users table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            fullname TEXT NOT NULL,
            points INTEGER DEFAULT 0,
            level TEXT DEFAULT 'Beginner',
            streak INTEGER DEFAULT 0,
            last_active DATE,
            badges TEXT DEFAULT '[]',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def get_user_by_email(email):
    """Get user by email"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    
    conn.close()
    return dict(user) if user else None

def get_user_by_id(user_id):
    """Get user by ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    
    conn.close()
    return dict(user) if user else None

def create_user(email, password_hash, fullname):
    """Create new user"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO users (email, password, fullname, last_active)
            VALUES (?, ?, ?, ?)
        ''', (email, password_hash, fullname, datetime.now().date()))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return user_id
    except sqlite3.IntegrityError:
        conn.close()
        return None

def update_user_points(user_id, points):
    """Update user points"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE users SET points = ? WHERE id = ?
    ''', (points, user_id))
    
    conn.commit()
    conn.close()

def update_user_level(user_id, level):
    """Update user level"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE users SET level = ? WHERE id = ?
    ''', (level, user_id))
    
    conn.commit()
    conn.close()

def update_user_streak(user_id, streak):
    """Update user streak"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE users SET streak = ?, last_active = ? WHERE id = ?
    ''', (streak, datetime.now().date(), user_id))
    
    conn.commit()
    conn.close()

def add_user_badge(user_id, badge):
    """Add badge to user's badges list"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get current badges
    cursor.execute('SELECT badges FROM users WHERE id = ?', (user_id,))
    result = cursor.fetchone()
    badges = json.loads(result['badges']) if result else []
    
    # Add new badge if not already present
    if badge not in badges:
        badges.append(badge)
        badges_json = json.dumps(badges)
        
        cursor.execute('''
            UPDATE users SET badges = ? WHERE id = ?
        ''', (badges_json, user_id))
        
        conn.commit()
    
    conn.close()

def get_user_badges(user_id):
    """Get user badges as list"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT badges FROM users WHERE id = ?', (user_id,))
    result = cursor.fetchone()
    
    conn.close()
    
    if result:
        return json.loads(result['badges'])
    return []

def update_last_active(user_id):
    """Update user's last active date"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE users SET last_active = ? WHERE id = ?
    ''', (datetime.now().date(), user_id))
    
    conn.commit()
    conn.close()

def get_leaderboard(limit=10):
    """Get top users by points"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, fullname, points, level, badges 
        FROM users 
        ORDER BY points DESC 
        LIMIT ?
    ''', (limit,))
    
    users = cursor.fetchall()
    conn.close()
    
    return [dict(user) for user in users]
