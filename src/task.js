const Task = (title, description, dueDate, project, priority) => {
  let _isCompleted = false;

  const getTitle = () => title;
  return {
    getTitle
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