// Decision Tree Adventure Game
class DecisionTreeGame {
    constructor() {
        this.currentNode = 'start';
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore') || '0');
        this.gameHistory = [];
        
        // Decision tree game data
        this.gameData = {
            start: {
                title: "The Beginning",
                text: "You're starting to build a decision tree for customer churn prediction. You have a dataset with customer information including demographics, usage patterns, and service details. What's your first step?",
                choices: [
                    { text: "Analyze the data distribution and missing values", nextNode: 'data_analysis', points: 15 },
                    { text: "Immediately start building the tree", nextNode: 'rush_building', points: 5 },
                    { text: "Split data into training and testing sets", nextNode: 'data_split', points: 10 }
                ]
            },
            data_analysis: {
                title: "Data Analysis Phase",
                text: "Good choice! You've discovered that 15% of customers have churned, and there are some missing values in the 'tenure' column. You also notice that monthly charges and tenure seem correlated with churn. What's your next move?",
                choices: [
                    { text: "Handle missing values and normalize features", nextNode: 'preprocessing', points: 15 },
                    { text: "Start building the tree with missing values", nextNode: 'missing_values_issue', points: 5 },
                    { text: "Remove all rows with missing data", nextNode: 'data_loss', points: 8 }
                ]
            },
            data_split: {
                title: "Data Splitting",
                text: "You've split your data into 80% training and 20% testing. However, you haven't analyzed the data characteristics yet. What should you consider?",
                choices: [
                    { text: "Check for class imbalance in the split", nextNode: 'class_imbalance', points: 12 },
                    { text: "Proceed with model building", nextNode: 'no_analysis', points: 6 },
                    { text: "Analyze feature distributions first", nextNode: 'data_analysis', points: 10 }
                ]
            },
            rush_building: {
                title: "Rushed Building",
                text: "You started building immediately but encountered issues with missing values and unclear feature importance. The tree is overfitting. How do you fix this?",
                choices: [
                    { text: "Go back and do proper data analysis", nextNode: 'data_analysis', points: 8 },
                    { text: "Increase tree depth to capture more patterns", nextNode: 'overfitting', points: 3 },
                    { text: "Use pruning techniques", nextNode: 'pruning', points: 10 }
                ]
            },
            preprocessing: {
                title: "Data Preprocessing",
                text: "Excellent! You've handled missing values using median imputation and normalized numerical features. Now you need to decide on the root node. Which feature would be the best first split?",
                choices: [
                    { text: "Tenure (customer duration)", nextNode: 'tenure_split', points: 15 },
                    { text: "Monthly charges", nextNode: 'charges_split', points: 12 },
                    { text: "Contract type", nextNode: 'contract_split', points: 14 }
                ]
            },
            class_imbalance: {
                title: "Class Imbalance",
                text: "You noticed that only 15% of customers churned, creating class imbalance. What's the best approach?",
                choices: [
                    { text: "Use stratified sampling for splits", nextNode: 'stratified_split', points: 15 },
                    { text: "Ignore imbalance and proceed", nextNode: 'bias_issue', points: 5 },
                    { text: "Oversample minority class", nextNode: 'oversampling', points: 12 }
                ]
            },
            missing_values_issue: {
                title: "Missing Values Problem",
                text: "Your tree is struggling with missing values, leading to poor splits. What's the best solution?",
                choices: [
                    { text: "Implement proper missing value handling", nextNode: 'preprocessing', points: 10 },
                    { text: "Use algorithms that handle missing values", nextNode: 'algorithm_choice', points: 12 },
                    { text: "Remove problematic features", nextNode: 'feature_removal', points: 6 }
                ]
            },
            data_loss: {
                title: "Excessive Data Loss",
                text: "You removed 30% of your data due to missing values, losing important patterns. How can you recover?",
                choices: [
                    { text: "Use imputation instead of removal", nextNode: 'preprocessing', points: 12 },
                    { text: "Collect more data", nextNode: 'more_data', points: 8 },
                    { text: "Proceed with reduced dataset", nextNode: 'reduced_performance', points: 4 }
                ]
            },
            no_analysis: {
                title: "Skipping Analysis",
                text: "Without proper analysis, you might miss important patterns. What's the risk?",
                choices: [
                    { text: "Go back and analyze the data", nextNode: 'data_analysis', points: 10 },
                    { text: "Accept the risk and continue", nextNode: 'unknown_risks', points: 5 },
                    { text: "Use automated feature selection", nextNode: 'auto_selection', points: 8 }
                ]
            },
            overfitting: {
                title: "Overfitting Issues",
                text: "Your tree has too many branches and is memorizing training data. Test accuracy is poor. What's the solution?",
                choices: [
                    { text: "Apply pruning to reduce complexity", nextNode: 'pruning', points: 12 },
                    { text: "Limit maximum tree depth", nextNode: 'depth_limit', points: 10 },
                    { text: "Use cross-validation", nextNode: 'cross_validation', points: 14 }
                ]
            },
            pruning: {
                title: "Tree Pruning",
                text: "You're applying pruning to remove unnecessary branches. What's the key consideration?",
                choices: [
                    { text: "Balance between accuracy and complexity", nextNode: 'balance_complexity', points: 15 },
                    { text: "Maximize training accuracy", nextNode: 'training_focus', points: 6 },
                    { text: "Minimize tree size", nextNode: 'size_focus', points: 8 }
                ]
            },
            tenure_split: {
                title: "Tenure-Based Split",
                text: "Great choice! Tenure is strongly correlated with churn. New customers (tenure < 12 months) have higher churn rates. What's the next level of splitting?",
                choices: [
                    { text: "Split by contract type for new customers", nextNode: 'contract_new', points: 15 },
                    { text: "Split by monthly charges", nextNode: 'charges_split', points: 12 },
                    { text: "Split by internet service", nextNode: 'internet_split', points: 10 }
                ]
            },
            charges_split: {
                title: "Monthly Charges Split",
                text: "Monthly charges show that customers with high bills (> $80) churn more. What's the next logical split?",
                choices: [
                    { text: "Split by contract type for high-charge customers", nextNode: 'contract_high', points: 14 },
                    { text: "Split by tenure for high-charge customers", nextNode: 'tenure_high', points: 12 },
                    { text: "Split by payment method", nextNode: 'payment_split', points: 10 }
                ]
            },
            contract_split: {
                title: "Contract Type Split",
                text: "Contract type is very predictive! Month-to-month customers have much higher churn. What's the next split for month-to-month customers?",
                choices: [
                    { text: "Split by tenure for month-to-month", nextNode: 'tenure_monthly', points: 15 },
                    { text: "Split by internet service", nextNode: 'internet_monthly', points: 12 },
                    { text: "Split by payment method", points: 10, nextNode: 'payment_monthly' }
                ]
            },
            stratified_split: {
                title: "Stratified Sampling",
                text: "Perfect! Stratified sampling maintains class distribution. Now you can proceed with confidence. What's your next step?",
                choices: [
                    { text: "Analyze feature importance", nextNode: 'feature_importance', points: 15 },
                    { text: "Start building the tree", nextNode: 'building_with_analysis', points: 12 },
                    { text: "Perform feature engineering", nextNode: 'feature_engineering', points: 14 }
                ]
            },
            bias_issue: {
                title: "Bias Problem",
                text: "Ignoring class imbalance led to a biased model that predicts no churn. How can you fix this?",
                choices: [
                    { text: "Use class weights in training", nextNode: 'class_weights', points: 12 },
                    { text: "Resample the data", nextNode: 'resampling', points: 10 },
                    { text: "Use different evaluation metrics", nextNode: 'evaluation_metrics', points: 8 }
                ]
            },
            oversampling: {
                title: "Oversampling Approach",
                text: "Oversampling helps but may introduce noise. What's a balanced approach?",
                choices: [
                    { text: "Combine oversampling with undersampling", nextNode: 'hybrid_sampling', points: 14 },
                    { text: "Use SMOTE for synthetic samples", nextNode: 'smote', points: 12 },
                    { text: "Adjust class weights instead", nextNode: 'class_weights', points: 10 }
                ]
            },
            algorithm_choice: {
                title: "Algorithm Selection",
                text: "Some algorithms handle missing values better than others. What's your choice?",
                choices: [
                    { text: "Use Random Forest (handles missing values well)", nextNode: 'random_forest', points: 12 },
                    { text: "Use XGBoost with missing value handling", nextNode: 'xgboost', points: 14 },
                    { text: "Stick with Decision Tree and handle missing values", nextNode: 'preprocessing', points: 10 }
                ]
            },
            feature_removal: {
                title: "Feature Removal",
                text: "You removed features with missing values but lost important information. What's the lesson?",
                choices: [
                    { text: "Always try imputation first", nextNode: 'preprocessing', points: 10 },
                    { text: "Consider feature importance before removal", nextNode: 'feature_importance', points: 12 },
                    { text: "Use domain knowledge to guide decisions", nextNode: 'domain_knowledge', points: 8 }
                ]
            },
            more_data: {
                title: "Data Collection",
                text: "Collecting more data is good but takes time. What can you do in the meantime?",
                choices: [
                    { text: "Use imputation on existing data", nextNode: 'preprocessing', points: 10 },
                    { text: "Start with available data and improve later", nextNode: 'iterative_approach', points: 8 },
                    { text: "Use data augmentation techniques", nextNode: 'augmentation', points: 6 }
                ]
            },
            reduced_performance: {
                title: "Reduced Performance",
                text: "With less data, your model performance suffers. What's the trade-off?",
                choices: [
                    { text: "Accept lower performance for cleaner data", nextNode: 'accept_tradeoff', points: 8 },
                    { text: "Go back and use imputation", nextNode: 'preprocessing', points: 12 },
                    { text: "Use ensemble methods to compensate", nextNode: 'ensemble', points: 10 }
                ]
            },
            unknown_risks: {
                title: "Unknown Risks",
                text: "Proceeding without analysis is risky. What's the biggest danger?",
                choices: [
                    { text: "Missing important patterns", nextNode: 'missed_patterns', points: 8 },
                    { text: "Building biased model", nextNode: 'bias_risk', points: 6 },
                    { text: "Poor generalization", nextNode: 'generalization_issue', points: 10 }
                ]
            },
            auto_selection: {
                title: "Automated Selection",
                text: "Automated feature selection can help but may miss domain-specific insights. What's the balance?",
                choices: [
                    { text: "Combine automated with domain knowledge", nextNode: 'hybrid_approach', points: 14 },
                    { text: "Rely entirely on automation", nextNode: 'full_automation', points: 8 },
                    { text: "Use automation as starting point", nextNode: 'automation_start', points: 12 }
                ]
            },
            depth_limit: {
                title: "Depth Limitation",
                text: "Limiting tree depth helps prevent overfitting. What's a good depth for this problem?",
                choices: [
                    { text: "Depth of 3-5 levels", nextNode: 'optimal_depth', points: 12 },
                    { text: "Depth of 6-8 levels", nextNode: 'moderate_depth', points: 10 },
                    { text: "Depth of 2-3 levels", nextNode: 'shallow_depth', points: 8 }
                ]
            },
            cross_validation: {
                title: "Cross-Validation",
                text: "Cross-validation helps assess model performance. What type is best for decision trees?",
                choices: [
                    { text: "5-fold cross-validation", nextNode: 'five_fold', points: 15 },
                    { text: "10-fold cross-validation", nextNode: 'ten_fold', points: 12 },
                    { text: "Leave-one-out cross-validation", nextNode: 'loocv', points: 8 }
                ]
            },
            balance_complexity: {
                title: "Balancing Complexity",
                text: "You're finding the sweet spot between accuracy and interpretability. What's the key metric?",
                choices: [
                    { text: "Use validation accuracy to guide pruning", nextNode: 'validation_guided', points: 15 },
                    { text: "Prioritize interpretability", nextNode: 'interpretability_focus', points: 10 },
                    { text: "Maximize test accuracy", nextNode: 'accuracy_focus', points: 12 }
                ]
            },
            training_focus: {
                title: "Training Focus",
                text: "Focusing only on training accuracy leads to overfitting. What's the problem?",
                choices: [
                    { text: "Poor generalization to new data", nextNode: 'generalization_poor', points: 8 },
                    { text: "Tree becomes too complex", nextNode: 'complex_tree', points: 6 },
                    { text: "Memorization instead of learning", nextNode: 'memorization', points: 10 }
                ]
            },
            size_focus: {
                title: "Size Focus",
                text: "Minimizing tree size might hurt accuracy. What's the balance?",
                choices: [
                    { text: "Find optimal size through validation", nextNode: 'optimal_size', points: 12 },
                    { text: "Accept some complexity for accuracy", nextNode: 'accuracy_complexity', points: 10 },
                    { text: "Use pruning to find balance", nextNode: 'pruning_balance', points: 14 }
                ]
            },
            contract_new: {
                title: "New Customers Contract",
                text: "For new customers, contract type is crucial. Month-to-month customers have 50% churn rate! What's next?",
                choices: [
                    { text: "Split by internet service for month-to-month", nextNode: 'internet_monthly', points: 15 },
                    { text: "Split by payment method", nextNode: 'payment_monthly', points: 12 },
                    { text: "Split by monthly charges", nextNode: 'charges_monthly', points: 10 }
                ]
            },
            contract_high: {
                title: "High Charge Customers",
                text: "High-charge customers with long-term contracts are interesting. They pay more but are more loyal. What's the pattern?",
                choices: [
                    { text: "Split by payment method for high-charge loyal", nextNode: 'payment_loyal', points: 14 },
                    { text: "Split by internet service quality", nextNode: 'internet_quality', points: 12 },
                    { text: "Split by additional services", nextNode: 'additional_services', points: 10 }
                ]
            },
            feature_importance: {
                title: "Feature Importance",
                text: "Analyzing feature importance reveals tenure, contract type, and monthly charges as top predictors. How do you use this insight?",
                choices: [
                    { text: "Build tree focusing on top features", nextNode: 'focused_tree', points: 15 },
                    { text: "Use all features but weight important ones", nextNode: 'weighted_features', points: 12 },
                    { text: "Remove unimportant features", nextNode: 'feature_selection', points: 10 }
                ]
            },
            building_with_analysis: {
                title: "Building with Analysis",
                text: "You now have good insights from data analysis. What's your building strategy?",
                choices: [
                    { text: "Build tree with domain knowledge constraints", nextNode: 'constrained_tree', points: 15 },
                    { text: "Use automated tree building", nextNode: 'automated_building', points: 10 },
                    { text: "Use ensemble of trees", nextNode: 'ensemble_approach', points: 12 }
                ]
            },
            feature_engineering: {
                title: "Feature Engineering",
                text: "You can create new features like 'tenure_group' or 'charge_to_tenure_ratio'. What's most valuable?",
                choices: [
                    { text: "Create interaction features", nextNode: 'interaction_features', points: 14 },
                    { text: "Create ratio features", nextNode: 'ratio_features', points: 12 },
                    { text: "Create grouping features", nextNode: 'grouping_features', points: 10 }
                ]
            },
            class_weights: {
                title: "Class Weights",
                text: "Using class weights helps the model pay more attention to minority class. What's the right approach?",
                choices: [
                    { text: "Use inverse class frequency weights", nextNode: 'inverse_weights', points: 14 },
                    { text: "Use balanced weights", nextNode: 'balanced_weights', points: 12 },
                    { text: "Use custom weights based on domain", nextNode: 'custom_weights', points: 15 }
                ]
            },
            resampling: {
                title: "Resampling Data",
                text: "Resampling can help with class imbalance. What's the best strategy?",
                choices: [
                    { text: "SMOTE for synthetic minority samples", nextNode: 'smote_final', points: 14 },
                    { text: "Random oversampling with duplication", nextNode: 'random_oversample', points: 10 },
                    { text: "Combination of over and under sampling", nextNode: 'combined_sampling', points: 12 }
                ]
            },
            evaluation_metrics: {
                title: "Evaluation Metrics",
                text: "For imbalanced data, accuracy isn't enough. What's most important?",
                choices: [
                    { text: "Focus on F1-score and recall", nextNode: 'f1_focus', points: 15 },
                    { text: "Use precision-recall curve", nextNode: 'pr_curve', points: 12 },
                    { text: "Use ROC-AUC score", nextNode: 'roc_auc', points: 10 }
                ]
            },
            // Final nodes (leaf nodes)
            focused_tree: {
                title: "Focused Decision Tree",
                text: "Excellent! You built a focused tree using the most important features. Your model achieves 85% accuracy with good interpretability. Key insights: tenure < 12 months and month-to-month contracts are high-risk factors.",
                isFinal: true,
                explanation: "You've learned that focusing on the most predictive features (tenure, contract type, monthly charges) creates an effective and interpretable decision tree. This approach balances accuracy with explainability."
            },
            constrained_tree: {
                title: "Domain-Constrained Tree",
                text: "Great job! Using domain knowledge, you created a tree that makes business sense. 82% accuracy with clear decision rules that stakeholders can understand and trust.",
                isFinal: true,
                explanation: "Domain knowledge helps create decision trees that not only perform well but also align with business understanding and constraints."
            },
            validation_guided: {
                title: "Validation-Guided Pruning",
                text: "Perfect! You used validation accuracy to guide pruning, achieving 87% accuracy with optimal complexity. Your tree generalizes well to new data.",
                isFinal: true,
                explanation: "Validation-guided pruning ensures your decision tree performs well on unseen data by finding the right balance between fitting training data and maintaining generalization capability."
            },
            optimal_depth: {
                title: "Optimal Tree Depth",
                text: "Well done! You found the optimal depth of 4 levels, achieving 84% accuracy. The tree is deep enough to capture patterns but simple enough to avoid overfitting.",
                isFinal: true,
                explanation: "Finding the optimal tree depth is crucial for balancing model complexity with performance. Too deep leads to overfitting, too shallow leads to underfitting."
            },
            five_fold: {
                title: "5-Fold Cross-Validation",
                text: "Excellent! 5-fold cross-validation gave you reliable performance estimates. Your final model achieves 86% accuracy with consistent performance across folds.",
                isFinal: true,
                explanation: "Cross-validation provides robust performance estimates and helps ensure your decision tree will perform well on new, unseen data."
            },
            custom_weights: {
                title: "Custom Class Weights",
                text: "Outstanding! Using custom class weights based on domain knowledge, you achieved 83% accuracy with good recall for the minority class. The model correctly identifies 78% of churn cases.",
                isFinal: true,
                explanation: "Custom class weights allow you to prioritize certain types of errors based on business requirements, making the model more useful for specific applications."
            },
            smote_final: {
                title: "SMOTE Implementation",
                text: "Great! Using SMOTE for synthetic minority samples, you achieved 81% accuracy with improved minority class detection. The model is more balanced and practical.",
                isFinal: true,
                explanation: "SMOTE creates synthetic samples of the minority class, helping the model learn better decision boundaries without simply duplicating existing samples."
            },
            f1_focus: {
                title: "F1-Score Optimization",
                text: "Excellent! Focusing on F1-score gave you a model with 80% accuracy and balanced precision-recall. The model maintains good performance while avoiding bias toward either class.",
                isFinal: true,
                explanation: "F1-score provides a balanced measure of model performance, especially important for imbalanced datasets where accuracy alone can be misleading."
            },
            // Lower scoring final nodes
            biased_model: {
                title: "Biased Model",
                text: "Your model achieved 95% accuracy but predicts no one will churn. This happens when you ignore class imbalance. Accuracy is misleading for imbalanced data.",
                isFinal: true,
                explanation: "High accuracy doesn't always mean a good model, especially with imbalanced data. Always consider metrics like precision, recall, and F1-score."
            },
            overfit_model: {
                title: "Overfit Model",
                text: "Your model achieved 99% training accuracy but only 65% test accuracy. The tree memorized training data instead of learning patterns. Try pruning or limiting depth.",
                isFinal: true,
                explanation: "Overfitting occurs when a model learns noise in training data rather than underlying patterns. Techniques like pruning and depth limitation help prevent this."
            },
            underfit_model: {
                title: "Underfit Model",
                text: "Your model achieved only 70% accuracy because it's too simple. The tree doesn't capture important patterns in the data. Consider increasing complexity or adding features.",
                isFinal: true,
                explanation: "Underfitting happens when a model is too simple to capture the underlying patterns in data. Balance simplicity with the need to capture important relationships."
            }
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadBestScore();
        this.startGame();
    }
    
    bindEvents() {
        document.getElementById('playAgainBtn').addEventListener('click', () => this.startGame());
        document.getElementById('backToDashboardBtn').addEventListener('click', () => {
            window.location.href = '/dashboard';
        });
    }
    
    startGame() {
        this.currentNode = 'start';
        this.score = 0;
        this.gameHistory = [];
        this.updateDisplay();
        this.hideGameOver();
    }
    
    makeChoice(nextNode, points) {
        this.score += points;
        this.gameHistory.push({
            fromNode: this.currentNode,
            toNode: nextNode,
            points: points
        });
        
        this.currentNode = nextNode;
        this.updateDisplay();
        
        // Check if game is over
        const node = this.gameData[this.currentNode];
        if (node && node.isFinal) {
            this.endGame();
        }
        
        showToast('Choice made successfully!', 'success');
    } catch (error) {
        console.error('Error making choice:', error);
        showToast('Error making choice. Please try again.', 'error');
    }
}

// ... (rest of the code remains the same)

updateDisplay() {
    try {
        const node = this.gameData[this.currentNode];
        if (!node) return;
        
        // Update title and text
        document.getElementById('nodeTitle').textContent = node.title;
        document.getElementById('storyText').textContent = node.text;
        
        // Update score
        document.getElementById('currentScore').textContent = this.score;
        
        // Update progress
        const progress = this.calculateProgress();
        document.getElementById('progressFill').style.width = `${progress}%`;
        
        // Update choices
        this.updateChoices(node.choices);
    }
    
    updateChoices(choices) {
        const container = document.getElementById('choicesContainer');
        container.innerHTML = '';
        
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.innerHTML = `
                <span class="choice-number">${index + 1}</span>
                <span class="choice-text">${choice.text}</span>
                <span class="choice-points">+${choice.points} pts</span>
            `;
            button.addEventListener('click', () => this.makeChoice(choice.nextNode, choice.points));
            container.appendChild(button);
        });
    }
    
    calculateProgress() {
        const totalNodes = Object.keys(this.gameData).length;
        const finalNodes = Object.values(this.gameData).filter(node => node.isFinal).length;
        const maxDepth = 4; // Approximate max depth
        const currentDepth = this.gameHistory.length;
        return Math.min(100, (currentDepth / maxDepth) * 100);
    }
    
    endGame() {
        const node = this.gameData[this.currentNode];
        
        // Update final score display
        document.getElementById('finalScore').textContent = this.score;
        
        // Update rating
        const rating = this.getScoreRating();
        document.getElementById('scoreRating').innerHTML = rating;
        
        // Update educational content
        document.getElementById('educationalContent').innerHTML = `
            <h4>What You Learned:</h4>
            <p>${node.explanation}</p>
        `;
        
        // Show game over screen
        this.showGameOver();
        
        // Update best score
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore.toString());
            this.updateBestScore();
        }
        
        // Send score to backend (placeholder for Phase C)
        this.sendScoreToBackend();
    }
    
    getScoreRating() {
        if (this.score >= 85) {
            return '<div class="rating excellent">Excellent! ML Expert! </div>';
        } else if (this.score >= 70) {
            return '<div class="rating good">Good Job! ML Practitioner! </div>';
        } else if (this.score >= 55) {
            return '<div class="rating average">Nice Try! Keep Learning! </div>';
        } else {
            return '<div class="rating poor">Needs Practice! Try Again! </div>';
        }
    }
    
    showGameOver() {
        document.getElementById('gameOverScreen').style.display = 'block';
        document.getElementById('choicesContainer').style.display = 'none';
    }
    
    hideGameOver() {
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('choicesContainer').style.display = 'flex';
    }
    
    loadBestScore() {
        this.bestScore = parseInt(localStorage.getItem('bestScore') || '0');
        this.updateBestScore();
    }
    
    updateBestScore() {
        document.getElementById('bestScore').textContent = this.bestScore;
    }
    
    async sendScoreToBackend() {
        try {
            // Placeholder for Phase C implementation
            console.log(`Game completed with score: ${this.score}`);
            // TODO: Implement in Phase C
            // await fetch('/update-points', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         action: 'game_complete',
            //         score: this.score
            //     })
            // });
        } catch (error) {
            console.error('Error sending score:', error);
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DecisionTreeGame();
});
