function createCustomElement(type = 'div', className = null, content = null) {
  const element = document.createElement(type);
  if (className) element.classList.add(className);
  if (content) element.textContent = content;

  if (className === 'project') {
    if (
      document.getElementById('projects-accordion').classList.contains('is-open')
    ) {
      element.style.maxHeight = '21px';
    }
  }
  return element;
}

export default createCustomElement;
