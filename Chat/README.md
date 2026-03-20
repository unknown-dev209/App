# Firebase Real-Time Chat App

A fully functional real-time chat application built with React and Firebase. Features one-on-one chat, group chat, typing indicators, message timestamps, and read receipts.

![Chat App Preview](https://via.placeholder.com/800x500/3B82F6/FFFFFF?text=Firebase+Chat+App)

## Features

### Authentication
- **Google Sign-In** - Quick authentication with Google accounts
- **Email/Password** - Traditional email and password registration/login
- **Persistent Sessions** - Stay logged in across page refreshes

### Chat Features
- **One-on-One Chat** - Private messaging between two users
- **Group Chat** - Create groups with multiple participants
- **Real-time Messages** - Instant message delivery using Firestore
- **Typing Indicators** - See when someone is typing
- **Read Receipts** - Know when your messages are read
- **Message Timestamps** - See when messages were sent
- **Edit Messages** - Edit your sent messages
- **Delete Messages** - Remove messages from the chat
- **Reply to Messages** - Reply to specific messages
- **Unread Counts** - Badge showing unread messages

### UI/UX
- **Responsive Design** - Works on desktop and mobile devices
- **Modern Interface** - Clean, intuitive design with Tailwind CSS
- **Online Status** - See when users are online/offline
- **Search Chats** - Find conversations quickly
- **Smooth Animations** - Polished user experience

## Folder Structure

All files are in the root folder (no subfolders):

```
chat-app/
├── index.html          # HTML entry point
├── main.jsx            # All React components and logic
├── firebase.js         # Firebase configuration and functions
├── tailwind.css        # Tailwind CSS styles
├── tailwind.config.js  # Tailwind configuration
├── postcss.config.js   # PostCSS configuration
├── vite.config.js      # Vite configuration
├── package.json        # Dependencies
├── .env.example        # Environment variables template
└── README.md           # This file
```

## Quick Start

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" and follow the setup
3. Enable Authentication:
   - Go to **Authentication** > **Sign-in method**
   - Enable **Email/Password** provider
   - Enable **Google** provider
4. Create Firestore Database:
   - Go to **Firestore Database** > **Create database**
   - Choose **Start in test mode** for development
5. Get your Firebase config:
   - Go to **Project Settings** > **General**
   - Scroll to **Your apps** section
   - Click the web icon (</>) to register a new web app
   - Copy the `firebaseConfig` object

### 2. Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase credentials in `.env`:
   ```
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized files.

## Deployment

### Netlify (Drag & Drop)

1. Build the project:
   ```bash
   npm run build
   ```

2. Drag and drop the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)

3. Your app is live! 🎉

### Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy
```

## Firestore Security Rules

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Chats - users can only access chats they're participants of
    match /chats/{chatId} {
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      allow create: if request.auth != null && 
        request.auth.uid in request.resource.data.participants;
      allow update: if request.auth != null && 
        request.auth.uid in resource.data.participants;

      // Messages within chats
      match /messages/{messageId} {
        allow read: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow create: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow update: if request.auth != null && 
          request.auth.uid == resource.data.senderId;
        allow delete: if request.auth != null && 
          request.auth.uid == resource.data.senderId;
      }

      // Typing indicators
      match /typing/{userId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Environment Variables Reference

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API key | Firebase Console > Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain (usually `project.firebaseapp.com`) | Firebase Console > Project Settings |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID | Firebase Console > Project Settings |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket (usually `project.appspot.com`) | Firebase Console > Project Settings |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging sender ID | Firebase Console > Project Settings |
| `VITE_FIREBASE_APP_ID` | Your Firebase app ID | Firebase Console > Project Settings |

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Firebase** - Backend services
  - **Authentication** - User authentication
  - **Firestore** - Real-time database
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+

## Troubleshooting

### "Firebase App not initialized" error
Make sure your `.env` file exists and all variables are set correctly.

### "Permission denied" errors
Check your Firestore security rules. For development, you can use test mode rules.

### Messages not appearing in real-time
Ensure Firestore is properly configured and the security rules allow read access.

### Build fails
Make sure all dependencies are installed:
```bash
rm -rf node_modules package-lock.json
npm install
```

## License

MIT License - feel free to use this for personal or commercial projects!

## Support

For issues or questions:
1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Review [React Documentation](https://react.dev)
3. Open an issue on the project repository
