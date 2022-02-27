const Task = (name, description, dueDate, project, priority) => {
  let _isCompleted = false;

  const getName = () => name;
  const getDescription = () => description;
  const getDueDate = () => dueDate;
  const getProject = () => project;
  const getPriority = () => priority;

  return {
    getName,
    getDescription,
    getDueDate,
    getProject,
    getPriority
  };
}

const Project = (name) => {
  const _tasks = [];

  const getName = () => name;
  const addTask = (task) => {
    _tasks.push(task);
  }
  const getTasks = () => _tasks;

  return {
    getName,
    addTask,
    getTasks
  };
}

export {Task, Project};