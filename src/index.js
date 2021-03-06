/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import { titleCase } from 'title-case';
import { isEqual, isBefore, differenceInCalendarDays } from 'date-fns';
import './css/style.css';
import storage from './storage';
import { toggleClass, createCustomElement, bindFormFunction } from './helper';

((doc) => {
  const _toggleForm = (formId) => {
    if (formId === 'task-form') {
      doc.getElementById('add-task-btn').style.display = 'none';
    } else if (['project-form', 'edit-project-form', 'edit-task-form'].includes(formId)) {
      toggleClass('show', 'mask');
    }
    toggleClass('show', formId);
  };
  const _disableBtnWhenEmpty = (id, btn) => {
    doc.getElementById(id).addEventListener('keyup', (e) => {
      doc.getElementById(btn).disabled = e.target.value === '';
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
    const detailsContainer = createCustomElement(
      'div',
      ['details-container', 'hidden'],
      null,
      { 'task-id': task.taskId },
    );

    const colOne = doc.createElement('div');
    const colTwo = doc.createElement('div');
    Object.entries(task.getDetails()).forEach((entry, i) => {
      const [key, detail] = entry;
      const div = createCustomElement('div', null, `${titleCase(key)}: ${detail}`);
      if (i < 2) colOne.appendChild(div);
      else colTwo.appendChild(div);
    });
    detailsContainer.appendChild(colOne);
    detailsContainer.appendChild(colTwo);

    return detailsContainer;
  };
  const _createTaskItem = (task) => {
    const taskItem = createCustomElement('div', ['task-item']);

    const check = createCustomElement('input', null, null, { id: task.taskId });
    check.type = 'checkbox';
    check.onclick = () => {
      storage.toggleTask(task);
      toggleClass('completed', null, taskItem);
    };

    const label = createCustomElement('label', ['task'], task.name, {
      project: task.project,
      'task-id': task.taskId,
    });
    label.onclick = () => toggleClass('hidden', null, null, `.details-container[task-id=${task.taskId}]`);

    if (task.isCompleted) {
      check.checked = true;
      taskItem.classList.add('completed');
    }

    taskItem.appendChild(check);
    taskItem.appendChild(label);

    return taskItem;
  };
  const _createTaskIcon = (className, fontAwesomeClass = null) => {
    const icon = createCustomElement('i', [className]);
    if (fontAwesomeClass) icon.classList.add('fa', fontAwesomeClass);
    return icon;
  };
  const _editTask = (task) => {
    _toggleForm('edit-task-form');
    const form = doc.getElementById('edit-task-form');
    form.setAttribute('project', task.project);
    form.setAttribute('task-id', task.taskId);
    const details = task.getDetails();
    // Prefill the form with task details
    // eslint-disable-next-line no-restricted-syntax
    for (const prop in details) {
      if (details[prop]) {
        doc.getElementById(`edit-${prop}`).value = prop === 'due'
          ? new Date(details[prop]).toISOString().slice(0, 16)
          : details[prop];
      }
    }
  };
  const _deleteTask = (container, task) => {
    const projectName = doc
      .querySelector(`label.task[task-id=${task.taskId}]`)
      .getAttribute('project');
    _updateNTasks(projectName, true);
    storage.deleteTask(projectName, task.taskId);
    // Removes divider
    container.nextElementSibling.remove();
    container.remove();
  };
  const _createIconContainer = (container, task) => {
    const iconContainer = createCustomElement('div', ['icon-container']);
    const iconObj = {
      'edit-task-btn': 'fa-pen-to-square',
      // 'move-project-btn': 'fa-arrow-right-from-bracket',
      'trash-btn': 'fa-trash',
    };
    Object.entries(iconObj).forEach((entry) => {
      const [btnClass, fontAwesomeClass] = entry;
      const icon = _createTaskIcon(btnClass, fontAwesomeClass);
      if (btnClass === 'edit-task-btn') {
        icon.onclick = _editTask.bind(this, task);
      } else if (btnClass === 'trash-btn') {
        icon.onclick = _deleteTask.bind(this, container, task);
      }
      iconContainer.appendChild(icon);
    });
    return iconContainer;
  };
  const _createTaskDivs = (task, taskContainer) => {
    const container = createCustomElement('div', ['container'], null, { 'task-id': task.taskId });

    const taskWrapper = createCustomElement('div', ['task-wrapper']);
    taskWrapper.appendChild(_createTaskItem(task));
    taskWrapper.appendChild(_createIconContainer(container, task));

    container.appendChild(taskWrapper);
    container.appendChild(_createTaskDetails(task));
    taskContainer.appendChild(container);

    taskContainer.appendChild(createCustomElement('hr', ['divider']));
  };
  const _highlightActive = (e) => {
    const active = e.target.matches('.project') ? e.target.parentNode : e.target;
    toggleClass('active', null, active);
    const wrappers = doc.querySelectorAll('.project-wrapper');
    wrappers.forEach((wrapper) => {
      if (wrapper.classList.contains('active') && wrapper !== active) {
        toggleClass('active', null, wrapper);
      }
    });
    const dateOrgs = doc.querySelectorAll('.date-org');
    dateOrgs.forEach((dateOrg) => {
      if (dateOrg.classList.contains('active') && dateOrg !== active) {
        toggleClass('active', null, dateOrg);
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
  const _addToDropdown = (listId, project) => {
    const dropdown = doc.getElementById(listId);
    const choice = createCustomElement('option', null, project.name);
    choice.value = project.name;
    dropdown.appendChild(choice);
  };
  const _cancelForm = (id) => {
    _toggleForm(id);
    doc.getElementById(id).reset();
    if (id === 'task-form') {
      doc.getElementById('add-task-btn').style.display = 'block';
    }
  };
  const _createProjectMenuContent = (projectName) => {
    const content = createCustomElement('div', ['project-menu-content']);
    const edit = createCustomElement(
      'div',
      ['option'],
      'Edit project',
      { id: 'edit-option' },
    );
    const del = createCustomElement(
      'div',
      ['option'],
      'Delete project',
      { id: 'delete-option' },
    );
    edit.onclick = () => {
      _toggleForm('edit-project-form');
      doc.getElementById('new-name').value = projectName;
      doc.querySelector('#edit-project-form > h2').textContent = `Edit: ${projectName}`;
    };
    del.onclick = () => {
      storage.deleteProject(projectName);
      doc.querySelector(`#project-list > option[value="${projectName}"`).remove();
      doc.querySelector(`#edit-project > option[value="${projectName}"`).remove();
      content.parentNode.parentNode.remove();
    };
    content.appendChild(edit);
    content.appendChild(del);

    return content;
  };
  const _createProjectMenu = (projectName) => {
    const menu = createCustomElement('div', ['project-menu']);
    const btn = createCustomElement('div', ['project-menu-btn']);
    const content = _createProjectMenuContent(projectName);

    menu.onclick = () => toggleClass('show', null, content);

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
    const wrapper = createCustomElement('div', ['project-wrapper']);
    const projectName = createCustomElement(
      'div',
      ['project'],
      project.name,
      null,
      { 'project-name': project.name },
    );
    projectName.addEventListener('click', _loadProjectTasks);
    wrapper.appendChild(projectName);

    const nTasks = createCustomElement(
      'div',
      ['n-tasks'],
      project.length.toString(),
      { 'project-name': project.name },
    );
    wrapper.appendChild(nTasks);

    wrapper.appendChild(_createProjectMenu(project.name));

    return wrapper;
  };
  const _editProject = (projectName) => {
    const oldProjectName = doc
      .querySelector('#edit-project-form > h2')
      .textContent.split('Edit: ')[1];
    storage.updateProject(oldProjectName, projectName);

    const sidebarItem = doc.querySelector(`.project[project-name="${oldProjectName}"`);
    sidebarItem.textContent = projectName;
    sidebarItem.setAttribute('project-name', projectName);

    const option = doc.querySelector(`#project-list > option[value="${oldProjectName}"]`);
    option.value = projectName;
    option.textContent = projectName;
  };
  const _initProjectForm = (inputId, submitBtn, cancelBtn, formId, add = true) => {
    _disableBtnWhenEmpty(inputId, submitBtn);

    const form = doc.getElementById(formId);
    form.addEventListener('submit', (e) => {
      const projectName = add ? form.elements.project.value : form.elements['new-name'].value;
      if (storage.projects.find((project) => project.name === projectName)) {
        const field = doc.getElementById(inputId);
        field.setCustomValidity('A project with this name already exists!');
        field.reportValidity();
        e.preventDefault();
      } else {
        e.preventDefault();
        if (add) {
          const newProject = storage.createProject(form);
          _addToDropdown('project-list', newProject);
          _addToDropdown('edit-project', newProject);

          doc
            .getElementById('projects')
            .appendChild(_createProjectWrapper(newProject));
        } else _editProject(projectName);

        form.reset();
        _toggleForm(formId);
      }
    });

    bindFormFunction(cancelBtn, _cancelForm, formId);
  };
  const _initTaskForm = (inputId, submitBtn, cancelBtn, listId, formId, add = true) => {
    storage.projects.forEach((project) => _addToDropdown(listId, project));

    const form = doc.getElementById(formId);
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (add) {
        const newTask = storage.createTask(form);
        // Only add task to page if new task is in current project
        const current = doc.querySelector('.title').textContent;
        if (form.elements[listId].value === current || current === 'Today') {
          _createTaskDivs(newTask, doc.querySelector('.task-container'));
        }
        _updateNTasks(form.elements[listId].value);
      } else {
        const projectName = form.getAttribute('project');
        const taskId = form.getAttribute('task-id');
        storage.updateTask(projectName, taskId, form);
        const detailsContainer = doc.querySelector(`.details-container[task-id="${taskId}"]`);
        detailsContainer.replaceWith(_createTaskDetails(storage.getTask(projectName, taskId)));
        doc.querySelector(`label[task-id="${taskId}"`).textContent = form.elements['edit-name'].value;

        if (projectName !== form.elements['edit-project'].value) {
          _updateNTasks(projectName, true);
          _updateNTasks(form.elements['edit-project'].value);
          // Remove the task from the page if on former project
          if (doc.querySelector('.title').textContent === projectName) {
            const container = doc.querySelector(`.container[task-id="${taskId}"]`);
            // Removes divider
            container.nextElementSibling.remove();
            container.remove();
          }
        }
        _toggleForm(formId);
      }

      form.reset();
    });

    _disableBtnWhenEmpty(inputId, submitBtn);
    bindFormFunction(cancelBtn, _cancelForm, formId);
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
      toggleClass('is-open', null, accordion);
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
    _initProjectForm('project', 'submit-project-btn', 'cancel-project-btn', 'project-form');
    _initProjectForm(
      'new-name',
      'edit-project-btn',
      'cancel-edit-project-btn',
      'edit-project-form',
      false,
    );
    _initTaskForm('task', 'submit-task-btn', 'cancel-task-btn', 'project-list', 'task-form');
    _initTaskForm(
      'edit-name',
      'edit-task-btn',
      'cancel-edit-task-btn',
      'edit-project',
      'edit-task-form',
      false,
    );
    _initAccordion();
    _initDateOrg();

    bindFormFunction('add-project-btn', _toggleForm, 'project-form');
    bindFormFunction('add-task-btn', _toggleForm, 'task-form');
    doc.querySelector('.menu-btn').onclick = () => toggleClass('hidden', 'sidebar');
  })();
})(document);
