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
        );
      });
    });
    return projects;
  };

  const projects = localStorage.getItem('projects')
    ? parseJSON()
    : [Project('My Tasks')];

  const createProject = (form) => {
    const newProject = Project(form.elements.project.value);
    projects.push(newProject);
    localStorage.setItem('projects', JSON.stringify(storage.projects));
    return newProject;
  };
  const createTask = (form) => {
    const newTask = Task(
      form.elements.task.value,
      form.elements.description.value,
      form.elements['due-date'].value,
      form.elements['project-list'].value,
      form.elements.priority.value,
    );
    const project = projects.find(
      (obj) => obj.name === form.elements['project-list'].value,
    );
    project.addTask(newTask);
    localStorage.setItem('projects', JSON.stringify(storage.projects));

    return newTask;
  };
  (() => {
    if (!localStorage.getItem('projects')) {
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  })();

  return {
    projects,
    createProject,
    createTask,
  };
}());

export default storage;