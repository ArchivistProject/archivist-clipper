Archivist.form = {
  tabFormValues: {},
};

function addSavedFormInput(elementId, elementVal) {
  if (Archivist.form.tabFormValues[Archivist.urlHash] == null) {
    Archivist.form.tabFormValues[Archivist.urlHash] = {};
    Archivist.form.tabFormValues[Archivist.urlHash].fields = {};
  }

  Archivist.form.tabFormValues[Archivist.urlHash].fields[elementId] = elementVal;

  chrome.storage.local.set({ [Archivist.urlHash]: Archivist.form.tabFormValues[Archivist.urlHash] }, () => {
    console.log('Settings saved');
  });
}

function saveField(element) {
  addSavedFormInput(element.id, element.value);
}

Archivist.form.setInputEvents = () => {
  $('input, textarea').on(
    'keyup, change', (event) => {
      const changedElement = event.target;
      saveField(changedElement);
    });
}

// Adds the given element to the end of the form
Archivist.form.prependElement = (element) => {
  const form = $('#metadata-form');

  form.prepend(element);
}

Archivist.form.getFormData = () => {
  const formElements = $('.metadata_item input');

  const formData = {};
  // create object with name, type, value, group=generic

  formElements.each((element) => {
    const curElement = formElements[element];
    formData[curElement.getAttribute('name')] = curElement.value;
  });

  return formData;
}

// Adds the given elements to the beginning of the form
Archivist.form.prependElements = (elements) => {
  const form = $('#metadata-form');

  elements.forEach((element) => {
    form.prepend(element);
  });
}
