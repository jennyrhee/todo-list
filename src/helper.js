function createCustomElement(
  type = 'div',
  className = null,
  content = null,
  id = null,
) {
  const element = document.createElement(type);
  if (className) element.classList.add(className);
  if (content) element.textContent = content;
  if (id) element.setAttribute('id', id);

  if (className === 'project-wrapper') {
    if (
      document
        .getElementById('projects-accordion')
        .classList.contains('is-open')
    ) {
      element.style.padding = '5px';
      element.style.maxHeight = `${element.scrollHeight + 30}px`;
    }
  }
  return element;
}

export default createCustomElement;
