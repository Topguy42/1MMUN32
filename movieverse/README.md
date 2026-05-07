<div align="center">
  <a href="" target="_blank">
    <img src="https://github.com/Amritanshu312/MovieVerse/blob/main/public/images/logo-2.png" alt="Logo" width="200" height="200">
  </a>

  <h2 align="center">MovieVerse</h3>

  <p align="center">
    An open-source Movie/TV streaming site built with Nextjs 14
  </p>
</div>

# About the Project

Experience uninterrupted, ad-free streaming with seamless progress tracking thanks to Firebase integration, powered by the TMDB api. Our platform, built using Next.js 14, Nextui, MongoDB, and Redis, ensures a smooth and enjoyable user experience.

## :sparkles: Features

- [x] `Search`: Get a list of all Movies/TV you want using filters.
- [x] `Watch`: Stream any available episode, whether dubbed or subbed.
- [x] `Comment`: Share your thoughts on episodes or provide helpful information for others.
- [x] `Log In`: Sign in with your Google Account (note: some restrictions may apply).
- [x] `Sync Integration`: Seamlessly sync your Movies/TV You want to watch.
- [x] `Keep Watching`: Resume episodes from where you left off with local tracking.
- [x] `Track Your Favorites`: Organize your Movies/TV into Completed, Dropped, Planning, and more.
- [x] `Episode Tracking`: Mark episodes you've watched and pick up where you left off.
- [x] `Effortless Search`: Quickly search for any Movies/TV with ease.
- [x] `Modern Video Player`: Enjoy a sleek and up-to-date video player experience.
- [x] `Fully Responsive`: Access and enjoy your content on all devices.

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

```
## TMDB API
**TMDB_API_KEY**=`your_tmdb_api_key_here`

## Next.js Application
**NEXT_PUBLIC_URL**=`http://localhost:3000`

## Encryption Key
**NEXT_PUBLIC_ENCRYPTION_KEY**=`run this command in your terminal (openssl rand -base64 32)`

## Firebase Configuration
- **apiKey**=`Your Firebase Api Key`
- **authDomain**=`Your Firebase authDomain`
- **projectId**=`Your Firebase projectId`
- **storageBucket**=`Your Firebase storageBucket`
- **messagingSenderId**=`Your Firebase messagingSenderId`
- **appId**=`Your Firebase appId`
- **measurementId**=`Your Firebase measurementId`
```

## 📚: Tecnologies Used

Front-end:

- `Next.js`
- `Javascript`
- `Axios`
- `Context API`
- `react-icons`
- `Framer Motion`
- `React Progress Bar`
- `Firebase`
- `TMDB API`
- `Disqus`
- `Art Player`
- `Yt-dlp`

Back-End:

- `Mongoose`
- `Next.js (API) Route Handler`

## Run Locally

Clone the project

```bash
  git clone https://github.com/Amritanshu312/MovieVerse.git
```

Go to the project directory

```bash
  cd MovieVerse
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```

## 🔥: Firebase Setup Guide

1. **Create a Firebase Project**:

   - Go to the Firebase Console
   - Click on "Add project" and follow the prompts:
   - Enter a project name (e.g., "MovieVerse").
   - Choose whether to enable Google Analytics.
   - Accept the terms and create the project.
     <br/>

2. **Register Your App with Firebase**:

   - From the Firebase project dashboard, click on the web icon (</>).
   - Register your app with a nickname (e.g., "movieverse-web").
   - Check the box to set up Firebase Hosting if needed.
   - Click "Register app"
     <br/>

3. **Enable Authentication Methods**:

   - In the Firebase Console, go to "Authentication" > "Sign-in method".
   - Enable the authentication methods you need ( Google ).
     <br/>

4. **Set Up Firestore Database**:

   - Go to "Firestore Database" in the Firebase Console.
   - Click "Create database".
   - Select either "Production mode" or "Test mode" (start with Test mode for development).
   - Choose a database location closest to your users.
   - Click "Enable"
     <br/>

5. **Configure Firestore Security Rules**:

   - Go to "Firestore Database" > "Rules" tab
   - Set up basic security rules:

     ```
     rules_version = '2';

     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read,write,delete: if false;
         }

         match /users/{userId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
           allow write: if request.auth != null && request.auth.uid == request.resource.data.uid && request.resource.data.feed_description != "";
           allow delete: if request.auth != null && request.auth.uid == resource.data.uid;
         }

         match /savedMovies/{uid}/{status}/{movieId} {

           // Ensure only authenticated users can perform actions on their own data
           allow read, write: if request.auth != null && request.auth.uid == uid;

           // Optional: You can define more granular rules for certain actions like create, update, delete:
           allow create: if request.auth != null && request.auth.uid == uid && request.resource.data.status in ["CURRENT", "PLANNING", "COMPLETED", "PAUSED", "DROPPED"];
           allow delete: if request.auth != null && request.auth.uid == uid;
         }

         // Optional: You could have a more global rule for accessing the "savedMovies" collection.
         match /savedMovies/{uid} {
           allow read: if request.auth != null && request.auth.uid == uid;
           allow write: if request.auth != null && request.auth.uid == uid;
         }
       }
     }
     ```
