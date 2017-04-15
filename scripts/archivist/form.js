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
