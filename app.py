from flask import Flask, render_template, redirect, url_for, request, jsonify
from flask_login import LoginManager, current_user, login_required
from auth import auth_bp
from models import load_user
from utils.db import init_db, update_user_points, add_user_badge, get_leaderboard
from utils.code_runner import run_python_code
from utils.spam_sim import classify_spam, get_spam_explanation
from utils.ai_helper import AIHelper
from utils.fallback_manager import get_fallback_quiz

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
    
    progress_percentage = min(100, ((current_user.points - current_threshold) / 
                                   (next_level_threshold - current_threshold)) * 100) if next_level_threshold > current_threshold else 100
    
    user_stats.update({
        'next_level': next_level,
        'progress_percentage': round(progress_percentage, 1),
        'points_to_next_level': max(0, next_level_threshold - current_user.points)
    })
    
    return render_template('dashboard.html', stats=user_stats)

@app.route('/learn/<level>')
@login_required
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
@login_required
def coding():
    return render_template('coding.html')

@app.route('/run-code', methods=['POST'])
@login_required
def run_code():
    """Execute Python code safely"""
    try:
        # Get JSON data
        data = request.get_json()
        if not data or 'code' not in data:
            return jsonify({'error': 'No code provided'}), 400
        
        code = data['code']
        
        # Check code length (prevent too large code)
        if len(code) > 10000:  # 10KB limit
            return jsonify({'error': 'Code too long (max 10KB)'}), 413
        
        # Execute code safely
        result = run_python_code(code)
        
        # Log successful execution (for future points system)
        if result['output'] and not result['error']:
            print(f"User {current_user.email} executed code successfully")
            # TODO: Add points update in Phase C
            # update_user_points(current_user.id, 5)  # 5 points for code execution
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in run_code route: {str(e)}")
        return jsonify({'error': 'Server error occurred'}), 500

@app.route('/game')
@login_required
def game():
    return render_template('game.html')

@app.route('/simulation')
@login_required
def simulation():
    return render_template('simulation.html')

@app.route('/simulation/predict', methods=['POST'])
@login_required
def predict_spam():
    """Classify text as spam or ham with AI explanation"""
    try:
        # Get JSON data
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text'].strip()
        
        # Check text length
        if not text:
            return jsonify({'error': 'Empty text provided'}), 400
        
        if len(text) > 500:
            return jsonify({'error': 'Text too long (max 500 characters)'}), 413
        
        # Classify the message
        result = classify_spam(text)
        
        # Get AI explanation asynchronously
        import asyncio
        try:
            # Create event loop for async operation
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            # Get AI explanation
            explanation = loop.run_until_complete(
                get_spam_explanation(text, result['prediction'], result['keywords_found'])
            )
            
            result['explanation'] = explanation
            
        except Exception as e:
            print(f"Error getting AI explanation: {str(e)}")
            # Use fallback explanation
            if result['prediction'] == 'spam':
                result['explanation'] = f"This message was classified as spam because it contains {len(result['keywords_found'])} spam indicators: {', '.join(result['keywords_found'])}. These keywords are commonly associated with unsolicited promotional or fraudulent messages."
            else:
                if result['keywords_found']:
                    result['explanation'] = f"This message was classified as legitimate despite containing {len(result['keywords_found'])} potentially suspicious keywords: {', '.join(result['keywords_found'])}. However, the overall context and limited keyword count suggest it's a legitimate message."
                else:
                    result['explanation'] = "This message was classified as legitimate because it doesn't contain typical spam indicators and appears to have normal communication patterns."
        finally:
            loop.close()
        
        # Log successful classification
        print(f"User {current_user.email} classified message as {result['prediction']} with {result['confidence']} confidence")
        
        # TODO: Add points update in Phase C
        # update_user_points(current_user.id, 3)  # 3 points for simulation
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in predict_spam route: {str(e)}")
        return jsonify({'error': 'Server error occurred'}), 500

@app.route('/quiz')
@login_required
def quiz():
    return render_template('quiz.html')

@app.route('/quiz/generate', methods=['POST'])
@login_required
def generate_quiz():
    """Generate AI-powered quiz questions"""
    try:
        # Get JSON data
        data = request.get_json()
        if not data or 'topic' not in data:
            return jsonify({'error': 'No topic provided'}), 400
        
        topic = data['topic']
        
        # Validate topic
        valid_topics = ['Linear Regression', 'Neural Networks', 'Overfitting', 'Decision Trees', 'Clustering']
        if topic not in valid_topics:
            return jsonify({'error': 'Invalid topic'}), 400
        
        # Create AI helper
        ai_helper = AIHelper()
        
        # Generate quiz prompt
        prompt = f"""Generate 5 multiple choice questions about {topic} for machine learning students.
        
Return the response in this exact JSON format:
{{
    "questions": [
        {{
            "question": "What is the main purpose of linear regression?",
            "options": ["Classification", "Regression", "Clustering", "Dimensionality reduction"],
            "correct_answer": 1
        }},
        ...
    ]
}}

Each question should:
- Be clear and concise
- Have 4 options (A, B, C, D)
- Have exactly one correct answer (0-3 index)
- Be appropriate for intermediate ML students
- Test important concepts in {topic}"""
        
        # Try to get AI response
        try:
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            response = loop.run_until_complete(
                ai_helper.call_ai_with_fallback(prompt, fallback_type='quiz', topic=topic)
            )
            
            # Parse JSON response
            import json
            try:
                quiz_data = json.loads(response)
                questions = quiz_data.get('questions', [])
                
                # Validate questions
                if len(questions) != 5:
                    raise ValueError("Not enough questions")
                
                for q in questions:
                    if not all(key in q for key in ['question', 'options', 'correct_answer']):
                        raise ValueError("Missing required fields")
                    if len(q['options']) != 4:
                        raise ValueError("Each question must have 4 options")
                    if not isinstance(q['correct_answer'], int) or q['correct_answer'] < 0 or q['correct_answer'] > 3:
                        raise ValueError("Invalid correct_answer index")
                
                return jsonify({'questions': questions})
                
            except (json.JSONDecodeError, ValueError) as e:
                print(f"Error parsing AI response: {str(e)}")
                # Fall back to fallback questions
                raise Exception("Invalid AI response")
                
        except Exception as e:
            print(f"AI generation failed: {str(e)}")
            # Use fallback questions
            fallback_questions = get_fallback_quiz(topic)
            return jsonify({'questions': fallback_questions})
            
        finally:
            loop.close()
        
    except Exception as e:
        print(f"Error in generate_quiz: {str(e)}")
        return jsonify({'error': 'Failed to generate quiz'}), 500

@app.route('/quiz/submit', methods=['POST'])
@login_required
def submit_quiz():
    """Submit quiz answers and calculate score"""
    try:
        # Get JSON data
        data = request.get_json()
        if not data or 'answers' not in data or 'questions' not in data:
            return jsonify({'error': 'Missing required data'}), 400
        
        answers = data['answers']
        questions = data['questions']
        topic = data.get('topic', 'Unknown')
        
        # Validate data
        if len(answers) != len(questions):
            return jsonify({'error': 'Answers count mismatch'}), 400
        
        # Calculate score
        correct_count = 0
        correct_answers = {}
        
        for i, question in enumerate(questions):
            user_answer = answers.get(str(i))
            correct_answer = question['correct_answer']
            
            if user_answer == correct_answer:
                correct_count += 1
                correct_answers[i] = True
            else:
                correct_answers[i] = False
        
        # Calculate metrics
        total_questions = len(questions)
        score = correct_count
        percentage = round((score / total_questions) * 100, 1)
        points_earned = score * 10  # 10 points per correct answer
        
        # Calculate time spent (placeholder - would need to track from frontend)
        time_spent = 300  # 5 minutes default
        
        # Update user points
        try:
            update_user_points(current_user.id, points_earned)
            print(f"Updated {current_user.email} points: +{points_earned}")
        except Exception as e:
            print(f"Error updating points: {str(e)}")
        
        # Check for badges
        achievements = []
        try:
            # Check for Quiz Master badge (80%+ score)
            if percentage >= 80:
                add_user_badge(current_user.id, "Quiz Master")
                achievements.append({
                    'name': 'Quiz Master',
                    'description': 'Scored 80% or higher on a quiz',
                    'icon': 'fa-trophy'
                })
            
            # Check for Perfect Score badge
            if percentage == 100:
                add_user_badge(current_user.id, "Perfect Score")
                achievements.append({
                    'name': 'Perfect Score',
                    'description': 'Achieved 100% on a quiz',
                    'icon': 'fa-star'
                })
                
        except Exception as e:
            print(f"Error updating badges: {str(e)}")
        
        result = {
            'score': score,
            'totalQuestions': total_questions,
            'correctAnswers': correct_answers,
            'percentage': percentage,
            'pointsEarned': points_earned,
            'timeSpent': time_spent,
            'achievements': achievements,
            'topic': topic
        }
        
        print(f"Quiz submitted by {current_user.email}: {score}/{total_questions} ({percentage}%)")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in submit_quiz: {str(e)}")
        return jsonify({'error': 'Failed to submit quiz'}), 500

@app.route('/leaderboard')
@login_required
def leaderboard():
    from utils.db import get_leaderboard
    leaderboard_data = get_leaderboard(limit=10)
    return render_template('leaderboard.html', leaderboard=leaderboard_data, current_user=current_user)

@app.route('/chat')
def chat():
    return render_template('chat.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)