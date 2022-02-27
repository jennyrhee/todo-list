import './css/style.css';
import {Task, Project} from './task.js';

((doc) => {
  const _projects = [Project('My Tasks')];

  const _toggleForm = (formId) => {
    if (formId === 'task-form') {
      doc.getElementById('add-task-btn').style.display = 'none';
    }
    doc.getElementById(formId).classList.toggle('show');
  }
  const _disableBtnWhenEmpty = (id, btn) => {
    doc.getElementById(id).addEventListener('keyup', (e) => {
      if (e.target.value === '') {
        doc.getElementById(btn).disabled = true;
      } else {
        doc.getElementById(btn).disabled = false;
      }
    });
  }
  const _createProject = (form) => {
    const newProject = Project(form.elements['project'].value);
    _projects.push(newProject);
    return newProject;
  }
  const _createDiv = (obj, className) => {
    const ele = doc.createElement('div');
    ele.classList.add(className);
    ele.textContent = obj.getName();
    if (className === 'project') {
      if (doc.getElementById('projects-accordion').classList.contains('is-open')) {
        ele.style.maxHeight = '21px';
      }
      ele.addEventListener('click', _loadProjectTasks)
    }
    return ele
  }
  const _addToDropdown = (project) => {
    const dropdown = doc.getElementById('project-list');
    const choice = doc.createElement('option');
    choice.value = project.getName();
    choice.textContent = project.getName();
    dropdown.appendChild(choice);
  }
  const _cancelForm = (id, form) => {
    _toggleForm(id);
    form.reset();
    if (id === 'task-form') {
      doc.getElementById('add-task-btn').style.display = 'block';
    }
  }
  const _initProjectForm = () => {
    doc.getElementById('add-project-btn').onclick = _toggleForm.bind(this, 'project-form');
    _disableBtnWhenEmpty('project', 'submit-project-btn');

    const form = doc.getElementById('project-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newProject = _createProject(form);
      _addToDropdown(newProject);
      doc.getElementById('projects').appendChild(_createDiv(newProject, 'project'));
      
      form.reset();
    });

    doc.getElementById('cancel-project-btn').onclick = _cancelForm.bind(
      this, 'project-form', form
    );
  }
  const _createTask = (form) => {
    const newTask = Task(
      form.elements['task'].value,
      form.elements['description'].value,
      form.elements['due-date'].value,
      form.elements['project-list'].value,
      form.elements['priority'].value
    );
    const project = _projects.find(obj => 
      obj.getName() === form.elements['project-list'].value
    );
    project.addTask(newTask);

    return newTask;
  }
  const _addTask = (task, taskContainer) => {
    const container = doc.createElement('div');
    container.classList.add('container');

    const check = doc.createElement('input');
    check.type = 'checkbox';
    check.id = task.getName();

    const label = doc.createElement('label');
    label.htmlFor = task.getName();
    label.classList.add('task');
    label.textContent = task.getName();

    container.appendChild(check);
    container.appendChild(label);
    taskContainer.appendChild(container);
  }
  const _initTaskForm = () => {
    doc.getElementById('add-task-btn').onclick = _toggleForm.bind(this, 'task-form');
    _projects.forEach(project => _addToDropdown(project));

    const form = doc.getElementById('task-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const newTask = _createTask(form);
      _addTask(newTask, doc.querySelector('.task-container'));
      form.reset();
    });

    _disableBtnWhenEmpty('task', 'submit-task-btn');
    doc.getElementById('cancel-task-btn').onclick = _cancelForm.bind(
      this, 'task-form', form
    );
  }
  const _addProjects = (projects) => {
    _projects.forEach((project) => {
      const div = _createDiv(project, 'project')
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
  const _loadProjectTasks = (e) => {
    const projectName = e.target.textContent;
    const project = _projects.find(obj => obj.getName() === projectName);

    doc.querySelector('.title').textContent = projectName;
    const container = doc.querySelector('.task-container');
    container.textContent = '';
    project.getTasks().forEach(task => _addTask(task, container));
  }

  (() => {
    _initProjectForm();
    _initTaskForm();
    _initAccordion();

    doc.querySelector('.menu-btn').onclick = () => {
      doc.getElementById('sidebar').classList.toggle('hidden');
    }
  })();

  return {
    
  };
})(document);