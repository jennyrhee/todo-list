/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import { titleCase } from 'title-case';
import { isEqual, isBefore, differenceInCalendarDays } from 'date-fns';
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
  const _updateNTasks = (projectName, isRemoved = false) => {
    const nTasks = doc.querySelector(`.n-tasks[project-name="${projectName}"]`);
    if (isRemoved) nTasks.textContent = Number(nTasks.textContent) - 1;
    else nTasks.textContent = Number(nTasks.textContent) + 1;
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
    check.onclick = () => {
      storage.toggleTask(task);
      taskItem.classList.toggle('completed');
    };

    const label = createCustomElement('label', 'task', task.name);
    label.setAttribute('project', task.project);
    label.setAttribute('task-id', task.taskId);
    label.onclick = () => {
      doc
        .querySelector(`.details-container[task-id=${task.taskId}]`)
        .classList.toggle('hidden');
    };

    if (task.isCompleted) {
      check.checked = true;
      taskItem.classList.add('completed');
    }

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
      // 'move-project-btn': 'fa-arrow-right-from-bracket',
      'trash-btn': 'fa-trash',
    };
    Object.entries(iconObj).forEach((entry, index) => {
      const [btnClass, fontAwesomeClass] = entry;
      const icon = _createTaskIcon(btnClass, fontAwesomeClass);
      if (index === 1) {
        icon.onclick = () => {
          const projectName = doc
            .querySelector(`label.task[task-id=${task.taskId}]`)
            .getAttribute('project');
          _updateNTasks(projectName, true);
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
  const _highlightActive = (e) => {
    const active = e.target.matches('.project') ? e.target.parentNode : e.target;
    active.classList.toggle('active');
    const wrappers = doc.querySelectorAll('.project-wrapper');
    wrappers.forEach((wrapper) => {
      if (wrapper.classList.contains('active') && wrapper !== active) {
        wrapper.classList.toggle('active');
      }
    });
    const dateOrgs = doc.querySelectorAll('.date-org');
    dateOrgs.forEach((dateOrg) => {
      if (dateOrg.classList.contains('active') && dateOrg !== active) {
        dateOrg.classList.toggle('active');
      }
    });
  };
  const _loadProjectTasks = (e) => {
    _highlightActive(e);
    const projectName = e.target.textContent;
    const project = storage.getProject(projectName);

    doc.querySelector('.title').textContent = projectName;
    const container = doc.querySelector('.task-container');
    container.textContent = '';
    project.tasks.forEach((task) => _createTaskDivs(task, container));
    // Change default project to currently selected project
    doc.getElementById('project-list').selectedIndex = storage.projects.findIndex(
      (proj) => proj.name === projectName,
    );
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
  const _createProjectMenuContent = (projectName) => {
    const content = createCustomElement('div', 'project-menu-content');
    const edit = createCustomElement(
      'div',
      'option',
      'Edit project',
      'edit-option',
    );
    const del = createCustomElement(
      'div',
      'option',
      'Delete project',
      'delete-option',
    );
    del.onclick = () => {
      storage.deleteProject(projectName);
      content.parentNode.parentNode.remove();
    };
    content.appendChild(edit);
    content.appendChild(del);

    return content;
  };
  const _createProjectMenu = (projectName) => {
    const menu = createCustomElement('div', 'project-menu');
    // menu.setAttribute('project-name', projectName);
    const btn = createCustomElement('div', 'project-menu-btn');
    const content = _createProjectMenuContent(projectName);

    menu.onclick = () => {
      content.classList.toggle('show');
    };
    // TODO: Doesn't close other project menus if open
    doc.addEventListener('click', (e) => {
      if (
        !e.target.matches('.project-menu-btn')
        && content.classList.contains('show')
      ) content.classList.remove('show');
    });
    menu.appendChild(btn);
    menu.appendChild(content);

    return menu;
  };
  const _createProjectWrapper = (project) => {
    const wrapper = createCustomElement('div', 'project-wrapper');
    const projectName = createCustomElement('div', 'project', project.name);
    projectName.addEventListener('click', _loadProjectTasks);
    wrapper.appendChild(projectName);

    const nTasks = createCustomElement(
      'div',
      'n-tasks',
      project.length.toString(),
    );
    nTasks.setAttribute('project-name', project.name);
    wrapper.appendChild(nTasks);

    wrapper.appendChild(_createProjectMenu(project.name));

    return wrapper;
  };
  const _initProjectForm = () => {
    doc.getElementById('add-project-btn').onclick = _toggleForm.bind(
      this,
      'project-form',
    );
    _disableBtnWhenEmpty('project', 'submit-project-btn');

    const form = doc.getElementById('project-form');
    form.addEventListener('submit', (e) => {
      if (
        storage.projects.find(
          (project) => project.name === form.elements.project.value,
        )
      ) {
        const field = doc.getElementById('project');
        field.setCustomValidity('A project with this name already exists!');
        field.reportValidity();
        e.preventDefault();
      } else {
        e.preventDefault();
        const newProject = storage.createProject(form);
        _addToDropdown(newProject);

        doc
          .getElementById('projects')
          .appendChild(_createProjectWrapper(newProject));

        form.reset();
        _toggleForm('project-form');
      }
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
      if (
        form.elements['project-list'].value
        === doc.querySelector('.title').textContent
      ) {
        _createTaskDivs(newTask, doc.querySelector('.task-container'));
      }
      _updateNTasks(form.elements['project-list'].value);
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
      projects.appendChild(_createProjectWrapper(project));
    });
  };
  const _initAccordion = () => {
    const accordion = doc.getElementById('projects-accordion');
    _addProjects(doc.getElementById('projects'));
    accordion.onclick = () => {
      accordion.classList.toggle('is-open');
      const projects = doc.querySelectorAll('.project-wrapper');
      projects.forEach((project) => {
        if (project.style.maxHeight) {
          project.style.padding = null;
          project.style.maxHeight = null;
        } else {
          project.style.padding = '5px';
          project.style.maxHeight = `${project.scrollHeight + 20}px`;
        }
      });
    };
  };
  const _showDateOrg = (dateCategory) => {
    doc.querySelector('.title').textContent = dateCategory === 'Today'
      ? dateCategory
      : 'Upcoming - due in the next 7 days';
    const container = doc.querySelector('.task-container');
    container.textContent = '';

    const tasks = [];
    storage.projects.forEach((project) => project.tasks.forEach((task) => {
      if (dateCategory === 'Today'
        && (isEqual(new Date(task.dueDate), new Date())
          || isBefore(new Date(task.dueDate), new Date())
          || !task.dueDate)) {
        tasks.push(task);
      } else if (dateCategory === 'Upcoming'
        && differenceInCalendarDays(new Date(task.dueDate), new Date()) >= 0
        && differenceInCalendarDays(new Date(task.dueDate), new Date()) <= 7) {
        tasks.push(task);
      }
    }));
    tasks.forEach((task) => _createTaskDivs(task, container));
  };
  const _initDateOrg = () => {
    const dateOrgs = doc.querySelectorAll('.date-org');
    dateOrgs.forEach((dateOrg) => dateOrg.addEventListener('click', (e) => {
      _highlightActive(e);
      _showDateOrg(e.target.textContent);
    }));
  };

  (() => {
    _showDateOrg('Today');
    _initProjectForm();
    _initTaskForm();
    _initAccordion();
    _initDateOrg();

    doc.querySelector('.menu-btn').onclick = () => {
      doc.getElementById('sidebar').classList.toggle('hidden');
    };
  })();
})(document);
