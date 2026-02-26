# MCP Servers Setup Guide

## Installed MCP Servers

I've installed 7 MCP servers to your user config (`~/.kiro/settings/mcp.json`):

### ✅ Ready to Use (No Setup Required)

1. **fetch** - Already configured, fetches web content
2. **playwright** - Browser automation for your e2e tests
3. **puppeteer** - Alternative browser automation
4. **sequential-thinking** - Complex problem-solving
5. **memory** - Maintains context across sessions

### 🔑 Requires API Keys

6. **github** - Needs GitHub Personal Access Token
7. **brave-search** - Needs Brave Search API Key

## Setting Up API Keys

### GitHub MCP Server

1. **Create GitHub Personal Access Token**:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes:
     - `repo` (full control of private repositories)
     - `workflow` (update GitHub Actions workflows)
     - `read:org` (read organization data)
   - Copy the token

2. **Add to MCP config**:
   - Open: `C:\Users\Joe\.kiro\settings\mcp.json`
   - Find the `github` section
   - Replace `"GITHUB_PERSONAL_ACCESS_TOKEN": ""` with your token:
     ```json
     "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
     ```

### Brave Search MCP Server (Optional)

1. **Get Brave Search API Key**:
   - Go to: https://brave.com/search/api/
   - Sign up for free tier (2,000 queries/month)
   - Copy your API key

2. **Add to MCP config**:
   - Open: `C:\Users\Joe\.kiro\settings\mcp.json`
   - Find the `brave-search` section
   - Replace `"BRAVE_API_KEY": ""` with your key:
     ```json
     "BRAVE_API_KEY": "your_api_key_here"
     ```

## How to Use MCP Servers

### Playwright (Browser Automation)
```
"Use Playwright to test the homepage navigation"
"Take a screenshot of the photography page"
"Run accessibility tests on the contact form"
```

### GitHub
```
"Show me recent commits on the main branch"
"Create a new branch for the LCP optimization"
"List all open pull requests"
```

### Sequential Thinking
```
"Help me debug why CloudFront cache isn't working"
"Analyze the deployment pipeline and suggest improvements"
```

### Memory
```
"Remember that our LCP target is 1.5 seconds"
"What was the last deployment ID?"
```

### Puppeteer
```
"Generate a PDF of the pricing page"
"Test form submission on the contact page"
```

### Brave Search
```
"Search for Next.js 15 image optimization best practices"
"Find latest AWS CloudFront pricing information"
```

## Reconnecting Servers

After updating the config:
1. Open Kiro's MCP Server view (in the feature panel)
2. Click "Reconnect" on any server
3. Or restart Kiro

## Disabling Servers

To disable a server temporarily:
```json
"disabled": true
```

## Auto-Approve Tools

To skip approval prompts for specific tools:
```json
"autoApprove": ["tool_name_1", "tool_name_2"]
```

## Troubleshooting

### Server Won't Start
- Check that `uvx` is installed: `uvx --version`
- Check that `npx` is available: `npx --version`
- View server logs in Kiro's MCP Server panel

### GitHub Server Issues
- Verify token has correct scopes
- Check token hasn't expired
- Ensure no extra spaces in the token string

### Brave Search Issues
- Verify API key is valid
- Check you haven't exceeded free tier limits
- Ensure key is properly quoted in JSON

## Benefits for Your Project

**Playwright MCP**:
- Automate your extensive e2e test suite
- Generate screenshots for documentation
- Test responsive design across viewports

**GitHub MCP**:
- Manage your GitHub Actions workflows
- Review deployment history
- Create branches for features

**Sequential Thinking**:
- Debug complex AWS/CloudFront issues
- Optimize deployment pipelines
- Analyze performance bottlenecks

**Memory MCP**:
- Remember project-specific configurations
- Track deployment IDs and versions
- Maintain context about your infrastructure

## Next Steps

1. ✅ MCP servers installed
2. 🔑 Add GitHub token (recommended)
3. 🔑 Add Brave API key (optional)
4. 🔄 Reconnect servers in Kiro
5. 🧪 Test with simple commands

---

**Config Location**: `C:\Users\Joe\.kiro\settings\mcp.json`  
**Installed**: November 11, 2025
