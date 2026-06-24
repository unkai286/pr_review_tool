/**
 * CSV Exporter Module
 * Handles CSV generation and file download
 */

class CSVExporter {
    /**
     * Escape special characters in CSV fields
     */
    static escapeCSVField(field) {
        if (field === null || field === undefined) {
            return '';
        }

        const stringField = String(field);
        
        // If field contains comma, quote, or newline, wrap in quotes and escape quotes
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        
        return stringField;
    }

    /**
     * Convert comment data to CSV format
     */
    static generateCSV(comments) {
        // Define CSV headers
        const headers = [
            'PR Number',
            'PR Title',
            'PR Author',
            'PR State',
            'PR Created Date',
            'Comment Type',
            'Comment Author',
            'Comment Body',
            'Comment Created Date',
            'File Path',
            'Line Number',
            'Review State',
            'Keywords Found'
        ];

        // Create CSV rows
        const rows = [headers];

        comments.forEach(comment => {
            const row = [
                comment.prNumber,
                this.escapeCSVField(comment.prTitle),
                comment.prAuthor,
                comment.prState,
                comment.prCreatedAt,
                comment.commentType,
                comment.commentAuthor,
                this.escapeCSVField(comment.commentBody),
                comment.commentCreatedAt,
                this.escapeCSVField(comment.filePath || ''),
                comment.lineNumber || '',
                comment.reviewState || '',
                comment.matchedKeywords.join('; ')
            ];
            rows.push(row);
        });

        // Convert to CSV string
        return rows.map(row => row.join(',')).join('\n');
    }

    /**
     * Download CSV file
     */
    static downloadCSV(csvContent, filename) {
        // Create a Blob with UTF-8 BOM for proper Excel compatibility
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // Create download link
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
    }

    /**
     * Export comments to CSV file
     */
    static exportComments(comments) {
        if (!comments || comments.length === 0) {
            alert('No comments to export');
            return;
        }

        const csvContent = this.generateCSV(comments);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `pr-comments-${timestamp}.csv`;
        
        this.downloadCSV(csvContent, filename);
    }

    /**
     * Format comment data for CSV export
     */
    static formatCommentForExport(pr, comment, commentType, reviewState = null) {
        return {
            prNumber: pr.number,
            prTitle: pr.title,
            prAuthor: pr.user.login,
            prState: pr.state,
            prCreatedAt: new Date(pr.created_at).toISOString(),
            commentType: commentType,
            commentAuthor: comment.user.login,
            commentBody: comment.body || '',
            commentCreatedAt: new Date(comment.created_at).toISOString(),
            filePath: comment.path || '',
            lineNumber: comment.line || comment.original_line || '',
            reviewState: reviewState,
            matchedKeywords: comment.matchedKeywords || []
        };
    }
}

export default CSVExporter;

// Made with Bob
