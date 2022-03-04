/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import { titleCase } from 'title-case';
import './css/style.css';
import storage from './storage';
import createCustomElement from './helper';

((doc) => {
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
    doc.getElementById(id).addEventListener('enter', (e) => {
      if (e.target.value === '') {
        doc.getElementById(btn).disabled = true;
      }
    });
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
  const _createTaskItem = (task) => {
    const taskItem = createCustomElement('div', 'task-item');

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

    taskItem.appendChild(check);
    taskItem.appendChild(label);

    return taskItem;
  };
  const _createTaskIcon = (className, fontAwesomeClass = null) => {
    const icon = createCustomElement('i', className);
    if (fontAwesomeClass) {
      icon.classList.add('fa');
      icon.classList.add(fontAwesomeClass);
    }
    return icon;
  };
  const _createIconContainer = (container, task) => {
    const iconContainer = createCustomElement('div', 'icon-container');
    const iconObj = {
      'edit-task-btn': 'fa-pen-to-square',
      'move-project-btn': 'fa-arrow-right-from-bracket',
      'trash-btn': 'fa-trash',
    };
    Object.entries(iconObj).forEach((entry, index) => {
      const [btnClass, fontAwesomeClass] = entry;
      const icon = _createTaskIcon(btnClass, fontAwesomeClass);
      if (index === 2) {
        icon.onclick = () => {
          const projectName = doc.querySelector(`label.task[task-id=${task.taskId}]`).getAttribute('project');
          storage.deleteTask(projectName, task.taskId);
          // Removes divider
          container.nextElementSibling.remove();
          container.remove();
        };
      }
      iconContainer.appendChild(icon);
    });
    return iconContainer;
  };
  const _createTaskDivs = (task, taskContainer) => {
    const container = createCustomElement('div', 'container');
    container.setAttribute('task-id', task.taskId);

    const taskWrapper = createCustomElement('div', 'task-wrapper');
    taskWrapper.appendChild(_createTaskItem(task));

    taskWrapper.appendChild(_createIconContainer(container, task));

    container.appendChild(taskWrapper);
    container.appendChild(_createTaskDetails(task));
    taskContainer.appendChild(container);

    taskContainer.appendChild(createCustomElement('hr', 'divider'));
  };
  const _loadProjectTasks = (e) => {
    const projectName = e.target.textContent;
    const project = storage.getProject(projectName);

    doc.querySelector('.title').textContent = projectName;
    const container = doc.querySelector('.task-container');
    container.textContent = '';
    project.tasks.forEach((task) => _createTaskDivs(task, container));
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

      const newProject = storage.createProject(form);
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
  const _initTaskForm = () => {
    doc.getElementById('add-task-btn').onclick = _toggleForm.bind(
      this,
      'task-form',
    );
    storage.projects.forEach((project) => _addToDropdown(project));

    const form = doc.getElementById('task-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newTask = storage.createTask(form);
      _createTaskDivs(newTask, doc.querySelector('.task-container'));
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
    storage.projects.forEach((project) => {
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
        if (project.style.maxHeight) {
          project.style.padding = null;
          project.style.maxHeight = null;
        } else {
          project.style.padding = '5px';
          project.style.maxHeight = `${project.scrollHeight + 10}px`;
        }
      });
    };
  };

  (() => {
    _initProjectForm();
    _initTaskForm();
    _initAccordion();

    doc.querySelector('.menu-btn').onclick = () => {
      doc.getElementById('sidebar').classList.toggle('hidden');
    };
  })();
})(document);
