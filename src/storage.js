import { parseISO, format, addDays } from 'date-fns';
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
  const updateProject = (projectName, newProjectName) => {
    const project = getProject(projectName);
    project.name = newProjectName;
    localStorage.setItem('projects', JSON.stringify(projects));
  };
  const createTask = (form) => {
    const date = (form.elements['due-date'].value) ? format(parseISO(form.elements['due-date'].value), 'PPp') : '';
    const newTask = Task(
      form.elements.task.value,
      form.elements.description.value,
      date,
      form.elements['project-list'].value,
      form.elements.priority.value,
    );
    const project = getProject(form.elements['project-list'].value);
    project.addTask(newTask);
    localStorage.setItem('projects', JSON.stringify(projects));

    return newTask;
  };
  const getTask = (projectName, taskId) => {
    const project = getProject(projectName);
    const task = project.tasks.find(
      (obj) => obj.taskId === taskId,
    );
    return task;
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
  const updateTask = (projectName, taskId, form) => {
    const task = getTask(projectName, taskId);
    const elements = Array.from(form.elements).slice(0, 5);
    elements.forEach((detail) => {
      if (detail.value) {
        const prop = detail.id.split('edit-')[1];
        if (prop === 'project' && projectName !== detail.value) {
          createTask(form);
          deleteTask(projectName, taskId);
        } else {
          task[prop] = detail.value;
        }
      }
    });
    localStorage.setItem('projects', JSON.stringify(projects));
  };

  (() => {
    if (!localStorage.getItem('projects')) {
      projects[0].addTask(Task(
        'Example task with a description that is due today',
        'Descriptions and due dates are not required.',
        format(new Date(), 'PPp'),
        'My Tasks',
        'high',
      ));
      projects[0].addTask(Task(
        'Example task and is due next week',
        '',
        format(addDays(new Date(), 7), 'Ppp'),
        'My Tasks',
        'low',
      ));
      projects[0].addTask(Task(
        'Completed task with no due date',
        '',
        '',
        'My Tasks',
        'high',
        true,
      ));
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  })();

  return {
    get projects() {
      return projects;
    },
    createProject,
    deleteProject,
    updateProject,
    createTask,
    deleteTask,
    updateTask,
    getProject,
    getTask,
    toggleTask,
  };
}());

export default storage;
