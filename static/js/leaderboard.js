// Leaderboard JS (placeholder for future enhancements)
document.addEventListener('DOMContentLoaded', function() {
    // Highlight current user row if needed
    const currentRow = document.querySelector('.leaderboard-table .current-user');
    if (currentRow) {
        currentRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});
