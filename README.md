# GitHub PR Review Comments Viewer

A browser-based application for viewing and exporting GitHub Pull Request review comments with drill-down tree structure and keyword filtering.

## Features

- 🔐 **GitHub Authentication**: Secure authentication using Personal Access Token
- 📊 **PR Review Comments**: Fetch all review comments, review comments, and issue comments from PRs
- 🔍 **Keyword Filtering**: Filter comments by predefined keywords (DEV, DESIGN, SEC, TEST, PERF) or custom keywords
- 📅 **Date Range Filtering**: Filter PRs by creation date range
- 🌳 **Drill-Down Tree View**: Hierarchical display of PRs and their comments with expand/collapse functionality
- 📥 **CSV Export**: Download filtered comments as CSV file for further analysis
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **No Build Tools**: Pure HTML/CSS/JavaScript - just open and use

## Prerequisites

- Modern web browser (Chrome, Firefox, Safari, or Edge)
- GitHub Personal Access Token with appropriate permissions

## Setup

### 1. Clone or Download

Download this repository or clone it:

```bash
git clone <repository-url>
cd pr2csv
```

### 2. Create GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "PR Comments Viewer")
4. Select scopes:
   - For **public repositories**: `public_repo`
   - For **private repositories**: `repo` (full control)
5. Click "Generate token"
6. **Copy the token immediately** (you won't be able to see it again)

### 3. Open the Application

Simply open `index.html` in your web browser:

```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

Or drag and drop `index.html` into your browser.

## Usage

### Step 1: Authentication

1. Enter your GitHub Personal Access Token in the input field
2. Click "Authenticate"
3. If successful, you'll see a confirmation message with your GitHub username

### Step 2: Configure Filters

1. **Repository**: Enter the repository in `owner/repo` format (e.g., `facebook/react`)
2. **Date Range**: Select start and end dates (defaults to last 30 days)
3. **Keywords**: 
   - Check predefined keywords: DEV, DESIGN, SEC, TEST, PERF
   - Add custom keywords in the text field (comma-separated)
4. Click "Fetch Comments"

### Step 3: View Results

- Comments are grouped by Pull Request
- Click on a PR header to expand/collapse its comments
- Each comment shows:
  - Author and timestamp
  - Comment type (Review, Review Comment, Issue Comment)
  - Review state (if applicable)
  - File path and line number (for review comments)
  - Matched keywords (highlighted as tags)

### Step 4: Export to CSV

1. Click "Download CSV" button
2. CSV file will be downloaded with filename: `pr-comments-{timestamp}.csv`
3. CSV includes all filtered comments with columns:
   - PR Number, PR Title, PR Author, PR State, PR Created Date
   - Comment Type, Comment Author, Comment Body, Comment Created Date
   - File Path, Line Number, Review State, Keywords Found

## File Structure

```
pr2csv/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Application styles
├── js/
│   ├── app.js          # Main application logic
│   ├── githubApi.js    # GitHub API service
│   ├── csvExporter.js  # CSV generation and download
│   └── utils.js        # Helper functions
└── README.md           # This file
```

## Features in Detail

### Keyword Filtering

The application searches for keywords in comment bodies (case-insensitive). You can:

- Use predefined keywords: DEV, DESIGN, SEC, TEST, PERF
- Add custom keywords (comma-separated)
- Comments matching any keyword will be highlighted
- Filter can be updated in real-time without re-fetching data

### Comment Types

The application fetches three types of comments:

1. **Review**: Overall PR review with state (APPROVED, CHANGES_REQUESTED, COMMENTED)
2. **Review Comment**: Line-specific comments on code changes
3. **Issue Comment**: General comments on the PR discussion

### Date Range

- Default: Last 30 days
- Filters PRs by their creation date
- End date is inclusive (includes the entire day)

### CSV Export

CSV file includes UTF-8 BOM for proper Excel compatibility and handles:
- Special characters (commas, quotes, newlines)
- Multi-line comments
- Empty fields

## API Rate Limits

GitHub API has rate limits:
- **Authenticated requests**: 5,000 requests per hour
- **Unauthenticated requests**: 60 requests per hour

The application shows progress while fetching to keep you informed. For repositories with many PRs, fetching may take some time.

## Security Notes

- Personal Access Token is stored in `sessionStorage` (cleared when tab closes)
- Token is never logged or exposed in the console
- All API calls use HTTPS
- User input is sanitized to prevent XSS attacks

## Troubleshooting

### "Invalid token or authentication failed"
- Verify your token is correct
- Ensure token has required scopes (`repo` or `public_repo`)
- Check if token hasn't expired

### "Repository not found"
- Verify repository format: `owner/repo`
- Ensure you have access to the repository
- For private repos, token must have `repo` scope

### "No pull requests found"
- Adjust date range
- Verify repository has PRs in the specified date range
- Check repository name is correct

### Rate Limit Exceeded
- Wait for rate limit to reset (shown in error message)
- Reduce date range to fetch fewer PRs
- Use authenticated requests (higher limit)

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Internet Explorer: ❌ Not supported (use modern browser)

## Privacy

- No data is sent to any server except GitHub API
- All processing happens in your browser
- Token is stored only in sessionStorage (not persistent)
- No analytics or tracking

## Contributing

Feel free to submit issues or pull requests to improve this application.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built with vanilla JavaScript (no frameworks)
- Uses GitHub REST API v3
- Inspired by the need for better PR review analysis tools

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review GitHub API documentation: https://docs.github.com/en/rest
3. Open an issue in this repository

---

**Note**: This application requires an active internet connection to fetch data from GitHub API.