# X Scheduler - A Full-Stack Twitter Scheduling Application

X Scheduler is a full-stack web application designed to empower users by allowing them to authenticate with their X (Twitter) account and schedule tweets to be posted at a future date and time. It features a secure and scalable backend built with NestJS and a modern, responsive frontend built with Next.js and Material-UI.

This project demonstrates a complete end-to-end development workflow, including third-party API integration, secure authentication, database management, and automated background tasks.

✨ Core Features
Secure OAuth 2.0 Authentication: A full, secure OAuth 2.0 flow with X (Twitter) to safely connect user accounts.

Intuitive Tweet Scheduling: A user-friendly interface to compose tweets and select a precise date and time for future posting.

Automated Cron-Based Posting: A reliable backend cron job runs every minute to check for and publish scheduled tweets automatically.

User Dashboard: A central dashboard where users can view lists of their upcoming "Scheduled" tweets and a history of their "Posted" tweets.

Robust NestJS Backend: A modular and scalable server-side architecture.

Modern Next.js Frontend: A fast, responsive user interface built with the Next.js App Router.

Token Management: Handles access token expiration and uses refresh tokens to maintain a persistent and secure user session.

## 🛠️ Technology Stack

| Area      | Technology                                                                                                    |
|-----------|---------------------------------------------------------------------------------------------------------------|
| **Backend**   | [NestJS](https://nestjs.com/), TypeScript, [Mongoose](https://mongoosejs.com/), [Passport.js](http://www.passportjs.org/), NestJS Schedule |
| **Frontend**  | [Next.js](https://nextjs.org/) (App Router), TypeScript, [Material-UI (MUI)](https://mui.com/), Emotion      |
| **Database**  | MongoDB                                                                                                       |
| **DevOps**    | Git, npm, Environment Variables                                                                               |

## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine for development and testing purposes.

Prerequisites
Node.js (v18 or later recommended)

npm (or yarn)

A running instance of MongoDB

A Twitter Developer Account with a new App created

### 1. Twitter Developer App Configuration

Before you begin, your app on the Twitter Developer Portal must be configured correctly:
1.  Navigate to your app's dashboard on the portal.
2.  Go to **"App settings" > "User authentication settings"** and click "Edit".
3.  Ensure **OAuth 2.0** is enabled.
4.  Set **App permissions** to **"Read and write"**.
5.  Set **Type of App** to **"Web App, Automated App or Bot"**.
6.  Under **Callback URI / Redirect URL**, add the following URL: `http://localhost:3000/auth/twitter/callback`
7.  Save the settings.
8.  Navigate to the **"Keys and Tokens"** tab and get your **"OAuth 2.0 Client ID and Client Secret"**.

### 2. Backend Setup (`x_scheduler_app`)

```bash
# 1. Navigate to the backend directory
cd x_scheduler_app

# 2. Install dependencies
npm install

# Create a .env file and add the following environment variables:

TWITTER_CLIENT_ID=your_oauth_2.0_client_id
TWITTER_CLIENT_SECRET=your_oauth_2.0_client_secret
TWITTER_CALLBACK_URL=http://localhost:3000/auth/twitter/callback
JWT_SECRET=a_very_long_and_random_secret_string_for_jwt
MONGODB_URI=mongodb://localhost:27017/x_scheduler_app
SESSION_SECRET=another_very_long_and_random_secret_for_sessions

# 4. Start the backend server (runs on http://localhost:3000)
npm run start:dev

##########. For Frontend
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the frontend development server (runs on http://localhost:3001)
npm run dev

4. You're Ready!
Open your web browser and go to http://localhost:3001.
The login page will appear. Click the "Login with Twitter" button to begin.
📈 Future Scope
This project has a solid foundation that can be extended with many professional features:
Real-time Log Streaming: Implement WebSockets to stream backend activity to the UI.
Media Uploads: Allow users to attach images or GIFs to their scheduled tweets.
Tweet Threads: Implement functionality to schedule a series of connected tweets.
Advanced Analytics: Fetch and display engagement metrics (likes, retweets) for posted tweets.
Deployment: Containerize the application with Docker and deploy to cloud services like Render, Fly.io, or AWS.
