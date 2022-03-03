/* eslint-disable no-underscore-dangle */
const Task = (name, description, dueDate, project, priority) => {
  let _isCompleted = false;
  const _taskId = `_${Math.random().toString(36).substring(2, 9)}`;

  const getTaskId = () => _taskId;
  const getName = () => name;
  const getDescription = () => description;
  const getDueDate = () => dueDate;
  const getProject = () => project;
  const getPriority = () => priority;
  const getCompleted = () => _isCompleted;
  const getDetails = () => ({
    name,
    description,
    project,
    priority,
    due: dueDate,
  });
  const completeTask = () => {
    _isCompleted = true;
  };

  return {
    getTaskId,
    getName,
    getDescription,
    getDueDate,
    getProject,
    getPriority,
    getCompleted,
    getDetails,
    completeTask,
  };
};

const Project = (name) => {
  const _tasks = [];

  const getName = () => name;
  const addTask = (task) => {
    _tasks.push(task);
  };
  const getTasks = () => _tasks;

  return {
    getName,
    addTask,
    getTasks,
  };
};

export { Task, Project };
