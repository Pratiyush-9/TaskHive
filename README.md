# TaskHive

TaskHive is a **full-stack MERN project management platform** built with React, Node.js, Express, and MongoDB, enabling teams to manage projects, collaborate, and track tasks efficiently.

## ✨ Features

- 🔐 User authentication and profile management
- 👥 Team creation and member management
- 📁 Project organization by team
- ✅ Kanban-style task tracking with statuses and priorities
- 📅 Due dates and overdue task handling
- 📢 Activity and notification feed
- 📆 Interactive calendar for task scheduling
- 📊 Dashboard with project insights and analytics
- 🔄 Automatic task reassignment support
- 📱 Responsive and user-friendly interface

---

## 🛠️ Tech Stack

### MERN Stack

#### Frontend
- React 19
- Vite
- React Router
- Tailwind CSS
- Axios
- React Icons
- Recharts
- React Big Calendar

#### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- CORS
- Nodemailer (Optional Email Notifications)

---

## 📂 Project Structure

```text
TaskHive
│
├── client/                # React frontend
│   ├── src/               # Pages, Components, Context, Utils
│   ├── public/
│   └── package.json
│
└── server/                # Express backend
    ├── controllers/       # Business logic
    ├── middleware/        # JWT Authentication
    ├── models/            # Mongoose schemas
    ├── routes/            # REST API routes
    ├── utils/             # Email helpers
    └── package.json
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Pratiyush-9/TaskHive.git
cd TaskHive
```

### 2. Install Dependencies

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd ../server
npm install
```

---

## ⚙️ Configure Environment Variables

Create a `.env` file inside the **server** folder.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

### Optional SMTP Configuration

Configure these variables if you want to enable email notifications when adding team members.

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_SECURE=true
SMTP_FROM=your-email@example.com
```

---

## ▶️ Running the Application

Start the backend server:

```bash
cd server
npm start
```

Start the frontend:

```bash
cd ../client
npm run dev
```

The application will be available at:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

---

## 🌐 API Overview

The backend exposes RESTful APIs under `/api`.

| Endpoint | Description |
|----------|-------------|
| `/api/auth` | User Authentication |
| `/api/teams` | Team Management |
| `/api/projects` | Project Management |
| `/api/tasks` | Task Management |
| `/api/activity` | Activity Logs |

---

## 📷 Screenshots

Add screenshots of the following pages:

- Login Page
- Dashboard
- Teams
- Projects
- Tasks
- Calendar

---

## 💻 Development Notes

Build the frontend for production:

```bash
cd client
npm run build
```

- MongoDB is required for data persistence.
- A valid MongoDB connection string must be provided in the `.env` file.
- If SMTP credentials are not configured, email notifications will be skipped gracefully.

---

## 🚀 Future Enhancements

- Real-time collaboration using Socket.io
- Task comments and discussions
- File attachments
- Dark mode support
- Push notifications
- Advanced analytics dashboard

---

## 👨‍💻 Author

**Pratiyush Kumar**

LinkedIn: https://www.linkedin.com/in/pratiyush-kumar-318435284/
GitHub: https://github.com/Pratiyush-9

---

## 📄 License

This project is licensed under the **ISC License**.