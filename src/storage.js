import { Project, Task } from './task';

// eslint-disable-next-line func-names
const storage = (function () {
  const parseJSON = () => {
    const projects = JSON.parse(localStorage.getItem('projects'));
    projects.forEach((projectJSON, index) => {
      projects[index] = Project(projectJSON.name);
      projectJSON.tasks.forEach((taskJSON, taskIndex) => {
        projects[index].tasks[taskIndex] = Task(
          taskJSON.name,
          taskJSON.description,
          taskJSON.dueDate,
          taskJSON.project,
          taskJSON.priority,
          taskJSON.isCompleted,
        );
      });
    });
    return projects;
  };

  let projects = localStorage.getItem('projects')
    ? parseJSON()
    : [Project('My Tasks')];

  const createProject = (form) => {
    const newProject = Project(form.elements.project.value);
    projects.push(newProject);
    localStorage.setItem('projects', JSON.stringify(projects));
    return newProject;
  };
  const getProject = (projectName) => {
    const project = projects.find(
      (obj) => obj.name === projectName,
    );
    return project;
  };
  const deleteProject = (projectName) => {
    projects = projects.filter((project) => project.name !== projectName);
    localStorage.setItem('projects', JSON.stringify(projects));
  };
  const createTask = (form) => {
    const newTask = Task(
      form.elements.task.value,
      form.elements.description.value,
      form.elements['due-date'].value,
      form.elements['project-list'].value,
      form.elements.priority.value,
    );
    const project = getProject(form.elements['project-list'].value);
    project.addTask(newTask);
    localStorage.setItem('projects', JSON.stringify(projects));

    return newTask;
  };
  const deleteTask = (projectName, taskId) => {
    const project = getProject(projectName);
    project.removeTask(taskId);
    localStorage.setItem('projects', JSON.stringify(projects));
  };
  const toggleTask = (task) => {
    task.toggleComplete();
    localStorage.setItem('projects', JSON.stringify(projects));
  };
  (() => {
    if (!localStorage.getItem('projects')) {
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  })();

  return {
    get projects() {
      return projects;
    },
    createProject,
    deleteProject,
    createTask,
    deleteTask,
    getProject,
    toggleTask,
  };
}());

export default storage;
