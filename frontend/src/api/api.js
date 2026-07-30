const API_URL = 'http://localhost:3000/api';

export const getData = async () => {
  const res = await fetch(`${API_URL}/data`);
  return res.json();
};

// Task APIs
export const saveTaskApi = async (task) => {
  if (task.id) {
    await fetch(`${API_URL}/tasks/${task.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task)
    });
  } else {
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task)
    });
    return res.json();
  }
};

export const deleteTaskApi = async (id) => {
  await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
};

// Project APIs
export const saveProjectApi = async (project) => {
  if (project.id) {
    await fetch(`${API_URL}/projects/${project.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(project)
    });
  } else {
    const res = await fetch(`${API_URL}/projects`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(project)
    });
    return res.json();
  }
};

export const deleteProjectApi = async (id) => {
  await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' });
};

// Month APIs
export const addMonthApi = async (name) => {
  const res = await fetch(`${API_URL}/months`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return res.json();
};

export const updateMonthApi = async (month) => {
  await fetch(`${API_URL}/months/${month.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: month.name })
  });
};

export const deleteMonthApi = async (id) => {
  await fetch(`${API_URL}/months/${id}`, { method: 'DELETE' });
};