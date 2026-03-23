# ⚡ DevPulse

> The global directory and portfolio tracker for architectural developers.

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg?style=flat&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-4ea94b.svg?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**DevPulse** is a full-stack MERN application built as a major practical capstone project. It serves as a real-time dashboard that allows developers to manage their professional identity, track their learning progress, and integrate live repository data directly from the GitHub GraphQL and REST APIs.

🔗 **[View Live Application](https://devpulse-smsram.vercel.app)**

---

## ✨ Key Features

* **Secure Authentication:** Custom JWT-based login and registration system with bcrypt password hashing.
* **Developer Directory:** A searchable, live-updating global directory of registered architectural developers.
* **GitHub Ecosystem Sync:** Real-time fetching of repositories, language proficiency, and contribution heatmaps using GitHub's GraphQL API.
* **Asset Management:** Cloudinary integration for seamless profile picture and resume (PDF/Doc) uploads.
* **Dynamic Portfolio Generation:** Asymmetric, responsive public profiles built with CSS Grid and Flexbox.
* **Privacy Controls:** Toggle visibility settings to manage public access to developer profiles.

---

## 🛠️ Tech Stack

### Frontend (Client)
* **Framework:** React 18 (Bootstrapped with Vite)
* **Routing:** React Router v6
* **Styling:** Custom Vanilla CSS (Modern CSS properties, Grid, Flexbox, Glassmorphism)
* **Deployment:** Vercel 

### Backend (Server)
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB Atlas (Mongoose ODM)
* **Authentication:** JSON Web Tokens (JWT)
* **File Storage:** Cloudinary & Multer
* **Deployment:** Render Web Services

---

## 📁 Project Structure & Cloud Deployment

This repository is structured as a monorepo. The frontend and backend are separated into distinct directories to support independent cloud deployments.

```text
devpulse/
│
├── client/                 # 🌐 FRONTEND (Deployed via Vercel)
│   ├── public/             # Static assets (favicons, manifest)
│   ├── src/                
│   │   ├── components/     # Reusable UI elements (Toast, Loader, ConfirmAlert)
│   │   ├── layouts/        # AppLayout and PublicLayout wrappers
│   │   ├── pages/          # Route views (Dashboard, Integrations, PublicProfile)
│   │   ├── services/       # Axios API configurations (api.jsx)
│   │   ├── App.jsx         # Main router mapping
│   │   └── main.jsx        # React DOM entry point
│   ├── package.json        # Client dependencies
│   └── vite.config.js      # Vite build configuration
│
├── server/                 # ⚙️ BACKEND (Deployed via Render)
│   ├── middleware/         # Custom JWT Auth verification (auth.js)
│   ├── models/             # Mongoose Schemas (User, Settings, Project)
│   ├── routes/             # RESTful API endpoints 
│   │   ├── analytics.js    # GitHub GraphQL data processing
│   │   ├── auth.js         # Login/Register logic
│   │   ├── public.js       # Unprotected routes for directory & profiles
│   │   └── settings.js     # Protected profile & Cloudinary upload routes
│   ├── package.json        # Server dependencies
│   └── index.js            # Express server entry point
│
├── .gitignore              # Ignores node_modules and .env files
└── README.md               # Project documentation


## 🚀 Local Development Setup

Follow these steps to run DevPulse on your local machine.

### Prerequisites
* **Node.js** (v16 or higher)
* A **MongoDB Atlas** account / cluster
* A **Cloudinary** account
* A **GitHub Personal Access Token** (PAT)

### 1. Clone the repository
```bash
git clone [https://github.com/smsram/devpulse.git](https://github.com/smsram/devpulse.git)
cd devpulse
````

### 2\. Install Dependencies

You will need to install dependencies for both the client and the server.

```bash
# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

### 3\. Environment Variables

Create a `.env` file in both the `server` and `client` directories.

**server/.env**

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GITHUB_PAT=your_github_personal_access_token
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**client/.env**

```env
# For local development:
VITE_API_URL=http://localhost:5000/api

# For production, this is updated to the Render Web Service URL
```

### 4\. Run the Application

Open two separate terminal windows.

**Terminal 1: Start the Backend**

```bash
cd server
npm run dev
# Server will start on http://localhost:5000
```

**Terminal 2: Start the Frontend**

```bash
cd client
npm run dev
# Client will start on http://localhost:5173
```

-----

## 👨‍💻 Author

**Meher Siva Ram Sorampudi**

  * Junior Full-Stack Developer Intern
  * GitHub: [@smsram](https://www.google.com/search?q=https://github.com/smsram)

<!-- end list -->

```
