"""Deterministic fallback responses when AI APIs fail."""

def get_fallback_quiz(topic: str) -> list:
    """Return static quiz questions for given topic."""
    topic_lower = topic.lower()
    
    # Topic-specific fallback quizzes
    if "linear regression" in topic_lower:
        return [
            {
                "question": "What is the main purpose of linear regression?",
                "options": ["Classification", "Regression", "Clustering", "Dimensionality reduction"],
                "correct_answer": 1
            },
            {
                "question": "In linear regression, what does the coefficient represent?",
                "options": ["Intercept", "Slope", "Error term", "Correlation"],
                "correct_answer": 1
            },
            {
                "question": "Which method is commonly used to find the best-fit line in linear regression?",
                "options": ["Random search", "Gradient descent", "Ordinary Least Squares", "K-means"],
                "correct_answer": 2
            },
            {
                "question": "What is R-squared in linear regression?",
                "options": ["Error rate", "Coefficient of determination", "Learning rate", "Regularization parameter"],
                "correct_answer": 1
            },
            {
                "question": "Multicollinearity occurs when:",
                "options": [
                    "Features are independent",
                    "Features are highly correlated",
                    "Features have zero variance",
                    "Features are categorical"
                ],
                "correct_answer": 1
            }
        ]
    elif "neural networks" in topic_lower:
        return [
            {
                "question": "What is a neuron in a neural network?",
                "options": ["A data point", "A computational unit", "A weight", "A bias"],
                "correct_answer": 1
            },
            {
                "question": "What is backpropagation used for?",
                "options": ["Forward pass", "Training the network", "Data preprocessing", "Feature selection"],
                "correct_answer": 1
            },
            {
                "question": "Which activation function is most commonly used in hidden layers?",
                "options": ["Step function", "Sigmoid", "ReLU", "Linear"],
                "correct_answer": 2
            },
            {
                "question": "What is the purpose of the loss function?",
                "options": ["To activate neurons", "To measure error", "To regularize weights", "To normalize data"],
                "correct_answer": 1
            },
            {
                "question": "Deep learning refers to neural networks with:",
                "options": ["Many layers", "Many neurons", "Many features", "Many outputs"],
                "correct_answer": 0
            }
        ]
    elif "overfitting" in topic_lower:
        return [
            {
                "question": "What does 'overfitting' mean?",
                "options": [
                    "Model performs well on training but poorly on new data",
                    "Model is too simple",
                    "Model has too little data",
                    "Model trains too fast"
                ],
                "correct_answer": 0
            },
            {
                "question": "Which technique helps prevent overfitting?",
                "options": ["Increasing model complexity", "Adding more features", "Regularization", "Removing training data"],
                "correct_answer": 2
            },
            {
                "question": "What is the bias-variance tradeoff?",
                "options": [
                    "Balance between model simplicity and complexity",
                    "Balance between speed and accuracy",
                    "Balance between memory and computation",
                    "Balance between training and testing"
                ],
                "correct_answer": 0
            },
            {
                "question": "Cross-validation helps with:",
                "options": ["Speed", "Overfitting", "Data cleaning", "Feature selection"],
                "correct_answer": 1
            },
            {
                "question": "Early stopping is a form of:",
                "options": ["Regularization", "Optimization", "Normalization", "Activation"],
                "correct_answer": 0
            }
        ]
    elif "decision trees" in topic_lower:
        return [
            {
                "question": "What is a decision tree?",
                "options": [
                    "A linear model",
                    "A tree-based model that makes predictions by learning rules",
                    "A neural network",
                    "A clustering algorithm"
                ],
                "correct_answer": 1
            },
            {
                "question": "Which criterion is used to split nodes in decision trees?",
                "options": ["Accuracy", "Precision", "Information gain/Gini impurity", "Correlation"],
                "correct_answer": 2
            },
            {
                "question": "What is pruning in decision trees?",
                "options": ["Adding more branches", "Removing unnecessary branches", "Changing the root", "Normalizing features"],
                "correct_answer": 1
            },
            {
                "question": "Random Forest is an ensemble of:",
                "options": ["Linear models", "Decision trees", "Neural networks", "Clustering algorithms"],
                "correct_answer": 1
            },
            {
                "question": "What is the main advantage of decision trees?",
                "options": ["Speed", "Interpretability", "Accuracy", "Memory efficiency"],
                "correct_answer": 1
            }
        ]
    elif "clustering" in topic_lower:
        return [
            {
                "question": "What is clustering?",
                "options": [
                    "Classification task",
                    "Unsupervised learning that groups similar data points",
                    "Regression task",
                    "Feature selection method"
                ],
                "correct_answer": 1
            },
            {
                "question": "Which algorithm uses centroids to cluster data?",
                "options": ["Hierarchical clustering", "K-means", "DBSCAN", "Random Forest"],
                "correct_answer": 1
            },
            {
                "question": "What is the elbow method used for?",
                "options": ["Feature selection", "Determining optimal number of clusters", "Regularization", "Normalization"],
                "correct_answer": 1
            },
            {
                "question": "Which clustering algorithm doesn't require the number of clusters?",
                "options": ["K-means", "Gaussian Mixture", "DBSCAN", "Agglomerative clustering"],
                "correct_answer": 2
            },
            {
                "question": "Hierarchical clustering produces:",
                "options": ["Flat clusters", "A tree of clusters", "Spherical clusters", "Linear clusters"],
                "correct_answer": 1
            }
        ]
    
    # Default fallback quiz (general ML)
    return [
        {
            "question": "What is supervised learning?",
            "options": [
                "Learning with labeled data",
                "Learning without labels",
                "Learning by rewards",
                "Learning from sequences"
            ],
            "correct_answer": 0
        },
        {
            "question": "Which algorithm is used for classification?",
            "options": ["Linear Regression", "K-Means", "Logistic Regression", "PCA"],
            "correct_answer": 2
        },
        {
            "question": "What does 'overfitting' mean?",
            "options": [
                "Model performs well on training but poorly on new data",
                "Model is too simple",
                "Model has too little data",
                "Model trains too fast"
            ],
            "correct_answer": 0
        },
        {
            "question": "What is the purpose of cross-validation?",
            "options": [
                "To speed up training",
                "To evaluate model performance on unseen data",
                "To normalize features",
                "To reduce dimensionality"
            ],
            "correct_answer": 1
        },
        {
            "question": "Which metric is used for regression evaluation?",
            "options": ["Accuracy", "Precision", "Mean Squared Error", "F1-Score"],
            "correct_answer": 2
        }
    ]

def get_fallback_code_feedback(code: str, error: str) -> str:
    """Return static code feedback."""
    if "syntax" in error.lower():
        return "There's a syntax error in your code. Check for missing parentheses, brackets, or quotes."
    elif "name" in error.lower() and "not defined" in error.lower():
        return "You're using a variable that hasn't been defined. Make sure to assign a value before using it."
    elif "type" in error.lower():
        return "There's a type error. Make sure you're using the right data types for your operations."
    else:
        return f"Error: {error}. Try checking your code for common issues like typos, missing imports, or incorrect syntax."

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
