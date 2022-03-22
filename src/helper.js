function toggleClass(className, id = null, element = null, query = null) {
  if (id) document.getElementById(id).classList.toggle(className);
  if (element) element.classList.toggle(className);
  if (query) document.querySelector(query).classList.toggle('hidden');
}

function createCustomElement(
  type = 'div',
  classes = null,
  content = null,
  attributes = null,
) {
  const element = document.createElement(type);
  if (classes) element.classList.add(...classes);
  if (content) element.textContent = content;
  if (attributes) {
    Object.entries(attributes).forEach((entry) => {
      const [attr, value] = entry;
      element.setAttribute(attr, value);
    });
  }

  if (classes && classes.includes('project-wrapper')) {
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
