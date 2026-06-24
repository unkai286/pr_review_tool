/**
 * GitHub API Service Module
 * Handles all interactions with the GitHub REST API
 */

class GitHubAPI {
    constructor(token) {
        this.token = token;
        this.baseUrl = 'https://api.github.com';
        this.headers = {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        };
    }

    /**
     * Validate the GitHub token by making a test API call
     */
    async validateToken() {
        try {
            const response = await fetch(`${this.baseUrl}/user`, {
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error('Invalid token or authentication failed');
            }

            const data = await response.json();
            return {
                valid: true,
                user: data.login,
                rateLimit: {
                    limit: response.headers.get('X-RateLimit-Limit'),
                    remaining: response.headers.get('X-RateLimit-Remaining'),
                    reset: response.headers.get('X-RateLimit-Reset')
                }
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }

    /**
     * Fetch all pull requests for a repository with pagination
     */
    async fetchPullRequests(owner, repo, startDate, endDate) {
        const allPRs = [];
        let page = 1;
        const perPage = 100;

        try {
            while (true) {
                const url = `${this.baseUrl}/repos/${owner}/${repo}/pulls?state=all&page=${page}&per_page=${perPage}&sort=updated&direction=desc`;
                const response = await fetch(url, { headers: this.headers });

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Repository not found. Please check the owner/repo format.');
                    }
                    throw new Error(`Failed to fetch pull requests: ${response.statusText}`);
                }

                const prs = await response.json();
                
                if (prs.length === 0) break;

                // Filter PRs by date range
                const filteredPRs = prs.filter(pr => {
                    const prDate = new Date(pr.created_at);
                    const start = startDate ? new Date(startDate) : new Date('2000-01-01');
                    const end = endDate ? new Date(endDate) : new Date();
                    end.setHours(23, 59, 59, 999); // Include the entire end date
                    
                    return prDate >= start && prDate <= end;
                });

                allPRs.push(...filteredPRs);

                // If we've gone past the start date, we can stop
                if (prs.length < perPage || (startDate && new Date(prs[prs.length - 1].created_at) < new Date(startDate))) {
                    break;
                }

                page++;
            }

            return allPRs;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Fetch reviews for a specific pull request
     */
    async fetchReviews(owner, repo, prNumber) {
        try {
            const url = `${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}/reviews`;
            const response = await fetch(url, { headers: this.headers });

            if (!response.ok) {
                throw new Error(`Failed to fetch reviews for PR #${prNumber}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching reviews for PR #${prNumber}:`, error);
            return [];
        }
    }

    /**
     * Fetch review comments for a specific pull request
     */
    async fetchReviewComments(owner, repo, prNumber) {
        try {
            const url = `${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}/comments`;
            const response = await fetch(url, { headers: this.headers });

            if (!response.ok) {
                throw new Error(`Failed to fetch comments for PR #${prNumber}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching comments for PR #${prNumber}:`, error);
            return [];
        }
    }

    /**
     * Fetch issue comments for a specific pull request
     */
    async fetchIssueComments(owner, repo, prNumber) {
        try {
            const url = `${this.baseUrl}/repos/${owner}/${repo}/issues/${prNumber}/comments`;
            const response = await fetch(url, { headers: this.headers });

            if (!response.ok) {
                throw new Error(`Failed to fetch issue comments for PR #${prNumber}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching issue comments for PR #${prNumber}:`, error);
            return [];
        }
    }

    /**
     * Fetch all comments (reviews, review comments, and issue comments) for a PR
     */
    async fetchAllCommentsForPR(owner, repo, prNumber) {
        try {
            const [reviews, reviewComments, issueComments] = await Promise.all([
                this.fetchReviews(owner, repo, prNumber),
                this.fetchReviewComments(owner, repo, prNumber),
                this.fetchIssueComments(owner, repo, prNumber)
            ]);

            return {
                reviews,
                reviewComments,
                issueComments
            };
        } catch (error) {
            console.error(`Error fetching all comments for PR #${prNumber}:`, error);
            return {
                reviews: [],
                reviewComments: [],
                issueComments: []
            };
        }
    }

    /**
     * Get current rate limit status
     */
    async getRateLimit() {
        try {
            const response = await fetch(`${this.baseUrl}/rate_limit`, {
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error('Failed to fetch rate limit');
            }

            const data = await response.json();
            return data.rate;
        } catch (error) {
            console.error('Error fetching rate limit:', error);
            return null;
        }
    }
}

export default GitHubAPI;

// Made with Bob
