# 🛸 OrbitMail — Space-Native Email System

> A NASA-grade, store-and-forward email client built for the Artemis II Orion spacecraft. Solves the real problem of Microsoft Outlook failing in deep space by replacing it with an offline-first, delay-tolerant communication system.

---

## 🚀 The Problem

During NASA's Artemis II mission, astronauts aboard the Orion spacecraft experienced email failures with Microsoft Outlook. The root cause: Outlook assumes a stable, low-latency internet connection — something that does not exist 384,400 km from Earth, where signal latency exceeds 1,340ms and connection windows are limited.

**OrbitMail solves this.**

---

## 💡 The Solution

OrbitMail uses a **Store-and-Forward (Delay-Tolerant Networking)** architecture:

- Astronauts compose emails **offline** at any time
- Emails are stored in a local **outbox queue**
- A **sync engine** automatically transmits queued emails during designated connection windows (every 20 minutes)
- The system **never freezes** waiting for a server response

---

## ✨ Features

| Feature | Description |
|---|---|
| 📡 Offline Compose | Write emails anytime, no connection needed |
| 📤 Outbox Queue | Emails stored locally until sync window opens |
| 🔄 Auto-Sync Engine | node-cron transmits queued emails every 20 minutes |
| 📊 Sync Log | Real-time transmission activity log |
| 📶 Signal Monitor | Live signal strength and latency display |
| 🗑️ Delete Emails | Remove emails from inbox |
| 🌌 Space UI | Dark space-themed interface built for mission use |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                 ORION SPACECRAFT                │
│                                                 │
│  ┌──────────┐    ┌────────────┐                │
│  │  React   │───▶│  Express   │                │
│  │ Frontend │    │   Server   │                │
│  └──────────┘    └─────┬──────┘                │
│                        │                        │
│                  ┌─────▼──────┐                │
│                  │  MongoDB   │                │
│                  │  (Queue)   │                │
│                  └─────┬──────┘                │
│                        │                        │
│                  ┌─────▼──────┐                │
│                  │ Sync Engine│                │
│                  │ (node-cron)│                │
│                  └─────┬──────┘                │
└────────────────────────┼────────────────────────┘
                         │ (Connection Window)
                         ▼
                  ┌─────────────┐
                  │    EARTH    │
                  │   Mission   │
                  │   Control   │
                  └─────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Scheduler | node-cron |
| HTTP Client | Axios |
| Environment | dotenv |

---

## 📁 Project Structure

```
orbit-mail/
├── orbitmail-backend/
│   ├── models/
│   │   └── emailModel.js      # Mongoose schema & model
│   ├── routes/
│   │   └── emailRoutes.js     # POST, GET, DELETE endpoints
│   ├── syncEngine.js          # Auto-sync cron job
│   ├── server.js              # Express + MongoDB entry point
│   └── .env                   # Environment variables
│
└── orbitmail-frontend/
    └── src/
        ├── App.jsx            # Main UI + state management
        ├── api.js             # Axios API calls
        ├── main.jsx           # React entry point
        └── index.css          # Global styles
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- npm

### 1. Clone the Repository
```bash
git clone https://github.com/Vanny-jr/orbitmail.git
cd orbitmail
```

### 2. Setup Backend
```bash
cd orbitmail-backend
npm install
```

Create `.env` file:
```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/orbitmail
```

Start backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../orbitmail-frontend
npm install
npm run dev
```

### 4. Open in Browser
```
Frontend → http://localhost:5173
Backend  → http://localhost:5000
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/emails` | Fetch all emails |
| `POST` | `/emails` | Create & queue new email |
| `DELETE` | `/emails/:id` | Delete email by ID |

### Example POST Request
```json
{
    "to": "mission.control@nasa.gov",
    "from": "commander.reid@orion.nasa.gov",
    "subject": "Oxygen Levels Normal",
    "body": "All sensors reading 97.3%. Crew healthy.",
    "status": "queued"
}
```

---

## 🔄 How the Sync Engine Works

```
1. Astronaut composes email → saved to MongoDB with status: "queued"
2. node-cron fires every 20 minutes (connection window)
3. syncEngine finds all emails where status = "queued"
4. Updates status to "sent" → transmitted to Earth
5. Sync Log records the transmission event
```

---

## 🌍 Real-World Context

This project is part of **OrionOS** — a proposed unified mission support suite for NASA spacecraft that replaces commercial off-the-shelf software with space-hardened alternatives. OrbitMail serves as the `comms-service` module.

OrionOS planned modules:
- `comms-service` → OrbitMail ✅
- `hardware-service` → UWMS diagnostics + CCTV
- `scheduler-service` → Mission Daily Dashboard
- `ar-service` → AR maintenance guides

---

## 👨‍💻 Author

**Evans Mutua Mulwa (Vanny jr)**
First-Year Software Engineering Student
Murang'a University of Technology, Kenya

- GitHub: [@Vanny-jr](https://github.com/Vanny-jr)
- Built as part of: SCS 104 — Software Requirements Engineering

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

> *"Houston, we don't have a problem anymore."* 🛸