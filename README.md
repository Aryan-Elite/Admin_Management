# User Management & Notification System 🚀

A backend service for managing users, authentication, profiles, and real-time notifications using Node.js, Express, MongoDB, JWT, and Socket.io.

## 🔧 Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Real-time Communication**: Socket.io
- **Scheduling**: `setInterval` with availability check

---
## 🛠️ Features

- User Registration and Login
- Profile Update (name, mobile, bio, availability)
- JWT-based Protected Routes
- Admin-only notification sender
- Real-time notifications using Socket.io
- Critical vs Non-critical notifications
- Scheduled notification retry system

---

## User Routes (`/api/users`)

- **POST** `/api/users/register` - Register new user
- **POST** `/api/users/login` - Login user
- **GET** `/api/users/profile` - Get user profile
- **PUT** `/api/users/profile` - Update user profile
- **GET** `/api/users/logout` - Logout user

---

## Notification Routes (`/api/notifications`)

- **POST** `/api/notifications/send` - Send notification to users
- **GET** `/api/notifications/` - Get user notifications
- **PATCH** `/api/notifications/:id/read` - Mark notification as read

---

## Admin Routes (`/api/admin`)

- **POST** `/api/admin/notifications/send` - Admin sends notifications


## 📦 Installation

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
```

## Workflow Diagram

![image](https://github.com/user-attachments/assets/56b28e82-c3dd-4879-8e4b-d012573d087c)

## Optimized Approach using Kafka + WebSocket

![image](https://github.com/user-attachments/assets/2c425dfa-8a58-4afa-b63a-4ea53de65a27)

