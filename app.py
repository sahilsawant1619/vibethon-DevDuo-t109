from flask import Flask, render_template, redirect, url_for
from flask_login import LoginManager, current_user, login_required
from auth import auth_bp
from models import load_user
from utils.db import init_db

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Change this in production

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'
login_manager.login_message = 'Please log in to access this page.'
login_manager.login_message_category = 'info'

@login_manager.user_loader
def load_user_from_session(user_id):
    return load_user(user_id)

# Register auth blueprint
app.register_blueprint(auth_bp, url_prefix='/auth')

# Initialize database
init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
@login_required
def dashboard():
    # Get user stats
    user_stats = {
        'points': current_user.points if current_user.points else 0,
        'level': current_user.level if current_user.level else 'Beginner',
        'streak': current_user.streak if current_user.streak else 0,
        'badges': current_user.get_badges_list() if hasattr(current_user, 'get_badges_list') else [],
        'fullname': current_user.fullname if current_user.fullname else 'User',
        'points_to_next_level': 0,
        'next_level': 'Intermediate',
        'progress_percentage': 0
    }
    
    # Calculate level progress
    level_thresholds = {
        'Beginner': 0,
        'Intermediate': 100,
        'Advanced': 300,
        'Expert': 600
    }
    
    current_level = user_stats['level']
    current_points = user_stats['points']
    
    if current_level in level_thresholds:
        current_threshold = level_thresholds[current_level]
        # Find next level
        levels = list(level_thresholds.keys())
        current_index = levels.index(current_level)
        if current_index < len(levels) - 1:
            next_level = levels[current_index + 1]
            next_threshold = level_thresholds[next_level]
            user_stats['next_level'] = next_level
            user_stats['points_to_next_level'] = next_threshold - current_points
            user_stats['progress_percentage'] = min(100, max(0, ((current_points - current_threshold) / (next_threshold - current_threshold) * 100)) if next_threshold > current_threshold else 0)
        else:
            user_stats['next_level'] = 'Expert'
            user_stats['points_to_next_level'] = 0
            user_stats['progress_percentage'] = 100
    # Find next level
    levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    current_index = levels.index(current_user.level) if current_user.level in levels else 0
    if current_index < len(levels) - 1:
        next_level = levels[current_index + 1]
        next_level_threshold = level_thresholds.get(next_level, 1000)
    
    progress_percentage = min(100, ((current_user.points - current_level_threshold) / 
                                   (next_level_threshold - current_level_threshold)) * 100) if next_level_threshold > current_level_threshold else 100
    
    user_stats.update({
        'next_level': next_level,
        'progress_percentage': round(progress_percentage, 1),
        'points_to_next_level': max(0, next_level_threshold - current_user.points)
    })
    
    return render_template('dashboard.html', stats=user_stats)

@app.route('/learn/<level>')
def learn_level(level):
    """Handle learning module routes for different levels"""
    valid_levels = ['beginner', 'intermediate', 'advanced']
    
    if level not in valid_levels:
        return "Invalid learning level", 404
    
    template_map = {
        'beginner': 'learn_beginner.html',
        'intermediate': 'learn_intermediate.html',
        'advanced': 'learn_advanced.html'
    }
    
    return render_template(template_map[level])

@app.route('/coding')
def coding():
    return render_template('coding.html')

@app.route('/game')
def game():
    return render_template('game.html')

@app.route('/simulation')
def simulation():
    return render_template('simulation.html')

@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

@app.route('/leaderboard')
def leaderboard():
    return render_template('leaderboard.html')

@app.route('/chat')
def chat():
    return render_template('chat.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)