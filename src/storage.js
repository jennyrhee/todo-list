import { Project, Task } from './task';

function parseJSON() {
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
}

export default parseJSON;
