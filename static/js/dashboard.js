// Dashboard JavaScript for AIML Playground
// Handles sidebar navigation, mobile menu, and future live updates

// Mobile menu toggle
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    
    if (sidebar && menuToggle) {
        sidebar.classList.toggle('open');
        const isOpen = sidebar.classList.contains('open');
        menuToggle.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    }
}

// Set active navigation item
function setActiveNavItem() {
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPath || 
            (currentPath === '/' && href === '/dashboard') ||
            (currentPath.startsWith('/learn') && href === '/learn/beginner')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Animate progress bar on load
function animateProgressBar() {
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = document.querySelector('.progress-percentage');
    
    if (progressFill && progressPercentage) {
        const targetWidth = progressFill.style.width;
        const targetValue = progressPercentage.textContent;
        
        // Reset to 0
        progressFill.style.width = '0%';
        progressPercentage.textContent = '0%';
        
        // Animate to target
        setTimeout(() => {
            progressFill.style.transition = 'width 1.5s ease-out';
            progressFill.style.width = targetWidth;
            
            // Animate number
            let currentValue = 0;
            const targetNum = parseFloat(targetValue);
            const increment = targetNum / 30; // 30 steps
            
            const counter = setInterval(() => {
                currentValue += increment;
                if (currentValue >= targetNum) {
                    currentValue = targetNum;
                    clearInterval(counter);
                }
                progressPercentage.textContent = Math.round(currentValue) + '%';
            }, 50);
        }, 300);
    }
}

// Animate stats cards on load
function animateStatsCards() {
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach((card, index) => {
        // Add entrance animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });
}

// Animate badges on load
function animateBadges() {
    const badgeItems = document.querySelectorAll('.badge-item');
    
    badgeItems.forEach((badge, index) => {
        badge.style.opacity = '0';
        badge.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            badge.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            badge.style.opacity = '1';
            badge.style.transform = 'scale(1)';
        }, index * 100);
    });
}

// Add hover effects to action buttons
function addActionButtonsEffects() {
    const actionButtons = document.querySelectorAll('.action-btn');
    
    actionButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Initialize dashboard functionality
function initializeDashboard() {
    // Set active navigation
    setActiveNavItem();
    
    // Animate elements
    animateProgressBar();
    animateStatsCards();
    animateBadges();
    addActionButtonsEffects();
    
    // Add mobile menu toggle button if needed
    if (window.innerWidth <= 576) {
        addMobileMenuToggle();
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 576) {
            addMobileMenuToggle();
        } else {
            removeMobileMenuToggle();
        }
    });
}

// Add mobile menu toggle button
function addMobileMenuToggle() {
    if (!document.querySelector('.mobile-menu-toggle')) {
        const toggle = document.createElement('button');
        toggle.className = 'mobile-menu-toggle';
        toggle.innerHTML = '<i class="fas fa-bars"></i>';
        toggle.addEventListener('click', toggleMobileMenu);
        document.body.appendChild(toggle);
    }
}

// Remove mobile menu toggle button
function removeMobileMenuToggle() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    if (toggle) {
        toggle.remove();
    }
    // Reset sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
    }
}

// Future live update functionality (placeholder)
function startLiveUpdates() {
    // Placeholder for future WebSocket or polling implementation
    // This could be used to update stats in real-time
    
    console.log('Live updates ready for future implementation');
    
    // Example of how it might work:
    // setInterval(() => {
    //     fetch('/api/dashboard/stats')
    //         .then(response => response.json())
    //         .then(data => updateStats(data))
    //         .catch(error => console.error('Error fetching stats:', error));
    // }, 30000); // Update every 30 seconds
}

// Update stats with live data (placeholder)
function updateStats(data) {
    // Placeholder for updating dashboard with live data
    console.log('Updating stats with live data:', data);
    
    // Example implementation:
    // document.querySelector('.points-card .stat-number').textContent = data.points;
    // document.querySelector('.level-card .stat-number').textContent = data.level;
    // etc.
}

// Gamification point tracking (placeholder for future integration)
function awardPoints(action, points) {
    // Placeholder for awarding points to user
    console.log(`Awarding ${points} points for ${action}`);
    
    // This would typically make an API call to update user points
    // fetch('/api/user/award-points', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ action, points })
    // });
}

// Badge awarding logic (placeholder)
function checkAndAwardBadges() {
    // Placeholder for checking and awarding badges based on user achievements
    console.log('Checking for badge eligibility...');
    
    // Example badge criteria:
    // - Code Runner: Complete 5 coding exercises
    // - Quiz Master: Complete 10 quizzes with 80%+ score
    // - Game Winner: Win 3 games
    // - Fast Learner: Complete first week with streak of 7 days
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/dashboard') {
        initializeDashboard();
        startLiveUpdates();
        checkAndAwardBadges();
    }
});

// Export functions for global access
window.dashboardFunctions = {
    toggleMobileMenu,
    setActiveNavItem,
    awardPoints,
    checkAndAwardBadges
};
