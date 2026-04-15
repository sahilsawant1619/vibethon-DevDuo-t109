// Spam Classifier Simulation JavaScript
class SpamSimulation {
    constructor() {
        this.messageText = document.getElementById('messageText');
        this.classifyBtn = document.getElementById('classifyBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.exampleBtn = document.getElementById('exampleBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.examplesSection = document.getElementById('examplesSection');
        this.charCount = document.getElementById('charCount');
        
        // Statistics
        this.stats = {
            spamCount: 0,
            hamCount: 0,
            totalClassifications: 0,
            totalConfidence: 0
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadStats();
        this.updateCharCount();
    }
    
    bindEvents() {
        // Classification
        this.classifyBtn.addEventListener('click', () => this.classifyMessage());
        
        // Input handling
        this.messageText.addEventListener('input', () => this.updateCharCount());
        this.messageText.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.classifyMessage();
            }
        });
        
        // Clear button
        this.clearBtn.addEventListener('click', () => this.clearInput());
        
        // Examples
        this.exampleBtn.addEventListener('click', () => this.toggleExamples());
        document.getElementById('hideExamplesBtn').addEventListener('click', () => this.hideExamples());
        
        // Use example buttons
        document.querySelectorAll('.use-example').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const message = e.currentTarget.closest('.example-card').dataset.message;
                this.useExample(message);
            });
        });
        
        // Results section
        document.getElementById('hideResultsBtn').addEventListener('click', () => this.hideResults());
        
        // Statistics
        document.getElementById('resetStatsBtn').addEventListener('click', () => this.resetStats());
    }
    
    updateCharCount() {
        const length = this.messageText.value.length;
        this.charCount.textContent = `${length} / 500 characters`;
        
        if (length > 500) {
            this.charCount.classList.add('text-danger');
            this.messageText.value = this.messageText.value.substring(0, 500);
        } else {
            this.charCount.classList.remove('text-danger');
        }
    }
    
    async classifyMessage() {
        const text = this.messageText.value.trim();
        
        if (!text) {
            this.showToast('Please enter a message to classify', 'warning');
            return;
        }
        
        if (text.length > 500) {
            this.showToast('Message is too long (max 500 characters)', 'warning');
            return;
        }
        
        // Show loading state
        this.setLoadingState(true);
        this.showResults();
        
        try {
            const response = await fetch('/simulation/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.displayResults(result);
                this.updateStats(result);
            } else {
                throw new Error(result.error || 'Classification failed');
            }
            
        } catch (error) {
            console.error('Error classifying message:', error);
            this.showToast('Error: ' + error.message, 'error');
            this.hideResults();
        } finally {
            this.setLoadingState(false);
        }
    }
    
    displayResults(result) {
        // Update prediction badge
        const predictionBadge = document.getElementById('predictionBadge');
        const predictionText = document.getElementById('predictionText');
        
        if (result.prediction === 'spam') {
            predictionBadge.className = 'prediction-badge spam-badge';
            predictionBadge.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            predictionText.textContent = 'SPAM';
        } else {
            predictionBadge.className = 'prediction-badge ham-badge';
            predictionBadge.innerHTML = '<i class="fas fa-check-circle"></i>';
            predictionText.textContent = 'HAM';
        }
        
        // Update confidence
        const confidencePercent = Math.round(result.confidence * 100);
        document.getElementById('confidenceFill').style.width = `${confidencePercent}%`;
        document.getElementById('confidenceValue').textContent = `${confidencePercent}%`;
        
        // Update keywords
        this.displayKeywords(result.keywords_found || []);
        
        // Update AI explanation
        this.displayExplanation(result.explanation || 'No explanation available');
    }
    
    displayKeywords(keywords) {
        const keywordsList = document.getElementById('keywordsList');
        
        if (keywords.length === 0) {
            keywordsList.innerHTML = '<p class="no-keywords">No spam keywords detected</p>';
        } else {
            keywordsList.innerHTML = keywords.map(keyword => 
                `<span class="keyword-tag">${keyword}</span>`
            ).join('');
        }
    }
    
    displayExplanation(explanation) {
        const explanationContent = document.getElementById('explanationContent');
        
        if (explanation) {
            explanationContent.innerHTML = `
                <div class="explanation-text">
                    <p>${explanation}</p>
                </div>
            `;
        } else {
            explanationContent.innerHTML = `
                <div class="explanation-text">
                    <p>AI explanation is not available at the moment.</p>
                </div>
            `;
        }
    }
    
    setLoadingState(loading) {
        this.classifyBtn.disabled = loading;
        
        if (loading) {
            this.classifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Classifying...';
        } else {
            this.classifyBtn.innerHTML = '<i class="fas fa-search"></i> Classify Message';
        }
    }
    
    showResults() {
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    hideResults() {
        this.resultsSection.style.display = 'none';
    }
    
    toggleExamples() {
        if (this.examplesSection.style.display === 'none' || !this.examplesSection.style.display) {
            this.showExamples();
        } else {
            this.hideExamples();
        }
    }
    
    showExamples() {
        this.examplesSection.style.display = 'block';
        this.examplesSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    hideExamples() {
        this.examplesSection.style.display = 'none';
    }
    
    useExample(message) {
        this.messageText.value = message;
        this.updateCharCount();
        this.hideExamples();
        this.messageText.focus();
        this.showToast('Example loaded successfully', 'success');
    }
    
    clearInput() {
        this.messageText.value = '';
        this.updateCharCount();
        this.hideResults();
        this.messageText.focus();
    }
    
    updateStats(result) {
        // Update local stats
        if (result.prediction === 'spam') {
            this.stats.spamCount++;
        } else {
            this.stats.hamCount++;
        }
        
        this.stats.totalClassifications++;
        this.stats.totalConfidence += result.confidence;
        
        // Update display
        this.updateStatsDisplay();
        
        // Save to localStorage
        this.saveStats();
        
        // Log for future points system
        console.log(`Message classified as ${result.prediction} with ${result.confidence} confidence`);
    }
    
    updateStatsDisplay() {
        document.getElementById('spamCount').textContent = this.stats.spamCount;
        document.getElementById('hamCount').textContent = this.stats.hamCount;
        document.getElementById('totalCount').textContent = this.stats.totalClassifications;
        
        const avgConfidence = this.stats.totalClassifications > 0 
            ? Math.round((this.stats.totalConfidence / this.stats.totalClassifications) * 100)
            : 0;
        document.getElementById('avgConfidence').textContent = `${avgConfidence}%`;
    }
    
    saveStats() {
        localStorage.setItem('spamSimStats', JSON.stringify(this.stats));
    }
    
    loadStats() {
        const saved = localStorage.getItem('spamSimStats');
        if (saved) {
            this.stats = JSON.parse(saved);
            this.updateStatsDisplay();
        }
    }
    
    resetStats() {
        if (confirm('Are you sure you want to reset all statistics?')) {
            this.stats = {
                spamCount: 0,
                hamCount: 0,
                totalClassifications: 0,
                totalConfidence: 0
            };
            this.updateStatsDisplay();
            this.saveStats();
            this.showToast('Statistics reset successfully', 'success');
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

// Initialize simulation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SpamSimulation();
});
