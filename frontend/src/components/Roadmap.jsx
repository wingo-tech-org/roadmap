import React, { useState, useEffect, useRef } from 'react';
//import { getData, saveTaskApi, deleteTaskApi, saveProjectApi, deleteProjectApi, addMonthApi, deleteMonthApi } from '../api/api.js';
import { getData, saveTaskApi, deleteTaskApi, saveProjectApi, deleteProjectApi, addMonthApi, updateMonthApi, deleteMonthApi } from '../api/api.js';
import './Roadmap.css';

const DAY_WIDTH = 30;

const Roadmap = () => {
  const [data, setData] = useState({ projects: [], months: [], tasks: [] });
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const chartRef = useRef(null);
  
  // استیت‌های درگ تسک و تغییر ارتفاع ردیف
  const [dragState, setDragState] = useState(null);
  const [resizeRowState, setResizeRowState] = useState(null);

  useEffect(() => {
    getData().then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const totalDays = data.months.reduce((sum, m) => sum + m.days, 0);

    // --- منطق درگ و ریسایز تسک‌ها (افزوده شده: حرکت عمودی) ---
  const handleMouseDown = (e, task, type) => {
    e.stopPropagation();
    e.preventDefault();
    setDragState({
      taskId: task.id, 
      type,
      startX: e.clientX,
      startY: e.clientY, // ذخیره موقعیت اولیه عمودی موس
      initialStart: task.startDay,
      initialDuration: task.durationDays,
      initialLayer: task.layer // ذخیره لایه اولیه تسک
    });
  };

  useEffect(() => {
    if (!dragState) return;
    
    const handleMouseMove = (e) => {
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;
      const deltaDays = Math.round(deltaX / DAY_WIDTH);
      const deltaLayers = Math.round(deltaY / 40); // هر لایه 40 پیکسل ارتفاع دارد

      setData(prev => {
        const newTasks = prev.tasks.map(t => {
          if (t.id !== dragState.taskId) return t;
          
          if (dragState.type === 'move') {
            // منطق حرکت افقی (تاریخ)
            let newStart = dragState.initialStart + deltaDays;
            newStart = Math.max(0, Math.min(totalDays - t.durationDays, newStart));
            
            // منطق حرکت عمودی (لایه)
            let newLayer = dragState.initialLayer + deltaLayers;
            newLayer = Math.max(0, newLayer); // اجازه ندهیم لایه منفی شود
            
            return { ...t, startDay: newStart, layer: newLayer };
            
          } else if (dragState.type === 'resize-right') {
            let newDur = dragState.initialDuration + deltaDays;
            newDur = Math.max(1, Math.min(totalDays - t.startDay, newDur));
            return { ...t, durationDays: newDur };
            
          } else if (dragState.type === 'resize-left') {
            let newStart = dragState.initialStart + deltaDays;
            let newDur = dragState.initialDuration - deltaDays;
            if (newStart < 0) { newDur += newStart; newStart = 0; }
            if (newDur < 1) { newDur = 1; }
            return { ...t, startDay: newStart, durationDays: newDur };
          }
          return t;
        });
        return { ...prev, tasks: newTasks };
      });
    };

    const handleMouseUp = () => {
      setDragState(null);
      const changedTask = data.tasks.find(t => t.id === dragState.taskId);
      if (changedTask) {
        setIsSaving(true);
        saveTaskApi(changedTask).then(() => setIsSaving(false));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, data.tasks, totalDays]);

  // --- منطق تغییر ارتفاع ردیف پروژه با موس ---
  const handleRowResizeMouseDown = (e, project) => {
    e.stopPropagation();
    e.preventDefault();
    setResizeRowState({
      projectId: project.id,
      startY: e.clientY,
      initialHeight: project.height || 120
    });
  };

  useEffect(() => {
    if (!resizeRowState) return;
    
    const handleMouseMove = (e) => {
      const deltaY = e.clientY - resizeRowState.startY;
      const newHeight = Math.max(60, resizeRowState.initialHeight + deltaY); // حداقل ارتفاع 60 پیکسل
      
      setData(prev => ({
        ...prev,
        projects: prev.projects.map(p => 
          p.id === resizeRowState.projectId ? { ...p, height: newHeight } : p
        )
      }));
    };

    const handleMouseUp = () => {
      const changedProject = data.projects.find(p => p.id === resizeRowState.projectId);
      if (changedProject) {
        setIsSaving(true);
        saveProjectApi(changedProject).then(() => setIsSaving(false));
      }
      setResizeRowState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizeRowState, data.projects]);

  // --- مدیریت تسک‌ها ---
  const handleAddTask = async (projectId) => {
    const tasksInProject = data.tasks.filter(t => t.projectId === projectId);
    const maxLayer = Math.max(-1, ...tasksInProject.map(t => t.layer)) + 1;
    const newTaskData = { name: 'New Task', projectId, startDay: 0, durationDays: 10, layer: maxLayer, color: '#778ca3' };
    const savedTask = await saveTaskApi(newTaskData);
    setData(prev => ({ ...prev, tasks: [...prev.tasks, savedTask] }));
    setEditingTask(savedTask);
  };

  const handleSaveTaskEdit = async () => {
    setIsSaving(true);
    await saveTaskApi(editingTask);
    setData(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === editingTask.id ? editingTask : t) }));
    setEditingTask(null);
    setIsSaving(false);
  };

  const handleDeleteTask = async (id) => {
    setIsSaving(true);
    await deleteTaskApi(id);
    setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
    setEditingTask(null);
    setIsSaving(false);
  };

  // --- مدیریت پروژه‌ها ---
  const handleAddProject = async () => {
    const savedProj = await saveProjectApi({ name: 'New Project' });
    setData(prev => ({ ...prev, projects: [...prev.projects, savedProj] }));
  };

  const handleSaveProjectEdit = async () => {
    setIsSaving(true);
    await saveProjectApi(editingProject);
    setData(prev => ({ ...prev, projects: prev.projects.map(p => p.id === editingProject.id ? editingProject : p) }));
    setEditingProject(null);
    setIsSaving(false);
  };

  const handleDeleteProject = async (id) => {
    setIsSaving(true);
    await deleteProjectApi(id);
    setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id), tasks: prev.tasks.filter(t => t.projectId !== id) }));
    setEditingProject(null);
    setIsSaving(false);
  };

  // --- مدیریت ماه‌ها ---
  const handleAddMonth = async () => {
    const savedMonth = await addMonthApi('New Month');
    setData(prev => ({ ...prev, months: [...prev.months, savedMonth] }));
  };

  const handleMonthNameChange = async (id, newName) => {
    // آپدیت فوری در UI
    setData(prev => ({
      ...prev,
      months: prev.months.map(m => m.id === id ? { ...m, name: newName } : m)
    }));
  };

  const handleSaveMonthName = async (id, newName) => {
    setIsSaving(true);
    await updateMonthApi({ id, name: newName });
    setIsSaving(false);
  };

  const handleDeleteMonth = async (id) => {
    if(data.months.length <= 1) return alert("شما باید حداقل یک ماه داشته باشید!");
    setIsSaving(true);
    await deleteMonthApi(id);
    setData(prev => ({ ...prev, months: prev.months.filter(m => m.id !== id) }));
    setIsSaving(false);
  };

  if (loading) return <div className="loading-screen">Loading Roadmap...</div>;

  return (
    <div className="gantt-container">
      <div className="gantt-header">
        <h2>Roadmap Management {isSaving && <span className="saving-badge">Saving...</span>}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="add-btn secondary" onClick={handleAddProject}>+ Add Project</button>
          <button className="add-btn" onClick={handleAddMonth}>+ Add Month</button>
        </div>
      </div>

      <div className="gantt-scroll-area">
        <div className="gantt-inner" style={{ width: `calc(200px + ${totalDays * DAY_WIDTH}px)` }}>
          
          <div className="gantt-header-row">
            <div className="gantt-corner">Projects</div>
            <div className="gantt-dates-header">
              {data.months.map(month => (
                <div key={month.id} className="month-group" style={{ width: month.days * DAY_WIDTH }}>
                  <div className="month-name-box">
                    <input 
                      type="text" 
                      className="month-name-input"
                      value={month.name} 
                      onChange={(e) => handleMonthNameChange(month.id, e.target.value)}
                      onBlur={(e) => handleSaveMonthName(month.id, e.target.value)} // ذخیره وقتی از فیلد خارج می‌شویم
                      onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} // ذخیره با زدن Enter
                    />
                    <button className="x-btn" onClick={() => handleDeleteMonth(month.id)}>✕</button>
                  </div>
                  <div className="days-row">
                    {Array.from({ length: month.days }).map((_, i) => (
                      <div key={i} className="day-cell">{i + 1}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {data.projects.map(project => {
            const projTasks = data.tasks.filter(t => t.projectId === project.id);
            // ارتفاع از دیتابیس خوانده می‌شود، اگر نبود ۱۲۰ پیش‌فرض
            const rowHeight = project.height || 120; 

            return (
              <div key={project.id} className="gantt-row" style={{ height: `${rowHeight}px` }}>
                <div className="gantt-sidebar-cell">
                  <span onClick={() => setEditingProject(project)} style={{ cursor: 'pointer', fontWeight: 500 }}>
                    {project.name}
                  </span>
                  <button className="add-task-mini" onClick={() => handleAddTask(project.id)}>+ Task</button>
                </div>
                
                <div className="gantt-timeline-area" ref={chartRef}>
                  {Array.from({ length: totalDays }).map((_, i) => (
                    <div key={i} className="day-grid-line" style={{ left: `${i * DAY_WIDTH}px` }}></div>
                  ))}
                  
                  {projTasks.map(task => (
                    <div
                      key={task.id}
                      className={`gantt-bar ${dragState?.taskId === task.id ? 'dragging' : ''}`}
                      style={{
                        left: `${task.startDay * DAY_WIDTH}px`,
                        width: `${task.durationDays * DAY_WIDTH}px`,
                        top: `${task.layer * 40 + 10}px`,
                        backgroundColor: task.color
                      }}
                      onMouseDown={(e) => handleMouseDown(e, task, 'move')}
                      onClick={() => setEditingTask(task)}
                    >
                      <div className="resize-handle left" onMouseDown={(e) => handleMouseDown(e, task, 'resize-left')}></div>
                      <span className="bar-label">{task.name}</span>
                      <div className="resize-handle right" onMouseDown={(e) => handleMouseDown(e, task, 'resize-right')}></div>
                    </div>
                  ))}
                </div>

                {/* دستگیره تغییر ارتفاع ردیف (پایین هر ردیف) */}
                <div 
                  className="row-resizer" 
                  onMouseDown={(e) => handleRowResizeMouseDown(e, project)}
                ></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* مودال ویرایش تسک */}
      {editingTask && (
        <div className="edit-modal" onClick={() => setEditingTask(null)}>
          <div className="edit-content" onClick={e => e.stopPropagation()}>
            <h3>Edit Task</h3>
            <label>Name:</label>
            <input type="text" value={editingTask.name} onChange={(e) => setEditingTask({...editingTask, name: e.target.value})} />
            <label>Project:</label>
            <select value={editingTask.projectId} onChange={(e) => setEditingTask({...editingTask, projectId: Number(e.target.value)})}>
              {data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}><label>Start Day:</label><input type="number" value={editingTask.startDay} onChange={(e) => setEditingTask({...editingTask, startDay: Number(e.target.value)})} /></div>
              <div style={{ flex: 1 }}><label>Duration:</label><input type="number" value={editingTask.durationDays} onChange={(e) => setEditingTask({...editingTask, durationDays: Number(e.target.value)})} /></div>
              <div style={{ flex: 1 }}><label>Row (Layer):</label><input type="number" value={editingTask.layer} onChange={(e) => setEditingTask({...editingTask, layer: Number(e.target.value)})} /></div>
            </div>
            <label>Color:</label>
            <input type="color" value={editingTask.color} onChange={(e) => setEditingTask({...editingTask, color: e.target.value})} />
            <div className="modal-actions">
              <button className="delete-btn" onClick={() => handleDeleteTask(editingTask.id)}>Delete</button>
              <button className="save-btn" onClick={handleSaveTaskEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* مودال ویرایش پروژه */}
      {editingProject && (
        <div className="edit-modal" onClick={() => setEditingProject(null)}>
          <div className="edit-content" onClick={e => e.stopPropagation()}>
            <h3>Edit Project</h3>
            <label>Name:</label>
            <input type="text" value={editingProject.name} onChange={(e) => setEditingProject({...editingProject, name: e.target.value})} />
            <div className="modal-actions">
              <button className="delete-btn" onClick={() => handleDeleteProject(editingProject.id)}>Delete Project</button>
              <button className="save-btn" onClick={handleSaveProjectEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;