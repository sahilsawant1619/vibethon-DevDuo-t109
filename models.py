from flask_login import UserMixin
from utils.db import get_user_by_id, update_last_active

class User(UserMixin):
    """User model for Flask-Login"""
    
    def __init__(self, user_data):
        self.id = str(user_data['id'])
        self.email = user_data['email']
        self.password = user_data['password']
        self.fullname = user_data['fullname']
        self.points = user_data['points']
        self.level = user_data['level']
        self.streak = user_data['streak']
        self.last_active = user_data['last_active']
        self.badges = user_data['badges']
        self.created_at = user_data.get('created_at')
    
    def get_id(self):
        """Return user ID as string for Flask-Login"""
        return self.id
    
    def is_authenticated(self):
        """User is always authenticated if they have an ID"""
        return True
    
    def is_active(self):
        """User is always active"""
        return True
    
    def is_anonymous(self):
        """User is not anonymous"""
        return False
    
    def update_last_active(self):
        """Update user's last active date"""
        update_last_active(int(self.id))
    
    def get_badges_list(self):
        """Get badges as a list"""
        import json
        try:
            return json.loads(self.badges)
        except (json.JSONDecodeError, TypeError):
            return []
    
    def add_points(self, points):
        """Add points to user"""
        from utils.db import update_user_points
        new_points = self.points + points
        update_user_points(int(self.id), new_points)
        self.points = new_points
        return new_points
    
    def set_level(self, level):
        """Set user level"""
        from utils.db import update_user_level
        update_user_level(int(self.id), level)
        self.level = level
    
    def set_streak(self, streak):
        """Set user streak"""
        from utils.db import update_user_streak
        update_user_streak(int(self.id), streak)
        self.streak = streak
    
    def add_badge(self, badge):
        """Add badge to user"""
        from utils.db import add_user_badge
        add_user_badge(int(self.id), badge)
        
        # Update local badges list
        badges = self.get_badges_list()
        if badge not in badges:
            badges.append(badge)
            import json
            self.badges = json.dumps(badges)
    
    def calculate_level(self):
        """Calculate user level based on points"""
        if self.points >= 600:
            return 'Expert'
        elif self.points >= 300:
            return 'Advanced'
        elif self.points >= 100:
            return 'Intermediate'
        else:
            return 'Beginner'
    
    def update_level_if_needed(self):
        """Update user level if they've earned enough points"""
        new_level = self.calculate_level()
        if new_level != self.level:
            self.set_level(new_level)
            return True
        return False
    
    def get_points_to_next_level(self):
        """Get points needed to reach next level"""
        level_thresholds = {
            'Beginner': 100,
            'Intermediate': 300,
            'Advanced': 600,
            'Expert': 1000  # Cap for Expert level
        }
        
        if self.level == 'Expert':
            return 0
        
        current_threshold = level_thresholds.get(self.level, 0)
        next_threshold = level_thresholds.get(self.calculate_level(), 100)
        
        return max(0, next_threshold - self.points)
    
    def get_progress_percentage(self):
        """Get progress percentage to next level"""
        if self.level == 'Expert':
            return 100.0
        
        level_thresholds = {
            'Beginner': 0,
            'Intermediate': 100,
            'Advanced': 300,
            'Expert': 600
        }
        
        current_threshold = level_thresholds.get(self.level, 0)
        next_threshold = level_thresholds.get(self.calculate_level(), 100)
        
        if next_threshold > current_threshold:
            progress = ((self.points - current_threshold) / (next_threshold - current_threshold)) * 100
            return min(100.0, max(0.0, progress))
        
        return 100.0
    
    def check_badge_eligibility(self):
        """Check if user qualifies for new badges"""
        new_badges = []
        existing_badges = self.get_badges_list()
        
        # Code Runner badge - 5 code runs
        if 'Code Runner' not in existing_badges and self.points >= 50:
            new_badges.append('Code Runner')
        
        # Quiz Master badge - 10 quizzes (estimated from points)
        if 'Quiz Master' not in existing_badges and self.points >= 100:
            new_badges.append('Quiz Master')
        
        # Game Winner badge - 3 games (estimated from points)
        if 'Game Winner' not in existing_badges and self.points >= 75:
            new_badges.append('Game Winner')
        
        # Fast Learner badge - streak of 7 days
        if 'Fast Learner' not in existing_badges and self.streak >= 7:
            new_badges.append('Fast Learner')
        
        # Dedicated Student badge - 30 day streak
        if 'Dedicated Student' not in existing_badges and self.streak >= 30:
            new_badges.append('Dedicated Student')
        
        # AI Expert badge - Expert level
        if 'AI Expert' not in existing_badges and self.level == 'Expert':
            new_badges.append('AI Expert')
        
        # Award new badges
        for badge in new_badges:
            self.add_badge(badge)
        
        return new_badges
    
    def get_badge_icon(self, badge_name):
        """Get icon class for badge"""
        badge_icons = {
            'Code Runner': 'fas fa-code',
            'Quiz Master': 'fas fa-brain',
            'Game Winner': 'fas fa-trophy',
            'Fast Learner': 'fas fa-rocket',
            'Dedicated Student': 'fas fa-graduation-cap',
            'AI Expert': 'fas fa-award'
        }
        return badge_icons.get(badge_name, 'fas fa-medal')
    
    def get_badge_description(self, badge_name):
        """Get description for badge"""
        descriptions = {
            'Code Runner': 'Completed 5 coding exercises',
            'Quiz Master': 'Achieved high scores on 10 quizzes',
            'Game Winner': 'Won 3 mini-games',
            'Fast Learner': 'Maintained a 7-day learning streak',
            'Dedicated Student': 'Maintained a 30-day learning streak',
            'AI Expert': 'Reached Expert level in AI/ML'
        }
        return descriptions.get(badge_name, 'Achievement unlocked!')
    
    def to_dict(self):
        """Convert user to dictionary for API responses"""
        return {
            'id': self.id,
            'email': self.email,
            'fullname': self.fullname,
            'points': self.points,
            'level': self.level,
            'streak': self.streak,
            'badges': self.get_badges_list(),
            'points_to_next_level': self.get_points_to_next_level(),
            'progress_percentage': self.get_progress_percentage(),
            'next_level': self.calculate_level() if self.calculate_level() != self.level else 'Expert'
        }

def load_user(user_id):
    """Load user by ID for Flask-Login"""
    user_data = get_user_by_id(int(user_id))
    if user_data:
        return User(user_data)
    return None
