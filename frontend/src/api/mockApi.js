const DB_KEY = 'roadmap_tasks_db';

// داده‌های اولیه اگر دیتابیس خالی بود
const initialData = [
  { id: 1, name: 'MME V2', category: 'ETFs Development', startMonth: 0, duration: 2, color: '#4f33ff' },
  { id: 2, name: 'Wingo Design System', category: 'Design', startMonth: 1, duration: 3, color: '#ff4f4f' },
  { id: 3, name: 'Benchmark Tool', category: 'Benchmark', startMonth: 2, duration: 2, color: '#00b894' },
  { id: 4, name: 'UI Kit v3', category: 'Design', startMonth: 3, duration: 2, color: '#ffa502' },
];

export const getTasks = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tasks = localStorage.getItem(DB_KEY);
      if (!tasks) {
        localStorage.setItem(DB_KEY, JSON.stringify(initialData));
        resolve(initialData);
      } else {
        resolve(JSON.parse(tasks));
      }
    }, 300); // تاخیر 300 میلی‌ثانیه‌ای برای شبیه‌سازی درخواست شبکه
  });
};

export const saveTasks = (tasks) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.setItem(DB_KEY, JSON.stringify(tasks));
      resolve({ success: true });
    }, 100);
  });
};