# 🌐 Social App API

A scalable social media backend built with **Node.js**, **TypeScript**, and **Express.js**. The platform supports authentication, posts, comments, real-time chat, file uploads, and email verification while following a modular and repository-based architecture.

---

## 🚀 Features

### 🔐 Authentication

* User Registration
* Secure Login
* Email Verification with OTP
* JWT Authentication
* Refresh Token Support
* Logout (Token Revocation)

### 👤 User Management

* Update User Profile
* Upload Profile Picture
* Upload Cover Image
* Change Password

### 📝 Posts

* Create Posts
* Update Posts
* Delete Posts
* Like/Unlike Posts
* Retrieve User Posts
* Retrieve Feed Posts

### 💬 Comments

* Add Comments
* Update Comments
* Delete Comments
* Retrieve Post Comments

### 📡 Real-Time Chat

* One-to-One Messaging
* WebSocket Communication using Socket.IO
* Chat History
* Real-Time Events

### ☁️ File Uploads

* Cloudinary Upload Support
* AWS S3 Upload Support
* Multer Integration

### 📧 Email Service

* Verification Emails
* OTP Generation
* Event-Based Email Sending

### 🛡️ Security

* Password Hashing
* JWT Authentication
* Authorization Middleware
* Request Validation
* Centralized Error Responses

---

# 🛠️ Tech Stack

* **TypeScript**
* **Node.js**
* **Express.js**
* **MongoDB**
* **Mongoose**
* **Socket.IO**
* **JWT (jsonwebtoken)**
* **bcrypt**
* **Multer**
* **Cloudinary**
* **AWS S3**
* **Nodemailer**

---

# 📁 Project Structure

```text
src/
├── DB/
│   ├── models/
│   │   ├── chat.model.ts
│   │   ├── comment.model.ts
│   │   ├── post.model.ts
│   │   ├── token.models.ts
│   │   └── user.model.ts
│   │
│   ├── repository/
│   │   ├── chat.repository.ts
│   │   ├── comment.repository.ts
│   │   ├── database.repository.ts
│   │   ├── post.repository.ts
│   │   ├── token.repository.ts
│   │   └── user.repository.ts
│   │
│   └── connection.ts
│
├── Middlewares/
│   ├── authintication.middleware.ts
│   └── validation.middleware.ts
│
├── Modules/
│   ├── Auth/
│   ├── Chat/
│   ├── Comment/
│   ├── Gateway/
│   ├── Post/
│   └── User/
│
├── Utils/
│   ├── email/
│   ├── events/
│   ├── multer/
│   ├── response/
│   ├── security/
│   └── types/
│
├── app.controller.ts
└── index.ts

package.json
tsconfig.json
```

---

# 📌 API Modules

| Module  | Description                         |
| ------- | ----------------------------------- |
| Auth    | Authentication & Email Verification |
| User    | User Profile Management             |
| Post    | Post CRUD Operations                |
| Comment | Comment CRUD Operations             |
| Chat    | Real-Time Messaging                 |
| Gateway | Socket.IO Gateway                   |

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/sara-abdelazizz/social-app-api
```

Navigate to the project

```bash
cd social-app-api
```

Install dependencies

```bash
npm install
```

Create a `.env` file and add the following variables:

```env
PORT=

DB_URI=

TOKEN_ACCESS_SECRET=
TOKEN_REFRESH_SECRET=

ACCESS_TOKEN_EXPIRE_IN=
REFRESH_TOKEN_EXPIRE_IN=

EMAIL=
PASS=

CLOUD_NAME=
API_KEY=
API_SECRET=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=
```

Run the development server

```bash
npm run dev
```

---

# 🔐 Security

* JWT Authentication
* Access & Refresh Tokens
* Password Hashing with bcrypt
* Request Validation
* Authorization Middleware
* Secure File Upload Validation
* Environment Variables for Sensitive Data

---

# 🧪 Testing

All REST API endpoints and Socket.IO events were tested using **Postman** and **Socket.IO client tools**.

---

# 📌 Future Improvements

* Docker Support
* Unit & Integration Testing
* Swagger API Documentation
* Redis Caching
* Group Chats
* Push Notifications

---

# 👩‍💻 Author

**Sara Abdelaziz**

Backend Developer

* GitHub: https://github.com/sara-abdelazizz
* LinkedIn: https://www.linkedin.com/in/sara-abdelaziz-9722b22a7/

---

# 📄 License

This project was developed for learning and portfolio purposes.
