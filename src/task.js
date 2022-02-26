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
  let _tasks = [];

  const getName = () => name;
  const addTask = (task) => {
    _tasks.push(task);
  }

  return {
    getName,
    addTask
  };
}

export {Task, Project};