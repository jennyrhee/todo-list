/* eslint-disable no-underscore-dangle */
const Task = (name, description, dueDate, project, priority) => {
  let _isCompleted = false;
  const taskId = `_${Math.random().toString(36).substring(2, 9)}`;

  const getCompleted = () => _isCompleted;
  const getDetails = () => ({
    name,
    description,
    project,
    priority,
    due: dueDate,
  });
  const toggleComplete = () => {
    _isCompleted = !_isCompleted;
  };

  return {
    taskId,
    name,
    description,
    dueDate,
    project,
    priority,
    getCompleted,
    getDetails,
    toggleComplete,
  };
};

const Project = (name) => {
  const tasks = [];

  const addTask = (task) => {
    tasks.push(task);
  };

  return {
    name,
    tasks,
    addTask,
  };
};

export { Task, Project };
