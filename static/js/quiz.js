// AI-Powered Quiz JavaScript
class QuizManager {
    constructor() {
        this.selectedTopic = null;
        this.currentQuestions = [];
        this.userAnswers = {};
        this.startTime = null;
        this.timerInterval = null;
        
        // Statistics
        this.stats = {
            totalQuizzes: 0,
            totalCorrect: 0,
            totalQuestions: 0,
            quizPoints: 0
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadStats();
    }
    
    bindEvents() {
        // Topic selection
        document.querySelectorAll('.topic-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectTopic(e.currentTarget.dataset.topic);
            });
        });
        
        // Generate quiz button
        document.getElementById('generateQuizBtn').addEventListener('click', () => {
            this.generateQuiz();
        });
        
        // Quiz actions
        document.getElementById('submitQuizBtn').addEventListener('click', () => {
            this.submitQuiz();
        });
        
        document.getElementById('backToTopicsBtn').addEventListener('click', () => {
            this.backToTopics();
        });
        
        // Results actions
        document.getElementById('newQuizBtn').addEventListener('click', () => {
            this.newQuiz();
        });
        
        document.getElementById('backToDashboardBtn').addEventListener('click', () => {
            window.location.href = '/dashboard';
        });
        
        // Statistics
        document.getElementById('resetStatsBtn').addEventListener('click', () => {
            this.resetStats();
        });
    }
    
    selectTopic(topic) {
        this.selectedTopic = topic;
        
        // Update UI
        document.querySelectorAll('.topic-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        document.querySelector(`[data-topic="${topic}"]`).classList.add('selected');
        
        // Update selected topic display
        document.getElementById('selectedTopic').querySelector('.topic-value').textContent = topic;
        document.getElementById('generateQuizBtn').disabled = false;
    }
    
    async generateQuiz() {
        if (!this.selectedTopic) {
            this.showToast('Please select a topic first', 'warning');
            return;
        }
        
        this.setLoadingState(true);
        
        try {
            const response = await fetch('/quiz/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic: this.selectedTopic })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.currentQuestions = result.questions;
                this.startQuiz();
            } else {
                throw new Error(result.error || 'Failed to generate quiz');
            }
            
        } catch (error) {
            console.error('Error generating quiz:', error);
            this.showToast('Error: ' + error.message, 'error');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    startQuiz() {
        // Reset state
        this.userAnswers = {};
        this.startTime = Date.now();
        
        // Update UI
        document.getElementById('topicSection').style.display = 'none';
        document.getElementById('quizSection').style.display = 'block';
        document.getElementById('topicDisplay').textContent = this.selectedTopic;
        
        // Start timer
        this.startTimer();
        
        // Render questions
        this.renderQuestions();
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
    renderQuestions() {
        const container = document.getElementById('questionsContainer');
        container.innerHTML = '';
        
        this.currentQuestions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-card';
            questionDiv.innerHTML = `
                <div class="question-header">
                    <span class="question-number">Question ${index + 1}</span>
                    <span class="question-points">10 points</span>
                </div>
                <div class="question-text">${question.question}</div>
                <div class="options-container">
                    ${question.options.map((option, optIndex) => `
                        <label class="option-label">
                            <input type="radio" name="question_${index}" value="${optIndex}" class="option-radio">
                            <span class="option-text">${option}</span>
                        </label>
                    `).join('')}
                </div>
            `;
            container.appendChild(questionDiv);
        });
        
        // Add change listeners
        container.querySelectorAll('.option-radio').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const questionIndex = e.target.name.split('_')[1];
                this.userAnswers[questionIndex] = parseInt(e.target.value);
            });
        });
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('timer').textContent = 
                `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    async submitQuiz() {
        // Check if all questions are answered
        if (Object.keys(this.userAnswers).length !== this.currentQuestions.length) {
            this.showToast('Please answer all questions', 'warning');
            return;
        }
        
        this.setLoadingState(true);
        this.stopTimer();
        
        try {
            const response = await fetch('/quiz/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: this.selectedTopic,
                    answers: this.userAnswers,
                    questions: this.currentQuestions
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.showResults(result);
                this.updateStats(result);
            } else {
                throw new Error(result.error || 'Failed to submit quiz');
            }
            
        } catch (error) {
            console.error('Error submitting quiz:', error);
            this.showToast('Error: ' + error.message, 'error');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    showResults(result) {
        const { score, totalQuestions, correctAnswers, percentage, achievements } = result;
        
        // Update UI
        document.getElementById('quizSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';
        
        // Score display
        document.getElementById('scoreDisplay').textContent = `${score}/${totalQuestions}`;
        document.getElementById('percentageDisplay').textContent = `${percentage}%`;
        
        // Performance analysis
        this.showPerformanceAnalysis(percentage, result.timeSpent);
        
        // Answers review
        this.showAnswersReview(correctAnswers);
        
        // Achievements
        this.showAchievements(achievements);
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
    showPerformanceAnalysis(percentage, timeSpent) {
        const analysis = document.getElementById('performanceAnalysis');
        
        let performance = '';
        let icon = '';
        let color = '';
        
        if (percentage >= 90) {
            performance = 'Excellent!';
            icon = 'fa-trophy';
            color = 'excellent';
        } else if (percentage >= 80) {
            performance = 'Great Job!';
            icon = 'fa-star';
            color = 'good';
        } else if (percentage >= 70) {
            performance = 'Good Effort!';
            icon = 'fa-thumbs-up';
            color = 'average';
        } else {
            performance = 'Keep Practicing!';
            icon = 'fa-book';
            color = 'needs-improvement';
        }
        
        analysis.innerHTML = `
            <div class="performance-card ${color}">
                <div class="performance-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="performance-content">
                    <h4>${performance}</h4>
                    <p>You scored ${percentage}% on this quiz</p>
                    <p>Time spent: ${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s</p>
                </div>
            </div>
        `;
    }
    
    showAnswersReview(correctAnswers) {
        const review = document.getElementById('answersReview');
        
        review.innerHTML = `
            <h4>Answers Review</h4>
            <div class="answers-grid">
                ${this.currentQuestions.map((question, index) => {
                    const isCorrect = correctAnswers[index];
                    const userAnswer = this.userAnswers[index];
                    const correctAnswerIndex = question.correct_answer;
                    
                    return `
                        <div class="answer-item ${isCorrect ? 'correct' : 'incorrect'}">
                            <div class="answer-header">
                                <span class="answer-number">Q${index + 1}</span>
                                <span class="answer-status">
                                    <i class="fas ${isCorrect ? 'fa-check' : 'fa-times'}"></i>
                                    ${isCorrect ? 'Correct' : 'Incorrect'}
                                </span>
                            </div>
                            <div class="answer-question">${question.question}</div>
                            <div class="answer-details">
                                <p><strong>Your answer:</strong> ${question.options[userAnswer]}</p>
                                ${!isCorrect ? `<p><strong>Correct answer:</strong> ${question.options[correctAnswerIndex]}</p>` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    showAchievements(achievements) {
        const achievementsDiv = document.getElementById('achievements');
        
        if (achievements.length === 0) {
            achievementsDiv.innerHTML = '';
            return;
        }
        
        achievementsDiv.innerHTML = `
            <h4>New Achievements!</h4>
            <div class="achievements-grid">
                ${achievements.map(achievement => `
                    <div class="achievement-badge">
                        <div class="achievement-icon">
                            <i class="fas ${achievement.icon}"></i>
                        </div>
                        <div class="achievement-content">
                            <h5>${achievement.name}</h5>
                            <p>${achievement.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    updateStats(result) {
        const { score, totalQuestions, pointsEarned } = result;
        
        // Update local stats
        this.stats.totalQuizzes++;
        this.stats.totalCorrect += score;
        this.stats.totalQuestions += totalQuestions;
        this.stats.quizPoints += pointsEarned;
        
        // Update display
        this.updateStatsDisplay();
        
        // Save to localStorage
        this.saveStats();
        
        // Log for debugging
        console.log(`Quiz completed: ${score}/${totalQuestions}, Points: ${pointsEarned}`);
    }
    
    updateStatsDisplay() {
        document.getElementById('totalQuizzes').textContent = this.stats.totalQuizzes;
        document.getElementById('totalCorrect').textContent = this.stats.totalCorrect;
        document.getElementById('quizPoints').textContent = this.stats.quizPoints;
        
        const avgScore = this.stats.totalQuestions > 0 
            ? Math.round((this.stats.totalCorrect / this.stats.totalQuestions) * 100)
            : 0;
        document.getElementById('avgScore').textContent = `${avgScore}%`;
    }
    
    saveStats() {
        localStorage.setItem('quizStats', JSON.stringify(this.stats));
    }
    
    loadStats() {
        const saved = localStorage.getItem('quizStats');
        if (saved) {
            this.stats = JSON.parse(saved);
            this.updateStatsDisplay();
        }
    }
    
    resetStats() {
        if (confirm('Are you sure you want to reset all quiz statistics?')) {
            this.stats = {
                totalQuizzes: 0,
                totalCorrect: 0,
                totalQuestions: 0,
                quizPoints: 0
            };
            this.updateStatsDisplay();
            this.saveStats();
            this.showToast('Statistics reset successfully', 'success');
        }
    }
    
    backToTopics() {
        this.stopTimer();
        document.getElementById('quizSection').style.display = 'none';
        document.getElementById('topicSection').style.display = 'block';
        this.selectedTopic = null;
        this.currentQuestions = [];
        this.userAnswers = {};
        
        // Reset UI
        document.querySelectorAll('.topic-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.getElementById('selectedTopic').querySelector('.topic-value').textContent = 'None';
        document.getElementById('generateQuizBtn').disabled = true;
    }
    
    newQuiz() {
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('topicSection').style.display = 'block';
        this.backToTopics();
    }
    
    setLoadingState(loading) {
        const generateBtn = document.getElementById('generateQuizBtn');
        const submitBtn = document.getElementById('submitQuizBtn');
        
        if (loading) {
            if (generateBtn) {
                generateBtn.disabled = true;
                generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            }
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            }
        } else {
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Quiz';
            }
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Submit Quiz';
            }
        }
    }
    
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add to page
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Initialize quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizManager();
});
