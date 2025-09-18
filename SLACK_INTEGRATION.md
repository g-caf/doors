# Slack Integration Guide

## Overview

The guest check-in system now supports Slack notifications, allowing visitors to automatically notify employees through direct messages or channel notifications when they arrive.

## Setup

### 1. Slack App Configuration

1. Create a Slack app at https://api.slack.com/apps
2. Enable the following bot token scopes:
   - `chat:write` - Send messages as the bot
   - `users:read` - Look up users by email
   - `users:read.email` - Access user email addresses

### 2. Environment Configuration

Add your Slack bot token to your `.env` file:

```env
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token-here
SLACK_DEFAULT_CHANNEL=#front-desk-notifications
```

### 3. Employee Setup

For each employee, you can:
- **Automatic**: The system will look up Slack users by email automatically
- **Manual**: Set the `slackUserId` field directly when creating/updating employees

## API Endpoints

### Test Slack Connection
```http
GET /api/slack/test
Authorization: Admin session required
```

Returns Slack workspace and bot information if connection is successful.

### Lookup Slack User
```http
POST /api/slack/lookup-user
Authorization: Admin session required
Content-Type: application/json

{
  "email": "employee@company.com"
}
```

Returns the Slack user ID for the given email address.

### Send Notification (Enhanced)
```http
POST /api/notify
Content-Type: application/json

{
  "employeeId": "1",
  "guestName": "John Doe", 
  "guestMessage": "Here for the 2pm meeting",
  "channelId": "#front-desk" // Optional: fallback channel
}
```

The system will:
1. Try to send a direct message to the employee (if Slack user ID is known)
2. Fall back to sending a channel message (if channelId provided)
3. Log the notification attempt in the activity log

## Message Format

**Direct Messages:**
```
👋 Hi [Employee Name]! [Visitor Name] is here to see you at the front desk.
```

**Channel Messages:**
```  
👋 [Visitor Name] is here to see [Employee Name] at the front desk.
```

## Error Handling

The system gracefully handles:
- Missing Slack configuration
- Invalid Slack tokens
- Unknown employees
- Network errors

All Slack operations are non-blocking - if Slack fails, the basic notification logging still works.

## Testing

Run the API test suite to verify Slack integration:

```bash
npm run test
```

Or test specific Slack functionality:

```bash
# Start the server
npm start

# Test Slack connection (requires admin login)
curl -X GET http://localhost:3000/api/slack/test

# Test notification with Slack
curl -X POST http://localhost:3000/api/notify \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"1","guestName":"Test Visitor"}'
```

## Troubleshooting

### "Slack not configured" 
- Verify `SLACK_BOT_TOKEN` is set in your environment
- Check that the token starts with `xoxb-`

### "Slack user not found"
- Ensure the employee's email matches their Slack account email
- Verify the bot has `users:read.email` scope
- The user must be in the same Slack workspace as the bot

### "Insufficient permissions"
- Check that your Slack app has the required bot token scopes
- Verify the bot token (not user token) is being used

## Security Notes

- Store the Slack bot token securely - never commit it to version control
- The bot can only access users in the same Slack workspace
- All API endpoints require appropriate authentication
