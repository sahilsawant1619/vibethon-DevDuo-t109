# Gamification logic for badge awarding

def check_and_award_badges(user_id, action_type):
    """
    Check and award badges based on user actions.
    action_type: 'register', 'code_run', 'quiz', 'game', 'spam', 'chat'
    """
    # Example logic (DB access required)
    # This is a placeholder; actual implementation should update DB
    pass

BADGE_CONDITIONS = {
    "First Step": "register",
    "Code Runner": "5 code runs",
    "Quiz Master": "3 quizzes with >80% score",
    "Game Winner": "complete decision tree game",
    "Spam Hunter": "use spam simulator 3 times",
    "Chatty": "10 chat messages"
}
