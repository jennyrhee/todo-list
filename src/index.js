import './css/style.css';
import {Task, Project} from './task.js';

((doc) => {
  let _projects = [Project('My Tasks')];

  const _showForm = () => {
    doc.getElementById('task-form').style.display = 'flex';
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
    _initAccordion();
    doc.getElementById('add-task-btn').onclick = _showForm;
  })();

  return {
    
  };
})(document);