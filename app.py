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
        'points': current_user.points,
        'level': current_user.level,
        'streak': current_user.streak,
        'badges': current_user.get_badges_list(),
        'fullname': current_user.fullname,
        'email': current_user.email
    }
    
    # Calculate level progress (example thresholds)
    level_thresholds = {
        'Beginner': 0,
        'Intermediate': 100,
        'Advanced': 300,
        'Expert': 600
    }
    
    current_level_threshold = level_thresholds.get(current_user.level, 0)
    next_level = 'Expert'  # Default for highest level
    next_level_threshold = 1000  # Default for highest level
    
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

@app.route('/learn/beginner')
def learn_beginner():
    return render_template('learn.html')

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