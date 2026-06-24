/**
 * Utility Functions Module
 * Helper functions for date formatting, keyword matching, etc.
 */

class Utils {
    /**
     * Format date to readable string
     */
    static formatDate(dateString) {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Get relative time string (e.g., "2 days ago")
     */
    static getRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return this.formatDate(dateString);
    }

    /**
     * Check if text contains any of the specified keywords (case-insensitive)
     */
    static findKeywords(text, keywords) {
        if (!text || !keywords || keywords.length === 0) {
            return [];
        }

        const foundKeywords = [];
        const lowerText = text.toLowerCase();

        keywords.forEach(keyword => {
            const lowerKeyword = keyword.toLowerCase().trim();
            if (lowerKeyword && lowerText.includes(lowerKeyword)) {
                foundKeywords.push(keyword.toUpperCase());
            }
        });

        return [...new Set(foundKeywords)]; // Remove duplicates
    }

    /**
     * Parse repository string (owner/repo format)
     */
    static parseRepository(repoString) {
        const parts = repoString.trim().split('/');
        if (parts.length !== 2 || !parts[0] || !parts[1]) {
            throw new Error('Invalid repository format. Use: owner/repo');
        }
        return {
            owner: parts[0],
            repo: parts[1]
        };
    }

    /**
     * Set default date range (last 30 days)
     */
    static getDefaultDateRange() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        return {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
        };
    }

    /**
     * Sanitize HTML to prevent XSS
     */
    static sanitizeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Truncate text to specified length
     */
    static truncateText(text, maxLength = 100) {
        if (!text || text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Get unique values from array
     */
    static getUniqueValues(array) {
        return [...new Set(array)];
    }

    /**
     * Sort comments by date (newest first)
     */
    static sortCommentsByDate(comments, ascending = false) {
        return comments.sort((a, b) => {
            const dateA = new Date(a.created_at || a.commentCreatedAt);
            const dateB = new Date(b.created_at || b.commentCreatedAt);
            return ascending ? dateA - dateB : dateB - dateA;
        });
    }

    /**
     * Group comments by PR
     */
    static groupCommentsByPR(comments) {
        const grouped = {};
        
        comments.forEach(comment => {
            const prNumber = comment.prNumber;
            if (!grouped[prNumber]) {
                grouped[prNumber] = [];
            }
            grouped[prNumber].push(comment);
        });

        return grouped;
    }

    /**
     * Calculate statistics for comments
     */
    static calculateStats(comments) {
        const stats = {
            total: comments.length,
            byType: {},
            byAuthor: {},
            byKeyword: {}
        };

        comments.forEach(comment => {
            // Count by type
            const type = comment.commentType || 'unknown';
            stats.byType[type] = (stats.byType[type] || 0) + 1;

            // Count by author
            const author = comment.commentAuthor || 'unknown';
            stats.byAuthor[author] = (stats.byAuthor[author] || 0) + 1;

            // Count by keyword
            if (comment.matchedKeywords && comment.matchedKeywords.length > 0) {
                comment.matchedKeywords.forEach(keyword => {
                    stats.byKeyword[keyword] = (stats.byKeyword[keyword] || 0) + 1;
                });
            }
        });

        return stats;
    }

    /**
     * Debounce function for search input
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Show notification message
     */
    static showNotification(message, type = 'info') {
        // This can be enhanced with a toast notification library
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    /**
     * Copy text to clipboard
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            return false;
        }
    }

    /**
     * Format number with commas
     */
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Validate date range
     */
    static validateDateRange(startDate, endDate) {
        if (!startDate || !endDate) {
            return { valid: true };
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return {
                valid: false,
                error: 'Start date must be before end date'
            };
        }

        return { valid: true };
    }
}

export default Utils;

// Made with Bob
