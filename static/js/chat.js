// ML Assistant Chat JavaScript
class ChatManager {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.charCount = document.getElementById('charCount');
        
        // Statistics
        this.stats = {
            messageCount: 0,
            pointsEarned: 0,
            sessionStart: Date.now()
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadStats();
        this.updateCharCount();
        this.startSessionTimer();
        
        // Auto-resize textarea
        this.autoResizeTextarea();
    }
    
    bindEvents() {
        // Send button
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Input handling
        this.messageInput.addEventListener('input', () => this.updateCharCount());
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-focus input
        this.messageInput.focus();
    }
    
    updateCharCount() {
        const length = this.messageInput.value.length;
        this.charCount.textContent = `${length} / 1000`;
        
        if (length > 1000) {
            this.charCount.classList.add('text-danger');
            this.messageInput.value = this.messageInput.value.substring(0, 1000);
        } else {
            this.charCount.classList.remove('text-danger');
        }
        
        // Auto-resize textarea
        this.autoResizeTextarea();
    }
    
    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 150) + 'px';
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message) {
            this.showToast('Please enter a message to send.', 'warning');
            return;
        }
        
        if (message.length > 1000) {
            this.showToast('Message is too long (max 1000 characters)', 'warning');
            return;
        }
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        this.messageInput.value = '';
        this.updateCharCount();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            const response = await fetch('/chat/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: message })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add bot response
            this.addMessage(result.answer, 'bot');
            
            // Update statistics
            this.updateStats();
            
            // Award points (2 points per question)
            this.awardPoints(2);
            this.showToast('Message sent successfully!', 'success');
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.showToast('Failed to send message. Please try again.', 'error');
        }
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        
        // Process text for basic formatting
        const formattedText = this.formatMessage(text);
        messageText.innerHTML = formattedText;
        
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = this.getCurrentTime();
        
        content.appendChild(messageText);
        content.appendChild(time);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        this.messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        this.scrollToBottom();
        
        // Update message count
        this.stats.messageCount++;
        this.updateStatsDisplay();
    }
    
    formatMessage(text) {
        // Basic formatting for code blocks and bold text
        let formatted = text;
        
        // Convert **bold** to <strong>bold</strong>
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert *italic* to <em>italic</em>
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert `code` to <code>code</code>
        formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // Convert line breaks to <br>
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }
    
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        `;
        
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    sendSuggestedQuestion(question) {
        this.messageInput.value = question;
        this.updateCharCount();
        this.messageInput.focus();
        this.sendMessage();
    }
    
    askAboutTopic(topic) {
        const question = `Tell me about ${topic}`;
        this.sendSuggestedQuestion(question);
    }
    
    clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            // Keep only the welcome message
            const messages = this.messagesContainer.querySelectorAll('.message');
            messages.forEach(msg => msg.remove());
            
            // Reset stats
            this.stats = {
                messageCount: 0,
                pointsEarned: 0,
                sessionStart: Date.now()
            };
            
            this.updateStatsDisplay();
            this.showToast('Chat history cleared', 'success');
        }
    }
    
    exportChat() {
        const messages = this.messagesContainer.querySelectorAll('.message');
        let chatText = 'ML Assistant Chat Export\n';
        chatText += '=' * 50 + '\n';
        chatText += `Export Date: ${new Date().toLocaleString()}\n`;
        chatText += `Total Messages: ${this.stats.messageCount}\n`;
        chatText += `Points Earned: ${this.stats.pointsEarned}\n`;
        chatText += '=' * 50 + '\n\n';
        
        messages.forEach(msg => {
            const isUser = msg.classList.contains('user-message');
            const sender = isUser ? 'You' : 'Assistant';
            const text = msg.querySelector('.message-text').textContent;
            const time = msg.querySelector('.message-time').textContent;
            
            chatText += `[${time}] ${sender}:\n${text}\n\n`;
        });
        
        // Create download link
        const blob = new Blob([chatText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ml-chat-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showToast('Chat exported successfully', 'success');
    }
    
    updateStats() {
        this.updateStatsDisplay();
        this.saveStats();
    }
    
    updateStatsDisplay() {
        document.getElementById('messageCount').textContent = this.stats.messageCount;
        document.getElementById('pointsEarned').textContent = this.stats.pointsEarned;
    }
    
    startSessionTimer() {
        setInterval(() => {
            const elapsed = Date.now() - this.stats.sessionStart;
            const minutes = Math.floor(elapsed / 60000);
            document.getElementById('sessionTime').textContent = `${minutes}m`;
        }, 1000);
    }
    
    async awardPoints(points) {
        this.stats.pointsEarned += points;
        this.updateStatsDisplay();
        
        try {
            const response = await fetch('/update-points', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'chat',
                    points: points
                })
            });
            
            if (response.ok) {
                console.log(`Awarded ${points} points for chat interaction`);
            }
        } catch (error) {
            console.error('Error awarding points:', error);
        }
    }
    
    saveStats() {
        localStorage.setItem('chatStats', JSON.stringify(this.stats));
    }
    
    loadStats() {
        const saved = localStorage.getItem('chatStats');
        if (saved) {
            this.stats = JSON.parse(saved);
            this.stats.sessionStart = Date.now(); // Reset session start
            this.updateStatsDisplay();
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

// Global functions for onclick handlers
function sendSuggestedQuestion(question) {
    if (window.chatManager) {
        window.chatManager.sendSuggestedQuestion(question);
    }
}

function askAboutTopic(topic) {
    if (window.chatManager) {
        window.chatManager.askAboutTopic(topic);
    }
}

function clearChat() {
    if (window.chatManager) {
        window.chatManager.clearChat();
    }
}

function exportChat() {
    if (window.chatManager) {
        window.chatManager.exportChat();
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatManager = new ChatManager();
});
