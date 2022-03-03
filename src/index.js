/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import { titleCase } from 'title-case';
import './css/style.css';
import { Task, Project } from './task';
import parseJSON from './storage';
import createCustomElement from './helper';

((doc) => {
  const _projects = localStorage.getItem('projects')
    ? parseJSON()
    : [Project('My Tasks')];

  const _toggleMask = () => {
    doc.getElementById('mask').classList.toggle('show');
  };
  const _toggleForm = (formId) => {
    if (formId === 'task-form') {
      doc.getElementById('add-task-btn').style.display = 'none';
    } else if (formId === 'project-form') {
      _toggleMask();
    }
    doc.getElementById(formId).classList.toggle('show');
  };
  const _disableBtnWhenEmpty = (id, btn) => {
    doc.getElementById(id).addEventListener('keyup', (e) => {
      if (e.target.value === '') {
        doc.getElementById(btn).disabled = true;
      } else {
        doc.getElementById(btn).disabled = false;
      }
    });
  };
  const _createProject = (form) => {
    const newProject = Project(form.elements.project.value);
    _projects.push(newProject);
    localStorage.setItem('projects', JSON.stringify(_projects));
    return newProject;
  };
  const _createTaskDetails = (task) => {
    const detailsContainer = createCustomElement('div', 'details-container');

    const colOne = doc.createElement('div');
    const colTwo = doc.createElement('div');
    Object.entries(task.getDetails()).forEach((entry, i) => {
      const [key, detail] = entry;
      const div = createCustomElement(
        'div',
        null,
        `${titleCase(key)}: ${detail}`,
      );
      if (i < 2) colOne.appendChild(div);
      else colTwo.appendChild(div);
    });
    detailsContainer.appendChild(colOne);
    detailsContainer.appendChild(colTwo);
    detailsContainer.classList.add('hidden');
    detailsContainer.setAttribute('task-id', task.taskId);

    return detailsContainer;
  };
  const _createTaskWrapper = (task) => {
    const taskWrapper = createCustomElement('div', 'task-wrapper');

    const check = doc.createElement('input');
    check.type = 'checkbox';
    check.id = task.taskId;
    check.onclick = () => task.toggleComplete();

    const label = createCustomElement('label', 'task', task.name);
    label.setAttribute('project', task.project);
    label.setAttribute('task-id', task.taskId);
    label.onclick = () => {
      doc
        .querySelector(`.details-container[task-id=${task.taskId}]`)
        .classList.toggle('hidden');
    };

    taskWrapper.appendChild(check);
    taskWrapper.appendChild(label);

    return taskWrapper;
  };
  const _addTaskDivs = (task, taskContainer) => {
    const container = createCustomElement('div', 'container');
    container.appendChild(_createTaskWrapper(task));
    container.appendChild(_createTaskDetails(task));
    taskContainer.appendChild(container);

    taskContainer.appendChild(createCustomElement('hr', 'divider'));
  };
  const _loadProjectTasks = (e) => {
    const projectName = e.target.textContent;
    const project = _projects.find((obj) => obj.name === projectName);

    doc.querySelector('.title').textContent = projectName;
    const container = doc.querySelector('.task-container');
    container.textContent = '';
    project.tasks.forEach((task) => _addTaskDivs(task, container));
  };
  const _addToDropdown = (project) => {
    const dropdown = doc.getElementById('project-list');
    const choice = createCustomElement('option', null, project.name);
    choice.value = project.name;
    dropdown.appendChild(choice);
  };
  const _cancelForm = (id, form) => {
    _toggleForm(id);
    form.reset();
    if (id === 'task-form') {
      doc.getElementById('add-task-btn').style.display = 'block';
    }
  };
  const _initProjectForm = () => {
    doc.getElementById('add-project-btn').onclick = _toggleForm.bind(
      this,
      'project-form',
    );
    _disableBtnWhenEmpty('project', 'submit-project-btn');

    const form = doc.getElementById('project-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newProject = _createProject(form);
      _addToDropdown(newProject);

      const div = createCustomElement('div', 'project', newProject.name);
      div.addEventListener('click', _loadProjectTasks);
      doc.getElementById('projects').appendChild(div);

      form.reset();
      _toggleForm('project-form');
    });

    doc.getElementById('cancel-project-btn').onclick = _cancelForm.bind(
      this,
      'project-form',
      form,
    );
  };
  const _createTask = (form) => {
    const newTask = Task(
      form.elements.task.value,
      form.elements.description.value,
      form.elements['due-date'].value,
      form.elements['project-list'].value,
      form.elements.priority.value,
    );
    const project = _projects.find(
      (obj) => obj.name === form.elements['project-list'].value,
    );
    project.addTask(newTask);
    localStorage.setItem('projects', JSON.stringify(_projects));

    return newTask;
  };
  const _initTaskForm = () => {
    doc.getElementById('add-task-btn').onclick = _toggleForm.bind(
      this,
      'task-form',
    );
    _projects.forEach((project) => _addToDropdown(project));

    const form = doc.getElementById('task-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newTask = _createTask(form);
      _addTaskDivs(newTask, doc.querySelector('.task-container'));
      form.reset();
    });

    _disableBtnWhenEmpty('task', 'submit-task-btn');
    doc.getElementById('cancel-task-btn').onclick = _cancelForm.bind(
      this,
      'task-form',
      form,
    );
  };
  const _addProjects = (projects) => {
    _projects.forEach((project) => {
      const div = createCustomElement('div', 'project', project.name);
      div.addEventListener('click', _loadProjectTasks);
      projects.appendChild(div);
    });
  };
  const _initAccordion = () => {
    const accordion = doc.getElementById('projects-accordion');
    _addProjects(doc.getElementById('projects'));
    accordion.onclick = () => {
      accordion.classList.toggle('is-open');
      const projects = doc.querySelectorAll('.project');
      projects.forEach((project) => {
        if (project.style.maxHeight) project.style.maxHeight = null;
        else project.style.maxHeight = `${project.scrollHeight}px`;
      });
    };
  };

  (() => {
    if (!localStorage.getItem('projects')) {
      localStorage.setItem('projects', JSON.stringify(_projects));
    }
    _initProjectForm();
    _initTaskForm();
    _initAccordion();

    doc.querySelector('.menu-btn').onclick = () => {
      doc.getElementById('sidebar').classList.toggle('hidden');
    };
  })();
})(document);
