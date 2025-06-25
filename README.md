X Scheduler - A Full-Stack Twitter Scheduling Application

**X Scheduler** is a full-stack web application designed to empower users by allowing them to authenticate with their X (Twitter) account and schedule tweets to be posted at a future date and time. It features a secure and scalable backend built with NestJS and a modern, responsive frontend built with Next.js and Material-UI.
=======

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

🛠️ Technology Stack
Area	Technology
Backend	NestJS, TypeScript, Mongoose, Passport.js, NestJS Schedule
Frontend	Next.js (App Router), TypeScript, Material-UI (MUI), Emotion
Database	MongoDB
DevOps	Git, npm, Environment Variables

🚀 Getting Started
Follow these instructions to set up and run the project on your local machine for development and testing purposes.

Prerequisites
Node.js (v18 or later recommended)

npm (or yarn)

A running instance of MongoDB

A Twitter Developer Account with a new App created

1️⃣ Twitter Developer App Configuration
Before you begin, your app on the Twitter Developer Portal must be configured:

Navigate to your app's dashboard on the portal.

Go to "App settings" > "User authentication settings" and click Edit.

Enable OAuth 2.0.

Set App permissions to Read and write.

Set Type of App to Web App, Automated App or Bot.

Under Callback URI / Redirect URL, add:

bash
Copy
Edit
http://localhost:3000/auth/twitter/callback
Save the settings.

Go to Keys and Tokens tab and get your OAuth 2.0 Client ID and Client Secret.

2️⃣ Backend Setup (x_scheduler_app)
bash
Copy
Edit
# Navigate to the backend directory
cd x_scheduler_app

# Install dependencies
npm install

# Create a .env file and add the following environment variables:

TWITTER_CLIENT_ID=your_oauth_2.0_client_id
TWITTER_CLIENT_SECRET=your_oauth_2.0_client_secret
TWITTER_CALLBACK_URL=http://localhost:3000/auth/twitter/callback
JWT_SECRET=a_very_long_and_random_secret_string_for_jwt
MONGODB_URI=mongodb://localhost:27017/x_scheduler_app
SESSION_SECRET=another_very_long_and_random_secret_for_sessions

# Start the backend server (runs on http://localhost:3000)
npm run start:dev
3️⃣ Frontend Setup (frontend)
bash
Copy
Edit
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend development server (runs on http://localhost:3001)
npm run dev
✅ You're Ready!
Open your browser and go to:
http://localhost:3001

The login page will appear. Click Login with Twitter to begin.

📡 API Endpoints
All endpoints are prefixed with: http://localhost:3000

Authentication Endpoints (/auth)
Method	Endpoint	Protection	Description
GET	/auth/twitter	Public	Initiates OAuth 2.0 flow
GET	/auth/twitter/callback	Public	Handles callback from Twitter, exchanges code for tokens
POST	/auth/refresh	Public	Refreshes expired Twitter access token
GET	/auth/me	JWT	Retrieves authenticated user profile

Twitter Endpoints (/twitter)
Method	Endpoint	Protection	Description
POST	/twitter/post	JWT	Posts tweet immediately
POST	/twitter/schedule	JWT	Schedules tweet for future posting
GET	/twitter/scheduled	JWT	Retrieves scheduled tweets
GET	/twitter/posted	JWT	Retrieves posted tweets

Protection Types:
Public: Accessible by anyone.

JWT: Requires valid JSON Web Token (Authorization: Bearer <token> header).

