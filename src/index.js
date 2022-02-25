import './css/style.css';
import {Task, Project} from './task.js';

((doc) => {
  const _projects = [Project('My Tasks')];

  const _toggleForm = () => {
    doc.getElementById('task-form').classList.toggle('show');
  }
  const _createTask = (form) => {
    const newTask = Task(
      form.elements['task'].value,
      form.elements['description'].value
    );
    _projects[0].addTask(newTask);

    return newTask;
  }
  const _addTask = (task, taskContainer) => {
    const container = doc.createElement('div');
    container.classList.add('container');

    const check = doc.createElement('input');
    check.type = 'checkbox';
    check.id = task.getTitle();

    const label = doc.createElement('label');
    label.htmlFor = task.getTitle();
    label.classList.add('task');
    label.textContent = task.getTitle();

    container.appendChild(check);
    container.appendChild(label);
    taskContainer.appendChild(container);
  }
  const _initForm = () => {
    const form = doc.getElementById('task-form');
    doc.getElementById('add-task-btn').onclick = _toggleForm;
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newTask = _createTask(form);
      _addTask(newTask, doc.querySelector('.task-container'));
      form.reset();
    });
    doc.getElementById('cancel-task-btn').onclick = () => {
      _toggleForm();
      form.reset();
    };
  }
  const _addProjects = (projects) => {
    _projects.forEach((project) => {
      let div = doc.createElement('div');
      div.classList.add('project');
      div.textContent = project.getName();
      projects.appendChild(div);
    });
  }
  const _initAccordion = () => {
    const accordion = doc.getElementById('projects-accordion');
    _addProjects(doc.getElementById('projects'));
    accordion.onclick = () => {
      accordion.classList.toggle('is-open');
      const projects = doc.querySelectorAll('.project');
      projects.forEach((project) => {
        if (project.style.maxHeight) project.style.maxHeight = null;
        else project.style.maxHeight = project.scrollHeight + 'px';
      })
    }
  }

  (() => {
    _initForm();
    _initAccordion();
  })();

  return {
    
  };
})(document);