<img width="1900" height="572" alt="01" src="https://github.com/user-attachments/assets/222c7fd6-a15a-4143-94f2-10374feca654" />


# 🚀 RoadmapFlow (Interactive Roadmap Tracker)

RoadmapFlow is a modern, full-stack web application designed to create, visualize, and track interactive learning roadmaps and career paths.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** React (Vite)
* **Language:** TypeScript / JavaScript
* **Styling:** CSS3 (Custom Modules & Modern UI)
* **Linting:** ESLint

### **Backend**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** SQLite3 (`roadmap.db`)

---

## 📂 Project Structure

```text
roadmap/
├── backend/
│   ├── package.json
│   ├── server.js          # Express server & API endpoints
│   └── roadmap.db         # SQLite database storing nodes & pathways
└── frontend/
    ├── src/
    │   ├── api/           # API fetchers & mock data handlers
    │   ├── components/    # Roadmap components & styles
    │   ├── App.jsx / .tsx
    │   └── main.jsx / .tsx
    ├── public/
    └── package.json
```

---

## ⚡ Quick Start & Installation

### **Prerequisites**
* [Node.js](https://nodejs.org/) (v16 or higher)
* `npm` or `yarn`

---

### **1. Setup Backend**

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the Node/Express server
npm start
# or:
node server.js
```
> The backend server will typically run on `http://localhost:5000` (or as configured in `server.js`).

---

### **2. Setup Frontend**

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
> Open your browser and navigate to the local server link provided by Vite (e.g., `http://localhost:5173`).

---

## 🌐 API Features & Mock Mode

* **Live API Mode:** Fetches roadmap structures dynamically from SQLite database via Express endpoints.
* **Fallback / Mock Mode:** Includes `mockApi.js` for offline development and quick UI testing without running the backend database.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check out [Issues](../../issues).

---

## 📄 License

This project is licensed under the MIT License.
