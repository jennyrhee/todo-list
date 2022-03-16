/* eslint-disable no-underscore-dangle */
const Task = (name, description, dueDate, project, priority, isCompleted = false) => {
  const taskId = `_${Math.random().toString(36).substring(2, 9)}`;

  const getDetails = () => ({
    name,
    description,
    project,
    priority,
    due: dueDate,
  });
  const toggleComplete = () => {
    // eslint-disable-next-line no-param-reassign
    isCompleted = !isCompleted;
  };

  return {
    taskId,
    name,
    description,
    dueDate,
    project,
    priority,
    get isCompleted() {
      return isCompleted;
    },
    getDetails,
    toggleComplete,
  };
};

const Project = (name) => {
  let tasks = [];

  const addTask = (task) => {
    tasks.push(task);
  };
  const removeTask = (taskId) => {
    tasks = tasks.filter((task) => task.taskId !== taskId);
  };

  return {
    name,
    get tasks() {
      return tasks;
    },
    get length() {
      return tasks.length;
    },
    addTask,
    removeTask,
  };
};

export { Task, Project };
