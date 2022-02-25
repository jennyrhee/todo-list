const Task = (name, description, dueDate, project, priority) => {
  let _isCompleted = false;

  const getName = () => name;
  const getProject = () => project;
  return {
    getName,
    getProject
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