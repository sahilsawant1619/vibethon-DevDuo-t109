"""Deterministic fallback responses when AI APIs fail."""

def get_fallback_quiz(topic: str) -> list:
    """Return static quiz questions for given topic."""
    topic_lower = topic.lower()
    # Default fallback quiz (general ML)
    default_quiz = [
        {
            "question": "What is supervised learning?",
            "options": [
                "Learning with labeled data",
                "Learning without labels",
                "Learning by rewards",
                "Learning from sequences"
            ],
            "answer": 0
        },
        {
            "question": "Which algorithm is used for classification?",
            "options": ["Linear Regression", "K-Means", "Logistic Regression", "PCA"],
            "answer": 2
        },
        {
            "question": "What does 'overfitting' mean?",
            "options": [
                "Model performs well on training but poorly on new data",
                "Model is too simple",
                "Model has too little data",
                "Model trains too fast"
            ],
            "answer": 0
        },
        {
            "question": "Which library is most common for deep learning in Python?",
            "options": ["Scikit-learn", "Pandas", "TensorFlow", "Matplotlib"],
            "answer": 2
        },
        {
            "question": "What is the purpose of a confusion matrix?",
            "options": [
                "Visualize model errors",
                "Speed up training",
                "Reduce overfitting",
                "Generate more data"
            ],
            "answer": 0
        }
    ]
    
    # Topic-specific fallback (simple mapping)
    if "regression" in topic_lower:
        return [
            {
                "question": "What is linear regression?",
                "options": ["Predict continuous value", "Classify categories", "Cluster data", "Reduce dimensions"],
                "answer": 0
            },
            {
                "question": "Which metric is used for regression?",
                "options": ["Accuracy", "MSE", "F1-score", "Precision"],
                "answer": 1
            }
        ] + default_quiz[:3]
    elif "neural network" in topic_lower or "deep learning" in topic_lower:
        return [
            {
                "question": "What is an activation function?",
                "options": ["Adds non-linearity", "Normalizes inputs", "Reduces parameters", "Speeds up training"],
                "answer": 0
            },
            {
                "question": "Which is a common activation function?",
                "options": ["ReLU", "SVM", "KNN", "PCA"],
                "answer": 0
            }
        ] + default_quiz[:3]
    else:
        return default_quiz

def get_fallback_code_feedback(code: str, error: str = "") -> str:
    """Return static feedback for common code errors."""
    if "NameError" in error or "undefined" in error:
        return "💡 Tip: You're using a variable that hasn't been defined. Check your spelling or define it first."
    elif "SyntaxError" in error:
        return "💡 Tip: There's a syntax error – check missing colons, brackets, or indentation."
    elif "IndentationError" in error:
        return "💡 Tip: Python relies on indentation. Make sure your code blocks are aligned consistently."
    elif "ZeroDivisionError" in error:
        return "💡 Tip: You're dividing by zero! Add a condition to prevent that."
    elif not error and code.strip():
        return "✅ Your code ran successfully! Try modifying it or ask for a suggestion."
    else:
        return "🤔 I couldn't analyze your code. Try asking a specific question about ML concepts."

def get_fallback_chat_answer(question: str) -> str:
    """Static FAQ responses for chatbot."""
    q = question.lower()
    if "overfitting" in q:
        return "Overfitting happens when your model learns the training data too well, including noise. Use more data, simplify the model, or add regularization."
    elif "underfitting" in q:
        return "Underfitting means the model is too simple to capture patterns. Try a more complex model or better features."
    elif "loss function" in q:
        return "A loss function measures how wrong your model's predictions are. Lower loss = better performance."
    elif "gradient descent" in q:
        return "Gradient descent is an optimization algorithm that adjusts model parameters to minimize the loss function."
    elif "cnn" in q or "convolution" in q:
        return "CNNs (Convolutional Neural Networks) are great for image tasks. They learn spatial hierarchies of features."
    elif "rnn" in q or "recurrent" in q:
        return "RNNs are for sequential data like text or time series. They have memory of previous inputs."
    else:
        return "That's a great question! In ML, start by exploring the data, then choose an algorithm, train, and evaluate. Want me to explain a specific topic?"
