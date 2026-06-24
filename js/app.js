/**
 * Main Application Module
 * Coordinates all functionality and manages application state
 */

import GitHubAPI from './githubApi.js';
import CSVExporter from './csvExporter.js';
import Utils from './utils.js';

class App {
    constructor() {
        this.githubApi = null;
        this.allComments = [];
        this.filteredComments = [];
        this.currentKeywords = [];
        
        this.initializeElements();
        this.attachEventListeners();
        this.initializeDateRange();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        // Auth section
        this.authSection = document.getElementById('auth-section');
        this.githubTokenInput = document.getElementById('github-token');
        this.authBtn = document.getElementById('auth-btn');
        this.authStatus = document.getElementById('auth-status');

        // Filter panel
        this.filterPanel = document.getElementById('filter-panel');
        this.repoInput = document.getElementById('repo-input');
        this.startDateInput = document.getElementById('start-date');
        this.endDateInput = document.getElementById('end-date');
        this.keywordCheckboxes = document.querySelectorAll('.keyword-checkbox');
        this.customKeywordInput = document.getElementById('custom-keyword');
        this.fetchBtn = document.getElementById('fetch-btn');
        this.logoutBtn = document.getElementById('logout-btn');

        // Results section
        this.resultsSection = document.getElementById('results-section');
        this.exportCsvBtn = document.getElementById('export-csv-btn');
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('error-message');
        this.commentsContainer = document.getElementById('comments-container');
        this.commentCount = document.getElementById('comment-count');
        this.progressText = document.getElementById('progress-text');
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        this.authBtn.addEventListener('click', () => this.handleAuthentication());
        this.githubTokenInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAuthentication();
        });

        this.fetchBtn.addEventListener('click', () => this.handleFetchComments());
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        this.exportCsvBtn.addEventListener('click', () => this.handleExportCSV());

        // Keyword filter change
        this.keywordCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateKeywordFilter());
        });
        this.customKeywordInput.addEventListener('input', 
            Utils.debounce(() => this.updateKeywordFilter(), 500)
        );
    }

    /**
     * Initialize date range with default values (last 30 days)
     */
    initializeDateRange() {
        const dateRange = Utils.getDefaultDateRange();
        this.startDateInput.value = dateRange.start;
        this.endDateInput.value = dateRange.end;
    }

    /**
     * Handle GitHub authentication
     */
    async handleAuthentication() {
        const token = this.githubTokenInput.value.trim();

        if (!token) {
            this.showAuthStatus('Please enter a GitHub Personal Access Token', 'error');
            return;
        }

        this.authBtn.disabled = true;
        this.authBtn.textContent = 'Authenticating...';

        try {
            this.githubApi = new GitHubAPI(token);
            const result = await this.githubApi.validateToken();

            if (result.valid) {
                // Store token in sessionStorage
                sessionStorage.setItem('github_token', token);
                
                this.showAuthStatus(`✓ Authenticated as ${result.user}`, 'success');
                this.authSection.style.display = 'none';
                this.filterPanel.style.display = 'block';
            } else {
                this.showAuthStatus(`✗ Authentication failed: ${result.error}`, 'error');
                this.authBtn.disabled = false;
                this.authBtn.textContent = 'Authenticate';
            }
        } catch (error) {
            this.showAuthStatus(`✗ Error: ${error.message}`, 'error');
            this.authBtn.disabled = false;
            this.authBtn.textContent = 'Authenticate';
        }
    }

    /**
     * Show authentication status message
     */
    showAuthStatus(message, type) {
        this.authStatus.textContent = message;
        this.authStatus.className = `status-message ${type}`;
        this.authStatus.style.display = 'block';
    }

    /**
     * Handle logout
     */
    handleLogout() {
        sessionStorage.removeItem('github_token');
        this.githubApi = null;
        this.allComments = [];
        this.filteredComments = [];
        
        this.githubTokenInput.value = '';
        this.authStatus.style.display = 'none';
        this.filterPanel.style.display = 'none';
        this.resultsSection.style.display = 'none';
        this.authSection.style.display = 'block';
        this.authBtn.disabled = false;
        this.authBtn.textContent = 'Authenticate';
    }

    /**
     * Handle fetching PR comments
     */
    async handleFetchComments() {
        const repoString = this.repoInput.value.trim();
        const startDate = this.startDateInput.value;
        const endDate = this.endDateInput.value;

        // Validate inputs
        if (!repoString) {
            this.showError('Please enter a repository (owner/repo format)');
            return;
        }

        const dateValidation = Utils.validateDateRange(startDate, endDate);
        if (!dateValidation.valid) {
            this.showError(dateValidation.error);
            return;
        }

        try {
            const { owner, repo } = Utils.parseRepository(repoString);
            
            this.showLoading(true);
            this.hideError();
            this.resultsSection.style.display = 'block';
            this.commentsContainer.innerHTML = '';

            // Fetch pull requests
            this.updateProgress('Fetching pull requests...');
            const pullRequests = await this.githubApi.fetchPullRequests(owner, repo, startDate, endDate);
            
            if (pullRequests.length === 0) {
                this.showLoading(false);
                this.showError('No pull requests found in the specified date range');
                return;
            }

            this.updateProgress(`Found ${pullRequests.length} pull requests. Fetching comments...`);

            // Fetch comments for each PR
            this.allComments = [];
            for (let i = 0; i < pullRequests.length; i++) {
                const pr = pullRequests[i];
                this.updateProgress(`Processing PR #${pr.number} (${i + 1}/${pullRequests.length})...`);

                const { reviews, reviewComments, issueComments } = 
                    await this.githubApi.fetchAllCommentsForPR(owner, repo, pr.number);

                // Process reviews
                reviews.forEach(review => {
                    if (review.body) {
                        const comment = CSVExporter.formatCommentForExport(
                            pr, review, 'Review', review.state
                        );
                        comment.matchedKeywords = Utils.findKeywords(review.body, this.currentKeywords);
                        this.allComments.push(comment);
                    }
                });

                // Process review comments
                reviewComments.forEach(comment => {
                    const formattedComment = CSVExporter.formatCommentForExport(
                        pr, comment, 'Review Comment'
                    );
                    formattedComment.matchedKeywords = Utils.findKeywords(comment.body, this.currentKeywords);
                    this.allComments.push(formattedComment);
                });

                // Process issue comments
                issueComments.forEach(comment => {
                    const formattedComment = CSVExporter.formatCommentForExport(
                        pr, comment, 'Issue Comment'
                    );
                    formattedComment.matchedKeywords = Utils.findKeywords(comment.body, this.currentKeywords);
                    this.allComments.push(formattedComment);
                });
            }

            this.showLoading(false);
            this.applyFilters();
            this.renderComments();

        } catch (error) {
            this.showLoading(false);
            this.showError(`Error: ${error.message}`);
        }
    }

    /**
     * Update keyword filter
     */
    updateKeywordFilter() {
        const keywords = [];

        // Get checked predefined keywords
        this.keywordCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                keywords.push(checkbox.value);
            }
        });

        // Get custom keywords
        const customKeywords = this.customKeywordInput.value
            .split(',')
            .map(k => k.trim())
            .filter(k => k.length > 0);

        this.currentKeywords = [...keywords, ...customKeywords];

        // Re-apply keyword matching to all comments
        this.allComments.forEach(comment => {
            comment.matchedKeywords = Utils.findKeywords(comment.commentBody, this.currentKeywords);
        });

        this.applyFilters();
        this.renderComments();
    }

    /**
     * Apply filters to comments
     */
    applyFilters() {
        if (this.currentKeywords.length === 0) {
            // No keyword filter, show all comments
            this.filteredComments = [...this.allComments];
        } else {
            // Filter comments that match at least one keyword
            this.filteredComments = this.allComments.filter(
                comment => comment.matchedKeywords.length > 0
            );
        }
    }

    /**
     * Render comments in tree structure
     */
    renderComments() {
        this.commentsContainer.innerHTML = '';

        if (this.filteredComments.length === 0) {
            this.commentsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <div class="empty-state-text">No comments found matching your criteria</div>
                </div>
            `;
            this.commentCount.textContent = '0 comments';
            return;
        }

        // Group comments by PR
        const commentsByPR = {};
        this.filteredComments.forEach(comment => {
            if (!commentsByPR[comment.prNumber]) {
                commentsByPR[comment.prNumber] = {
                    pr: {
                        number: comment.prNumber,
                        title: comment.prTitle,
                        author: comment.prAuthor,
                        state: comment.prState,
                        createdAt: comment.prCreatedAt
                    },
                    comments: []
                };
            }
            commentsByPR[comment.prNumber].comments.push(comment);
        });

        // Render each PR with its comments
        Object.values(commentsByPR).forEach(prData => {
            const prElement = this.createPRElement(prData.pr, prData.comments);
            this.commentsContainer.appendChild(prElement);
        });

        this.commentCount.textContent = `${this.filteredComments.length} comment${this.filteredComments.length !== 1 ? 's' : ''}`;
    }

    /**
     * Create PR element with drill-down structure
     */
    createPRElement(pr, comments) {
        const prDiv = document.createElement('div');
        prDiv.className = 'pr-item';

        const prHeader = document.createElement('div');
        prHeader.className = 'pr-header';
        prHeader.innerHTML = `
            <div>
                <div class="pr-title">
                    <span class="pr-number">#${pr.number}</span>
                    ${Utils.sanitizeHTML(pr.title)}
                </div>
                <div class="pr-meta">
                    by ${Utils.sanitizeHTML(pr.author)} • 
                    ${pr.state} • 
                    ${Utils.formatDate(pr.createdAt)} • 
                    ${comments.length} comment${comments.length !== 1 ? 's' : ''}
                </div>
            </div>
            <span class="toggle-icon">▶</span>
        `;

        const prContent = document.createElement('div');
        prContent.className = 'pr-content';

        // Sort comments by date
        const sortedComments = Utils.sortCommentsByDate([...comments]);

        sortedComments.forEach(comment => {
            const commentElement = this.createCommentElement(comment);
            prContent.appendChild(commentElement);
        });

        prHeader.addEventListener('click', () => {
            prDiv.classList.toggle('expanded');
        });

        prDiv.appendChild(prHeader);
        prDiv.appendChild(prContent);

        return prDiv;
    }

    /**
     * Create comment element
     */
    createCommentElement(comment) {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item';

        let reviewStateBadge = '';
        if (comment.reviewState) {
            reviewStateBadge = `<span class="review-state ${comment.reviewState.toLowerCase().replace('_', '')}">${comment.reviewState.replace('_', ' ')}</span>`;
        }

        let keywordTags = '';
        if (comment.matchedKeywords.length > 0) {
            keywordTags = `
                <div class="comment-keywords">
                    ${comment.matchedKeywords.map(kw => 
                        `<span class="keyword-tag">${Utils.sanitizeHTML(kw)}</span>`
                    ).join('')}
                </div>
            `;
        }

        let filePath = '';
        if (comment.filePath) {
            filePath = `<div class="comment-file">📄 ${Utils.sanitizeHTML(comment.filePath)}${comment.lineNumber ? `:${comment.lineNumber}` : ''}</div>`;
        }

        commentDiv.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${Utils.sanitizeHTML(comment.commentAuthor)}</span>
                <span class="comment-date">${Utils.formatDate(comment.commentCreatedAt)}</span>
            </div>
            <div style="margin-bottom: 8px;">
                <span style="font-size: 12px; color: #6c757d; font-weight: 600;">${comment.commentType}</span>
                ${reviewStateBadge}
            </div>
            <div class="comment-body">${Utils.sanitizeHTML(comment.commentBody)}</div>
            ${filePath}
            ${keywordTags}
        `;

        return commentDiv;
    }

    /**
     * Handle CSV export
     */
    handleExportCSV() {
        if (this.filteredComments.length === 0) {
            alert('No comments to export');
            return;
        }

        CSVExporter.exportComments(this.filteredComments);
    }

    /**
     * Show/hide loading indicator
     */
    showLoading(show) {
        this.loading.style.display = show ? 'block' : 'none';
        this.fetchBtn.disabled = show;
    }

    /**
     * Update progress text
     */
    updateProgress(text) {
        this.progressText.textContent = text;
    }

    /**
     * Show error message
     */
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
    }

    /**
     * Hide error message
     */
    hideError() {
        this.errorMessage.style.display = 'none';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

// Made with Bob
