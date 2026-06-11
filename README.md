# Vibeo

A full-stack social media platform where users can connect, share posts, interact with content, and engage with others in real time.

## Live Demo

- Frontend: https://social-media-web-platform-mern-x3jy.vercel.app


# Features

- User Authentication & Authorization:
  - JWT Token-Based Authentication
  - Role-Based Access Control
  - Email Verification & Confirmation
  - Google OAuth Support
  - Password Hashing
  - Protected Routes

- Profile Creation & Management:
  - Profile Setup with:
    - First Name
    - Last Name
    - Date of Birth
    - Location
    - Bio
    - Interests
  - Profile Image Upload
  - Cover Image Upload
  - Profile Editing & Updates

- Create, Edit & Delete Posts:
  - Post Scheduling
  - Post Appearance Customization
  - Location-Based Posts

- Image & Media Uploads:
  - Cloud Storage using Google Cloud

- Search & Discovery:
  - Search Users
  - Search Posts
  - Search Keyword Tracking
  - User Search History Storage
  - Optimized Search Suggestions
  - Interest-Based Content Discovery

- Social Engagement:
  - Like Posts
  - Comment on Posts
  - Reply to Comments
  - Share Posts

- Analytics:
  - Post View Tracking
  - Engagement Analytics

- Network Management:
  - Follow / Unfollow Users
  - Send Connection Requests
  - Accept / Reject Connection Requests
  - Manage Professional Network

- Feed Generation:
  - Personalized Feed Ranking
  - Interest-Based Content Recommendations
  - Network-Based Content Prioritization

- Real-Time Notifications:
  - New Posts from Network
  - Likes on Posts
  - Likes on Comments
  - Comment Replies
  - New Messages
  - Comments on Posts
  - Connection Requests
  - New Followers
  - Additional Activity Notifications

- Real-Time Messaging:
  - One-to-One Chatting
  - Socket-Based Message Delivery
  - Message Encryption
  - Secure Media Transfer

- Security & Privacy:
  - Privacy Controls
  - Secure Backend APIs
  - Access-Controlled Resources

- User Experience:
  - Fully Responsive UI
  - Modern JavaScript & CSS Frameworks

- Infrastructure:
  - Cloud-Based Media Storage
  - Scalable Backend Architecture

# Tech Stack

## Frontend
- React.js
- Tailwind CSS
- Axios
- React Router

## Backend
- Node.js
- Express.js
- MongoDB
- Google Cloud Storage
-  Socket IO

## Deployment:

- Frontend: https://social-media-web-platform-mern-x3jy.vercel.app
- Backend: Render

Clone the Repository:
```
git clone https://github.com/sankhidarjun123-web/Social-Media-Web-Platform-MERN.git
cd Social-Media-Web-Platform-MERN
```
Backend Setup:
```
cd server
npm install
npm run build
```
Create a .env file:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
etc
```

Backend Start:
```
npm start
```
Frontend Setup
```
cd socialMediaFront
npm install
```
Start the frontend:
```
npm run dev
```
### Author Information:
- Name: Arjun Sankhi
- GitHub: [https://github.com/your-username](https://github.com/sankhidarjun123-web)
- LinkedIn: [https://linkedin.com/in/your-profile](https://www.linkedin.com/in/arjun-sankhi-b10663372/)
