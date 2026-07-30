const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = new Database('roadmap.db');

// ساخت جداول جدید (با اضافه شدن height برای پروژه‌ها)
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, height INTEGER DEFAULT 120);
  CREATE TABLE IF NOT EXISTS months (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, days INTEGER DEFAULT 31);
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT, 
    projectId INTEGER, 
    startDay INTEGER, 
    durationDays INTEGER, 
    layer INTEGER DEFAULT 0,
    color TEXT
  )
`);

// داده‌های اولیه
const pCount = db.prepare('SELECT COUNT(*) as c FROM projects').get();
if (pCount.c === 0) {
  db.prepare('INSERT INTO projects (name, height) VALUES (?, ?)').run('ETFs Development', 150);
  db.prepare('INSERT INTO projects (name, height) VALUES (?, ?)').run('Benchmark', 120);
  db.prepare('INSERT INTO projects (name, height) VALUES (?, ?)').run('Design', 180);

  ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].forEach(m => {
    db.prepare('INSERT INTO months (name, days) VALUES (?, 31)').run(m);
  });

  db.prepare('INSERT INTO tasks (name, projectId, startDay, durationDays, layer, color) VALUES (?, ?, ?, ?, ?, ?)').run('MME V2', 1, 5, 40, 0, '#4f33ff');
  db.prepare('INSERT INTO tasks (name, projectId, startDay, durationDays, layer, color) VALUES (?, ?, ?, ?, ?, ?)').run('Alpha Fund', 1, 50, 60, 1, '#5f27cd');
  db.prepare('INSERT INTO tasks (name, projectId, startDay, durationDays, layer, color) VALUES (?, ?, ?, ?, ?, ?)').run('Wingo Design System', 3, 35, 70, 0, '#ff4f4f');
  db.prepare('INSERT INTO tasks (name, projectId, startDay, durationDays, layer, color) VALUES (?, ?, ?, ?, ?, ?)').run('Benchmark Tool', 2, 60, 50, 0, '#00b894');
}

// API یکپارچه
app.get('/api/data', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects').all();
  const months = db.prepare('SELECT * FROM months').all();
  const tasks = db.prepare('SELECT * FROM tasks').all();
  res.json({ projects, months, tasks });
});

// --- API پروژه‌ها (آپدیت شده با height) ---
app.post('/api/projects', (req, res) => {
  const info = db.prepare('INSERT INTO projects (name, height) VALUES (?, 120)').run(req.body.name || 'New Project');
  res.json({ id: info.lastInsertRowid, name: req.body.name, height: 120 });
});
app.put('/api/projects/:id', (req, res) => {
  const { name, height } = req.body;
  db.prepare('UPDATE projects SET name = ?, height = ? WHERE id = ?').run(name, height, req.params.id);
  res.json({ success: true });
});
app.delete('/api/projects/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE projectId = ?').run(req.params.id);
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- API ماه‌ها (آپدیت شده) ---
app.post('/api/months', (req, res) => {
  const name = req.body.name || 'New Month';
  const info = db.prepare('INSERT INTO months (name, days) VALUES (?, 31)').run(name);
  res.json({ id: info.lastInsertRowid, name: name, days: 31 });
});

app.put('/api/months/:id', (req, res) => {
  const { name } = req.body;
  db.prepare('UPDATE months SET name = ? WHERE id = ?').run(name, req.params.id);
  res.json({ success: true });
});

app.delete('/api/months/:id', (req, res) => {
  db.prepare('DELETE FROM months WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- API تسک‌ها ---
app.post('/api/tasks', (req, res) => {
  const { name, projectId, startDay, durationDays, layer, color } = req.body;
  const info = db.prepare('INSERT INTO tasks (name, projectId, startDay, durationDays, layer, color) VALUES (?, ?, ?, ?, ?, ?)')
    .run(name, projectId, startDay, durationDays, layer, color);
  res.json({ id: info.lastInsertRowid, ...req.body });
});
app.put('/api/tasks/:id', (req, res) => {
  const { name, projectId, startDay, durationDays, layer, color } = req.body;
  db.prepare('UPDATE tasks SET name = ?, projectId = ?, startDay = ?, durationDays = ?, layer = ?, color = ? WHERE id = ?')
    .run(name, projectId, startDay, durationDays, layer, color, req.params.id);
  res.json({ success: true });
});
app.delete('/api/tasks/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));