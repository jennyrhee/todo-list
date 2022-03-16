function toggleClass(className, id = null, element = null, query = null) {
  if (id) document.getElementById(id).classList.toggle(className);
  if (element) element.classList.toggle(className);
  if (query) document.querySelector(query).classList.toggle('hidden');
}

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

function bindFormFunction(id, fn, formId) {
  document.getElementById(id).onclick = fn.bind(this, formId);
}

export { toggleClass, createCustomElement, bindFormFunction };
