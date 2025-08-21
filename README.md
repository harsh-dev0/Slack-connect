# Slack Connect

A full-stack application that enables users to connect their Slack workspace, send messages immediately, and schedule messages for future delivery. Built with TypeScript, React, Node.js, and MongoDB.

## 🌐 Live Demo

**[🚀 Try it live here](https://slack-connect-demo.vercel.app)**

> **Note**: You'll need your own Slack workspace to test the full functionality. The demo connects to real Slack workspaces through OAuth.
## 🎯 Features

### ✅ Core Requirements Implemented

1. **Secure Slack Connection & Token Management**
   - ✅ OAuth 2.0 flow implementation for Slack workspace connection
   - ✅ Secure storage of access and refresh tokens in MongoDB
   - ✅ Automatic token refresh logic to maintain continuous service
   - ✅ Token expiration handling and automatic re-authentication

2. **Message Sending (Immediate & Scheduled)**
   - ✅ Channel selection UI with real-time channel loading
   - ✅ Immediate message sending to selected channels
   - ✅ Schedule messages for specific future date and time
   - ✅ Persistent scheduled message storage with reliable delivery
   - ✅ Cron-based scheduling system for precise timing

3. **Scheduled Message Management**
   - ✅ Display all currently scheduled messages
   - ✅ Cancel scheduled messages before send time
   - ✅ Real-time status updates (pending, sent, failed, cancelled)
   - ✅ Auto-refresh scheduled messages list after actions

### 🎨 Additional Features

- **Modern Dark Theme UI** - Sleek, professional interface with Tailwind CSS
- **Toast Notifications** - User-friendly notifications instead of alerts
- **Real-time Health Check** - Server connection status indicator
- **Responsive Design** - Works on desktop and mobile devices
- **Error Handling** - Comprehensive error management and user feedback
- **TypeScript** - Full type safety across frontend and backend

## 🏗️ Architecture Overview

### Frontend Architecture
```
client/
├── src/
│   ├── components/          # React components
│   │   ├── AuthConnect.tsx      # OAuth connection UI
│   │   ├── MessageComposer.tsx  # Message creation interface
│   │   ├── ScheduledMessages.tsx # Message management
│   │   ├── CallbackHandler.tsx  # OAuth callback handling
│   │   └── HealthCheck.tsx      # Server status indicator
│   ├── context/             # React Context for state management
│   ├── services/            # API service layer
│   └── styles/              # Tailwind CSS styling
```

### Backend Architecture
```
server/
├── src/
│   ├── routes/              # Express route handlers
│   │   ├── auth.ts              # OAuth and authentication
│   │   ├── channels.ts          # Slack channel operations
│   │   └── messages.ts          # Message sending and scheduling
│   ├── services/            # Business logic layer
│   │   ├── slackService.ts      # Slack API integration
│   │   └── schedulerService.ts  # Message scheduling system
│   ├── models/              # MongoDB schemas
│   │   ├── User.ts              # User and token storage
│   │   └── ScheduledMessage.ts  # Scheduled message data
│   └── config/              # Database and environment config
```

### Key Technical Decisions

1. **OAuth 2.0 Implementation**
   - Uses Slack's OAuth v2 flow with proper scopes
   - Implements both user and bot tokens for comprehensive access
   - Automatic token refresh prevents service interruption

2. **Token Management Strategy**
   - Secure storage in MongoDB with expiration tracking
   - Proactive token refresh before expiration
   - Fallback handling for expired tokens

3. **Scheduling System**
   - Node-cron for precise message scheduling
   - Persistent job storage survives server restarts
   - Graceful handling of past-due messages

4. **Error Handling**
   - Comprehensive error boundaries in React
   - Structured error responses from API
   - User-friendly error messages and recovery

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Slack App with OAuth credentials

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/slack-connect.git
cd slack-connect
```

### 2. Slack App Configuration

1. Go to [Slack API](https://api.slack.com/apps) and create a new app
2. Configure OAuth & Permissions:
   - **Bot Token Scopes**: `channels:read`, `chat:write`, `users:read`
   - **User Token Scopes**: `channels:read`, `users:read`
   - **Redirect URLs**: `http://localhost:3001/api/auth/slack/callback`

3. Note your credentials:
   - Client ID
   - Client Secret
   - Signing Secret

### 3. Backend Setup

```bash
cd server
npm install
```

Create `.env` file in server directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/slack-connect

# Slack OAuth
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_REDIRECT_URI=http://localhost:3001/api/auth/slack/callback

# Application
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```

### 4. Frontend Setup

```bash
cd client
npm install
```

Create `.env` file in client directory:
```env
VITE_API_URL=http://localhost:3001/api
```

Start the frontend development server:
```bash
npm run dev
```

### 5. Access Application

Open your browser and navigate to `http://localhost:5173`

## 🔧 Technology Stack

### Frontend
- **React 19** - Modern UI library with hooks
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **React Hot Toast** - Beautiful toast notifications
- **Axios** - HTTP client for API communication
- **Date-fns** - Date manipulation and formatting
- **Vite** - Fast build tool and development server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type safety for backend code
- **MongoDB** - Document database for data persistence
- **Mongoose** - MongoDB object modeling
- **Node-cron** - Task scheduling for message delivery
- **Axios** - HTTP client for Slack API calls

### Development Tools
- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting
- **ts-node-dev** - TypeScript development server
- **Nodemon** - Auto-restart development server

## 🎮 Usage Guide

### 1. Connect to Slack
1. Click "Connect to Slack" button
2. Authorize the application in your Slack workspace
3. You'll be redirected back with a success message

### 2. Send Immediate Message
1. Select a channel from the dropdown
2. Type your message
3. Click "Send Now"
4. Receive confirmation toast notification

### 3. Schedule Message
1. Select a channel and type your message
2. Check "Schedule for later"
3. Choose date and time (must be in the future)
4. Click "Schedule Message"
5. Message appears in the scheduled messages list

### 4. Manage Scheduled Messages
- View all scheduled messages with status indicators
- Cancel pending messages before they're sent
- See delivery status and error messages if any

## 🛠️ API Endpoints

### Authentication
- `GET /api/auth/slack` - Get Slack OAuth URL
- `GET /api/auth/slack/callback` - Handle OAuth callback
- `GET /api/auth/status/:userId` - Check user authentication status

### Channels
- `GET /api/channels/:userId` - Get user's Slack channels

### Messages
- `POST /api/messages/send` - Send immediate message
- `POST /api/messages/schedule` - Schedule message for later
- `GET /api/messages/scheduled/:userId` - Get scheduled messages
- `DELETE /api/messages/scheduled/:messageId` - Cancel scheduled message

### Health
- `GET /api/health` - Server health check

## 🚧 Challenges & Learnings

### 1. OAuth Token Management
**Challenge**: Handling token expiration gracefully without user disruption.

**Solution**: Implemented automatic token refresh with the following strategy:
- Store token expiration time in database
- Check expiration before each API call
- Automatically refresh tokens using refresh_token
- Update stored tokens seamlessly in background

### 2. Reliable Message Scheduling
**Challenge**: Ensuring scheduled messages are sent even after server restarts.

**Solution**: 
- Persistent storage of scheduled jobs in MongoDB
- Re-initialize cron jobs on server startup
- Handle edge cases for past-due messages
- Implement job cleanup and error recovery

### 3. User Experience Optimization
**Challenge**: Creating a smooth, professional user interface.

**Solution**:
- Implemented toast notifications for better feedback
- Added real-time status indicators
- Created responsive dark theme design
- Auto-refresh data after user actions

### 4. Error Handling & Recovery
**Challenge**: Graceful handling of various failure scenarios.

**Solution**:
- Comprehensive error boundaries in React
- Structured error responses from API
- User-friendly error messages
- Automatic retry mechanisms where appropriate

## 🔐 Security Considerations

- **Token Storage**: Secure storage of OAuth tokens in database
- **Environment Variables**: Sensitive configuration in environment files
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Input Validation**: Server-side validation of all user inputs
- **Error Handling**: No sensitive information leaked in error messages



